'use strict';

const supabase              = require('../config/db');
const { computeRoute, extractBlackspots, buildGraph, runAstar, findNearestNode } = require('../services/astar');

/**
 * POST /api/route
 *
 * Single endpoint that:
 *  1. Loads the full Pune road graph from Supabase
 *  2. Runs A* for all three modes (shortest, safest, balanced) in parallel
 *  3. Extracts blackspots along the primary (selected) route
 *  4. Returns everything to the frontend in one response
 *
 * Body: { sourceLat, sourceLng, destLat, destLng, mode, vehicle }
 */
exports.computeAstarRoute = async (req, res) => {
    try {
        const { sourceLat, sourceLng, destLat, destLng, mode = 'safest', vehicle = 'car' } = req.body;

        if (sourceLat == null || sourceLng == null || destLat == null || destLng == null) {
            return res.status(400).json({ success: false, message: 'Missing coordinates' });
        }

        // ── 1. Load full graph from Supabase ──────────────────────────────
        const [nodesRes, roadsRes, accidentsRes] = await Promise.all([
            supabase.from('nodes').select('id, name, latitude, longitude'),
            supabase.from('roads').select('id, name, start_node_id, end_node_id, distance, risk_score'),
            supabase.from('accidents').select('road_id, minor_count, major_count, fatal_count'),
        ]);

        if (nodesRes.error)     throw nodesRes.error;
        if (roadsRes.error)     throw roadsRes.error;
        if (accidentsRes.error) throw accidentsRes.error;

        const nodes     = nodesRes.data     || [];
        const roads     = roadsRes.data     || [];
        const accidents = accidentsRes.data || [];

        if (nodes.length === 0) {
            return res.status(404).json({ success: false, message: 'No nodes in database' });
        }

        console.log(`🔍 A* graph loaded: ${nodes.length} nodes, ${roads.length} roads, ${accidents.length} accident records`);

        // ── 2. Build the graph once ──────────────────────────────────────
        const graphData = buildGraph(nodes, roads, accidents);
        const { nodeMap, adjacency } = graphData;

        // ── Helper: get K nearest nodes by haversine distance ────────────
        const haversineDeg = (lat1, lng1, lat2, lng2) => {
            const R = 6371, toR = x => x * Math.PI / 180;
            const dLat = toR(lat2 - lat1), dLng = toR(lng2 - lng1);
            const a = Math.sin(dLat/2)**2 + Math.cos(toR(lat1)) * Math.cos(toR(lat2)) * Math.sin(dLng/2)**2;
            return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        };

        const getKNearest = (lat, lng, k = 10) =>
            nodes
                .map(n => ({ node: n, dist: haversineDeg(lat, lng, n.latitude, n.longitude) }))
                .sort((a, b) => a.dist - b.dist)
                .slice(0, k)
                .map(x => x.node);

        // ── 3. Snap source & destination to nearest nodes ─────────────────
        const srcCandidates  = getKNearest(sourceLat, sourceLng, 10);
        const destCandidates = getKNearest(destLat,   destLng,   10);

        if (srcCandidates.length === 0 || destCandidates.length === 0) {
            return res.status(404).json({ success: false, message: 'No road nodes found near these coordinates.' });
        }

        const primarySrc  = srcCandidates[0];   // The single nearest node
        const primaryDest = destCandidates[0];

        /**
         * Build a route result, anchoring geometry to the EXACT user coordinates.
         * Prepends [sourceLat, sourceLng] and appends [destLat, destLng] so
         * the polyline always starts and ends at the user-selected points.
         */
        const runMode = (modeType, srcNode, dstNode) => {
            const pathIds = runAstar(nodeMap, adjacency, srcNode.id, dstNode.id, modeType, vehicle);
            if (!pathIds) return null;

            const pathCoords = pathIds.map(id => [nodeMap[id].latitude, nodeMap[id].longitude]);

            // Anchor to exact user coordinates
            const geometry = [
                [sourceLat, sourceLng],                          // exact start
                ...pathCoords,
                [destLat, destLng]                               // exact end
            ];

            let totalDist = 0, totalRisk = 0;
            for (let i = 0; i < pathIds.length - 1; i++) {
                const edge = adjacency[pathIds[i]]?.find(e => e.toId === pathIds[i + 1]);
                if (edge) { totalDist += edge.distance; totalRisk += edge.risk; }
            }
            const durationMin = (totalDist / (vehicle === 'car' ? 30 : vehicle === 'bike' ? 18 : 5)) * 60;
            return {
                geometry,
                distanceKm : totalDist.toFixed(2),
                durationMin: durationMin.toFixed(1),
                totalRisk  : Math.round(totalRisk),
                pathNodeIds: pathIds
            };
        };

        // ── 4. Try EXACT nearest pair first (no fallback, no consent needed) ──
        let sourceNode = primarySrc, destNode = primaryDest;
        let isApproximate = false, approxMessage = null;

        let safestResult   = runMode('safest',   primarySrc, primaryDest);
        let shortestResult = runMode('shortest', primarySrc, primaryDest);
        let balancedResult = runMode('balanced', primarySrc, primaryDest);

        // ── 5. If exact pair fails, try K-nearest fallback ────────────────
        if (!safestResult && !shortestResult && !balancedResult) {
            let found = false;

            outerLoop:
            for (const src of srcCandidates) {
                for (const dst of destCandidates) {
                    if (src.id === dst.id) continue;
                    const testPath = runAstar(nodeMap, adjacency, src.id, dst.id, 'safest');
                    if (testPath) {
                        sourceNode     = src;
                        destNode       = dst;
                        safestResult   = runMode('safest',   src, dst);
                        shortestResult = runMode('shortest', src, dst);
                        balancedResult = runMode('balanced', src, dst);
                        isApproximate  = true;
                        approxMessage  = `No direct road path found between your exact locations. The nearest available route has been computed via "${src.name}" → "${dst.name}". The route still starts and ends at your selected points.`;
                        found = true;
                        break outerLoop;
                    }
                }
            }

            if (!found) {
                return res.status(404).json({
                    success: false,
                    message: `No route found — the road graph has no connection between "${primarySrc.name}" and "${primaryDest.name}". Try major junctions like Shivajinagar, Kothrud, or Hadapsar.`
                });
            }
        }

        console.log(`📍 Snapped: "${sourceNode.name}" ➔ "${destNode.name}"${isApproximate ? ' (approximate)' : ''}`);

        // ── 6. Extract blackspots from ALL routes ─────────────────────────
        const allPathIds = new Set([
            ...(safestResult?.pathNodeIds   || []),
            ...(shortestResult?.pathNodeIds || []),
            ...(balancedResult?.pathNodeIds || [])
        ]);

        const blackspots = extractBlackspots(
            Array.from(allPathIds),
            roads,
            accidents,
            nodeMap,
            mode
        );

        // ── 7. Build response ─────────────────────────────────────────────
        const routes = {};
        if (safestResult)   routes.safest   = { geometry: safestResult.geometry,   distanceKm: safestResult.distanceKm,   durationMin: safestResult.durationMin,   totalRisk: safestResult.totalRisk };
        if (shortestResult) routes.shortest = { geometry: shortestResult.geometry, distanceKm: shortestResult.distanceKm, durationMin: shortestResult.durationMin, totalRisk: shortestResult.totalRisk };
        if (balancedResult) routes.balanced = { geometry: balancedResult.geometry, distanceKm: balancedResult.distanceKm, durationMin: balancedResult.durationMin, totalRisk: balancedResult.totalRisk };

        const anyRoute = Object.values(routes)[0];
        if (!anyRoute) {
            return res.status(404).json({ success: false, message: 'No route variants could be built.' });
        }

        console.log(`✅ A* route: ${Object.keys(routes).length} variants, ${blackspots.length} blackspots${isApproximate ? ' [approximate]' : ''}`);

        return res.json({
            success       : true,
            algorithm     : 'A*',
            mode,
            routes,
            blackspots,
            totalRisk     : anyRoute.totalRisk,
            isApproximate,
            approxMessage,
            snapped: {
                source      : { name: sourceNode.name, lat: sourceNode.latitude, lng: sourceNode.longitude },
                destination : { name: destNode.name,   lat: destNode.latitude,   lng: destNode.longitude   },
            },
        });

    } catch (error) {
        console.error('❌ A* Route Error:', error);
        return res.status(500).json({ success: false, message: 'Routing engine error', error: error.message });
    }
};

