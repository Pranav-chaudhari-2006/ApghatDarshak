'use strict';

const supabase              = require('../config/db');
const { computeRoute, extractBlackspots, buildGraph } = require('../services/astar');

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

        // ── 2. Run A* for all 3 modes in parallel ────────────────────────
        const args = [nodes, roads, accidents, sourceLat, sourceLng, destLat, destLng];

        const [safestResult, shortestResult, balancedResult] = await Promise.all([
            Promise.resolve(computeRoute(...args, 'safest',   vehicle)),
            Promise.resolve(computeRoute(...args, 'shortest', vehicle)),
            Promise.resolve(computeRoute(...args, 'balanced', vehicle)),
        ]);

        // Ensure at least one route was found
        const primaryResult = { safest: safestResult, shortest: shortestResult, balanced: balancedResult }[mode]
                           || safestResult || shortestResult || balancedResult;

        if (!primaryResult) {
            return res.status(404).json({
                success : false,
                message : 'No route found — the graph may be disconnected for these coordinates. Try major Pune junctions.',
            });
        }

        // ── 3. Extract blackspots along the primary route's path nodes ───
        const { nodeMap } = buildGraph(nodes, roads, accidents);
        const blackspots  = extractBlackspots(
            primaryResult.pathNodeIds,
            roads,
            accidents,
            nodeMap,
            mode
        );

        console.log(`✅ A* route (${mode}): ${primaryResult.distanceKm} km, ${primaryResult.durationMin} min, ${blackspots.length} blackspots`);

        // ── 4. Build response ─────────────────────────────────────────────
        const routes = {};
        if (safestResult)   routes.safest   = { geometry: safestResult.geometry,   distanceKm: safestResult.distanceKm,   durationMin: safestResult.durationMin,   totalRisk: safestResult.totalRisk };
        if (shortestResult) routes.shortest = { geometry: shortestResult.geometry, distanceKm: shortestResult.distanceKm, durationMin: shortestResult.durationMin, totalRisk: shortestResult.totalRisk };
        if (balancedResult) routes.balanced = { geometry: balancedResult.geometry, distanceKm: balancedResult.distanceKm, durationMin: balancedResult.durationMin, totalRisk: balancedResult.totalRisk };

        return res.json({
            success    : true,
            algorithm  : 'A*',
            mode,
            routes,
            blackspots,
            totalRisk  : primaryResult.totalRisk,
            snapped    : {
                source      : { name: primaryResult.sourceNode?.name, lat: primaryResult.sourceNode?.latitude, lng: primaryResult.sourceNode?.longitude },
                destination : { name: primaryResult.destNode?.name,   lat: primaryResult.destNode?.latitude,   lng: primaryResult.destNode?.longitude   },
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
            .order('fatal_count', { ascending: false })
            .limit(50);

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
            .sort((a, b) => b.risk - a.risk)
            .slice(0, 15);

        res.json(result);
    } catch (e) {
        console.error('getBlackspots error:', e);
        res.json([]);
    }
};
