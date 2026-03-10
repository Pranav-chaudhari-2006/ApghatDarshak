const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

/**
 * Given a route bounding box (from source + destination coords),
 * fetch all roads + their accident data from Supabase that fall
 * within a padded bounding box, then return them as blackspots.
 */
exports.computeRoute = async (req, res) => {
    try {
        const { source, destination, mode, routeGeometry } = req.body;

        if (!source || !destination) {
            return res.status(400).json({ success: false, message: 'Missing source or destination' });
        }

        // Build a bounding box to catch nearby road blackspots
        const PADDING = 0.08; // ~8km buffer
        let minLat, maxLat, minLng, maxLng;
        
        if (routeGeometry && routeGeometry.length > 0) {
            minLat = routeGeometry.reduce((min, p) => p[0] < min ? p[0] : min, routeGeometry[0][0]) - PADDING;
            maxLat = routeGeometry.reduce((max, p) => p[0] > max ? p[0] : max, routeGeometry[0][0]) + PADDING;
            minLng = routeGeometry.reduce((min, p) => p[1] < min ? p[1] : min, routeGeometry[0][1]) - PADDING;
            maxLng = routeGeometry.reduce((max, p) => p[1] > max ? p[1] : max, routeGeometry[0][1]) + PADDING;
        } else {
            minLat = Math.min(source.lat, destination.lat) - PADDING;
            maxLat = Math.max(source.lat, destination.lat) + PADDING;
            minLng = Math.min(source.lng, destination.lng) - PADDING;
            maxLng = Math.max(source.lng, destination.lng) + PADDING;
        }

        // Fetch nodes inside the bounding box
        const { data: nodes, error: nodeErr } = await supabase
            .from('nodes')
            .select('id, name, latitude, longitude')
            .gte('latitude', minLat)
            .lte('latitude', maxLat)
            .gte('longitude', minLng)
            .lte('longitude', maxLng);

        if (nodeErr) throw nodeErr;

        if (!nodes || nodes.length === 0) {
            // No nodes in region — return empty but valid response
            return res.json({
                success: true,
                totalDistance: null,
                totalRisk: 0,
                blackspots: [],
            });
        }

        const nodeIds = nodes.map(n => n.id);

        // Fetch roads whose start_node_id is inside the bounding box
        const { data: roads, error: roadErr } = await supabase
            .from('roads')
            .select('id, name, start_node_id, end_node_id, risk_score')
            .in('start_node_id', nodeIds);

        if (roadErr) throw roadErr;
        if (!roads || roads.length === 0) {
            return res.json({ success: true, totalDistance: null, totalRisk: 0, blackspots: [] });
        }

        const roadIds = roads.map(r => r.id);

        // Fetch accident records for those roads — sum by road
        const { data: accidents, error: accErr } = await supabase
            .from('accidents')
            .select('road_id, minor_count, major_count, fatal_count')
            .in('road_id', roadIds);

        if (accErr) throw accErr;

        // Aggregate accidents per road
        const accidentMap = {};
        for (const a of (accidents || [])) {
            if (!accidentMap[a.road_id]) {
                accidentMap[a.road_id] = { minor: 0, major: 0, fatal: 0 };
            }
            accidentMap[a.road_id].minor += a.minor_count || 0;
            accidentMap[a.road_id].major += a.major_count || 0;
            accidentMap[a.road_id].fatal += a.fatal_count || 0;
        }

        // Build a nodeId → node lookup
        const nodeMap = {};
        for (const n of nodes) nodeMap[n.id] = n;

        // Build blackspots: each road with accidents becomes a blackspot
        // positioned at its start_node lat/lng
        let blackspots = [];
        for (const road of roads) {
            const acc = accidentMap[road.id];
            if (!acc) continue; // Road has no accident records — skip

            const total = acc.minor + acc.major + acc.fatal;
            if (total === 0) continue;

            const node = nodeMap[road.start_node_id];
            if (!node) continue;

            const risk = (acc.minor * 1) + (acc.major * 3) + (acc.fatal * 5);

            // For 'safest' mode — still show blackspots so user is AWARE,
            // but filter out very low-risk ones (risk < 5)
            if (mode === 'safest' && risk < 5) continue;

            blackspots.push({
                lat: node.latitude,
                lng: node.longitude,
                risk,
                fatal: acc.fatal,
                major: acc.major,
                minor: acc.minor,
                area: node.name,
                roadName: road.name,
            });
        }

        // If frontend provided the actual computed path geometry, snap the blackspots directly to it
        if (routeGeometry && routeGeometry.length > 0) {
            const RADIUS_KM = 2.5; // Radius of 2.5km to capture "nearby" locations
            blackspots = blackspots.filter(spot => {
                // Downsample coordinates slightly for performance if route is very long
                const sampleRate = routeGeometry.length > 1000 ? 5 : 1;

                for (let i = 0; i < routeGeometry.length; i += sampleRate) {
                    const [lat, lng] = routeGeometry[i];
                    // Euclidean distance approx (1 deg lat ~ 111km)
                    const dLat = (lat - spot.lat) * 111;
                    const dLng = (lng - spot.lng) * 111 * Math.cos(lat * Math.PI / 180);
                    if (Math.sqrt(dLat * dLat + dLng * dLng) <= RADIUS_KM) {
                        return true;
                    }
                }
                return false;
            });
        }

        // Sort by risk descending — most dangerous first
        blackspots.sort((a, b) => b.risk - a.risk);

        // Cap at top 40 to avoid marker overload while showing enough nearby spots
        const topBlackspots = blackspots.slice(0, 40);

        const totalRisk = topBlackspots.reduce((sum, s) => sum + s.risk, 0);

        return res.json({
            success: true,
            totalDistance: null, // ORS handles actual distance
            totalRisk,
            blackspots: topBlackspots,
        });

    } catch (error) {
        console.error('Route Computation Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Computation Engine Error',
            blackspots: [],
        });
    }
};

exports.getBlackspots = async (req, res) => {
    try {
        // Returns top 10 highest-risk road nodes across all of Pune
        const { data: accidents, error } = await supabase
            .from('accidents')
            .select('road_id, minor_count, major_count, fatal_count')
            .order('fatal_count', { ascending: false })
            .limit(50);

        if (error) throw error;

        // Get roads for these accident records
        const roadIds = [...new Set(accidents.map(a => a.road_id))];
        const { data: roads } = await supabase
            .from('roads')
            .select('id, name, start_node_id, risk_score')
            .in('id', roadIds);

        const nodeIds = roads ? [...new Set(roads.map(r => r.start_node_id))] : [];
        const { data: nodes } = await supabase
            .from('nodes')
            .select('id, name, latitude, longitude')
            .in('id', nodeIds);

        const nodeMap = {};
        if (nodes) for (const n of nodes) nodeMap[n.id] = n;

        const roadMap = {};
        if (roads) for (const r of roads) roadMap[r.id] = r;

        const result = accidents
            .map(a => {
                const road = roadMap[a.road_id];
                if (!road) return null;
                const node = nodeMap[road.start_node_id];
                if (!node) return null;
                const risk = (a.minor_count * 1) + (a.major_count * 3) + (a.fatal_count * 5);
                return {
                    lat: node.latitude,
                    lng: node.longitude,
                    risk,
                    fatal: a.fatal_count,
                    major: a.major_count,
                    minor: a.minor_count,
                    area: node.name,
                };
            })
            .filter(Boolean)
            .sort((a, b) => b.risk - a.risk)
            .slice(0, 10);

        res.json(result);
    } catch (e) {
        console.error('getBlackspots error:', e);
        res.json([]);
    }
};