/**
 * POST /api/compute-route  (kept for backward-compat — blackspot-only mode)
 */
exports.computeRoute = async (req, res) => {
    try {
        const { source, destination, mode = 'safest', routeGeometry } = req.body;
        if (!source || !destination) {
            return res.status(400).json({ success: false, message: 'Missing source or destination' });
        }

        const PADDING = 0.08;
        let minLat, maxLat, minLng, maxLng;

        if (routeGeometry?.length > 0) {
            minLat = routeGeometry.reduce((m, p) => Math.min(m, p[0]), routeGeometry[0][0]) - PADDING;
            maxLat = routeGeometry.reduce((m, p) => Math.max(m, p[0]), routeGeometry[0][0]) + PADDING;
            minLng = routeGeometry.reduce((m, p) => Math.min(m, p[1]), routeGeometry[0][1]) - PADDING;
            maxLng = routeGeometry.reduce((m, p) => Math.max(m, p[1]), routeGeometry[0][1]) + PADDING;
        } else {
            minLat = Math.min(source.lat, destination.lat) - PADDING;
            maxLat = Math.max(source.lat, destination.lat) + PADDING;
            minLng = Math.min(source.lng, destination.lng) - PADDING;
            maxLng = Math.max(source.lng, destination.lng) + PADDING;
        }

        const { data: nodes }     = await supabase.from('nodes').select('id, name, latitude, longitude').gte('latitude', minLat).lte('latitude', maxLat).gte('longitude', minLng).lte('longitude', maxLng);
        if (!nodes?.length) return res.json({ success: true, totalDistance: null, totalRisk: 0, blackspots: [] });

        const nodeIds               = nodes.map(n => n.id);
        const { data: roads }       = await supabase.from('roads').select('id, name, start_node_id, end_node_id, risk_score').in('start_node_id', nodeIds);
        if (!roads?.length)         return res.json({ success: true, totalDistance: null, totalRisk: 0, blackspots: [] });

        const roadIds               = roads.map(r => r.id);
        const { data: accidents }   = await supabase.from('accidents').select('road_id, minor_count, major_count, fatal_count').in('road_id', roadIds);

        const { nodeMap } = buildGraph(nodes, roads, accidents || []);

        const allNodeIds = routeGeometry?.length > 0
            ? nodes.filter(n => {
                const RADIUS = 6.0;
                return routeGeometry.some(([lat, lng]) => {
                    const dLat = (lat - n.latitude) * 111;
                    const dLng = (lng - n.longitude) * 111 * Math.cos(lat * Math.PI / 180);
                    return Math.sqrt(dLat ** 2 + dLng ** 2) <= RADIUS;
                });
              }).map(n => n.id)
            : nodeIds;

        const blackspots = extractBlackspots(allNodeIds, roads, accidents || [], nodeMap, mode);
        const totalRisk  = blackspots.reduce((s, b) => s + b.risk, 0);

        return res.json({ success: true, totalDistance: null, totalRisk, blackspots });

    } catch (error) {
        console.error('compute-route error:', error);
        return res.status(500).json({ success: false, message: 'Server error', blackspots: [] });
    }
};

/**
 * GET /api/blackspots — top blackspots across all of Pune
 */
exports.getBlackspots = async (req, res) => {
    try {
        const { data: accidents, error } = await supabase
            .from('accidents')
            .select('road_id, minor_count, major_count, fatal_count')
            .order('fatal_count', { ascending: false });

        if (error) throw error;

        const roadIds          = [...new Set(accidents.map(a => a.road_id))];
        const { data: roads }  = await supabase.from('roads').select('id, name, start_node_id').in('id', roadIds);
        const nodeIds          = [...new Set((roads || []).map(r => r.start_node_id))];
        const { data: nodes }  = await supabase.from('nodes').select('id, name, latitude, longitude').in('id', nodeIds);

        const nodeMap = {}; if (nodes) for (const n of nodes) nodeMap[n.id] = n;
        const roadMap = {}; if (roads) for (const r of roads) roadMap[r.id] = r;

        const result = accidents
            .map(a => {
                const road = roadMap[a.road_id]; if (!road) return null;
                const node = nodeMap[road.start_node_id]; if (!node) return null;
                return {
                    lat: node.latitude, lng: node.longitude,
                    risk: (a.minor_count) + (a.major_count * 3) + (a.fatal_count * 5),
                    fatal: a.fatal_count, major: a.major_count, minor: a.minor_count,
                    area: node.name,
                };
            })
            .filter(Boolean)
            .sort((a, b) => b.risk - a.risk);

        res.json({ blackspots: result });
    } catch (e) {
        console.error('getBlackspots error:', e);
        res.json([]);
    }
};
