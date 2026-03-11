'use strict';

/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║         ApghatDarshak — A* Routing Engine                   ║
 * ╠══════════════════════════════════════════════════════════════╣
 * ║ Replaces Dijkstra with A* (A-Star) for significantly better ║
 * ║ performance on geographic graphs.                           ║
 * ║                                                             ║
 * ║ A* improves on Dijkstra by using a HEURISTIC (Haversine     ║
 * ║ straight-line distance to goal) to guide the search         ║
 * ║ toward the destination, avoiding unnecessary exploration.   ║
 * ║ Typically 2-5× faster on sparse geographic graphs.         ║
 * ║                                                             ║
 * ║ Three routing modes:                                        ║
 * ║  • shortest  — minimises total road distance (km)           ║
 * ║  • safest    — minimises accident risk score                ║
 * ║  • balanced  — weighted combination of distance + risk      ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

// ─────────────────────────────────────────────────────────────────────────────
// MIN-HEAP (Priority Queue) — O(log n) push/pop for A* open set
// ─────────────────────────────────────────────────────────────────────────────

class MinHeap {
    constructor() { this._data = []; }

    get size() { return this._data.length; }
    isEmpty()  { return this._data.length === 0; }

    push(item) {
        this._data.push(item);
        this._bubbleUp(this._data.length - 1);
    }

    pop() {
        if (this.isEmpty()) return null;
        const top  = this._data[0];
        const last = this._data.pop();
        if (this._data.length > 0) {
            this._data[0] = last;
            this._sinkDown(0);
        }
        return top;
    }

    _bubbleUp(i) {
        while (i > 0) {
            const parent = (i - 1) >> 1;
            if (this._data[parent].f <= this._data[i].f) break;
            [this._data[parent], this._data[i]] = [this._data[i], this._data[parent]];
            i = parent;
        }
    }

    _sinkDown(i) {
        const n = this._data.length;
        for (;;) {
            let min = i;
            const l = (i << 1) + 1, r = (i << 1) + 2;
            if (l < n && this._data[l].f < this._data[min].f) min = l;
            if (r < n && this._data[r].f < this._data[min].f) min = r;
            if (min === i) break;
            [this._data[min], this._data[i]] = [this._data[i], this._data[min]];
            i = min;
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// GEOSPATIAL UTILITIES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Haversine formula — great-circle distance in km between two lat/lng points.
 * Used as the A* admissible heuristic: always ≤ actual road distance.
 */
function haversine(lat1, lng1, lat2, lng2) {
    const R    = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a    = Math.sin(dLat / 2) ** 2
               + Math.cos(lat1 * Math.PI / 180)
               * Math.cos(lat2 * Math.PI / 180)
               * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Snap a user-supplied lat/lng to the nearest node in the graph.
 */
function findNearestNode(nodes, lat, lng) {
    let nearest = null, minDist = Infinity;
    for (const node of nodes) {
        const d = haversine(lat, lng, node.latitude, node.longitude);
        if (d < minDist) { minDist = d; nearest = node; }
    }
    return nearest;
}

// ─────────────────────────────────────────────────────────────────────────────
// GRAPH BUILDER
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Build an adjacency list from Supabase data.
 * Roads are treated as BIDIRECTIONAL (most Pune city roads are two-way).
 *
 * @returns { nodeMap, adjacency, accidentMap }
 */
function buildGraph(nodes, roads, accidents) {
    // ── node lookup ──────────────────────────────────────────
    const nodeMap = {};
    for (const n of nodes) nodeMap[n.id] = n;

    // ── accident aggregation per road ────────────────────────
    const accidentMap = {};
    for (const a of accidents) {
        if (!accidentMap[a.road_id])
            accidentMap[a.road_id] = { minor: 0, major: 0, fatal: 0 };
        accidentMap[a.road_id].minor += a.minor_count || 0;
        accidentMap[a.road_id].major += a.major_count || 0;
        accidentMap[a.road_id].fatal += a.fatal_count || 0;
    }

    // ── adjacency list (bidirectional) ───────────────────────
    const adjacency = {};
    for (const n of nodes) adjacency[n.id] = [];

    for (const road of roads) {
        const acc  = accidentMap[road.id];
        const risk = acc
            ? (acc.minor * 1) + (acc.major * 3) + (acc.fatal * 5)
            : 0;

        const edge = {
            distance : road.distance || 1,
            risk,
            roadId   : road.id,
            roadName : road.name,
            accStats : acc || { minor: 0, major: 0, fatal: 0 },
        };

        if (adjacency[road.start_node_id]) {
            adjacency[road.start_node_id].push({ toId: road.end_node_id, ...edge });
        }
        if (adjacency[road.end_node_id]) {
            adjacency[road.end_node_id].push({ toId: road.start_node_id, ...edge });
        }
    }

    return { nodeMap, adjacency, accidentMap };
}

// ─────────────────────────────────────────────────────────────────────────────
// WEIGHT & HEURISTIC FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Edge traversal cost for each routing mode.
 *
 * shortest : pure distance — heuristic = haversine distance → admissible ✅
 * safest   : risk-primary  — heuristic = 0 (can't estimate future risk) → admissible ✅
 * balanced : normalised sum — heuristic = normalised haversine → admissible ✅
 */
function edgeWeight(edge, mode) {
    const { distance, risk } = edge;
    switch (mode) {
        case 'shortest': return distance;
        case 'safest':   return (risk > 0 ? risk : 0.1) + 0.001 * distance;
        case 'balanced': return (distance / 5) + (risk / 10);
        default:         return distance;
    }
}

function heuristic(node, goal, mode) {
    const dist = haversine(node.latitude, node.longitude, goal.latitude, goal.longitude);
    switch (mode) {
        case 'shortest': return dist;
        case 'safest':   return 0;            // Dijkstra-like for risk minimisation
        case 'balanced': return dist / 5;     // matches balanced normalisation
        default:         return dist;
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// A* CORE ALGORITHM
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Run A* from sourceId to goalId.
 * Returns ordered array of node IDs forming the optimal path, or null if
 * no path exists (disconnected graph).
 */
function runAstar(nodeMap, adjacency, sourceId, goalId, mode) {
    if (sourceId === goalId) return [sourceId];

    const goalNode = nodeMap[goalId];
    if (!goalNode) return null;

    const openSet  = new MinHeap();
    const gScore   = {};    // cheapest known cost from source → node
    const cameFrom = {};    // parent map for path reconstruction
    const closed   = new Set();

    for (const id of Object.keys(nodeMap)) gScore[id] = Infinity;
    gScore[sourceId] = 0;

    openSet.push({ id: sourceId, f: heuristic(nodeMap[sourceId], goalNode, mode) });

    while (!openSet.isEmpty()) {
        const { id: cur } = openSet.pop();

        if (cur === goalId) {
            // Reconstruct path ← follow cameFrom chain
            const path = [];
            let node = goalId;
            while (node !== undefined) {
                path.unshift(node);
                node = cameFrom[node];
            }
            return path;
        }

        if (closed.has(cur)) continue;
        closed.add(cur);

        for (const edge of (adjacency[cur] || [])) {
            const nb = edge.toId;
            if (closed.has(nb) || !nodeMap[nb]) continue;

            const g = gScore[cur] + edgeWeight(edge, mode);
            if (g < (gScore[nb] ?? Infinity)) {
                cameFrom[nb] = cur;
                gScore[nb]   = g;
                const f = g + heuristic(nodeMap[nb], goalNode, mode);
                openSet.push({ id: nb, f });
            }
        }
    }

    return null; // No path found — disconnected graph
}

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Compute a full A* route between two geographic coordinates.
 *
 * @param {Array}  nodes      - All nodes from Supabase
 * @param {Array}  roads      - All roads from Supabase
 * @param {Array}  accidents  - All accidents from Supabase
 * @param {number} sourceLat / sourceLng - Origin point
 * @param {number} destLat   / destLng   - Destination point
 * @param {string} mode      - 'shortest' | 'safest' | 'balanced'
 * @param {string} vehicle   - 'car' | 'bike' | 'walk'
 *
 * @returns {{ geometry, distanceKm, durationMin, totalRisk, pathNodeIds, sourceNode, destNode }}
 *          or null if no path exists
 */
function computeRoute(nodes, roads, accidents, sourceLat, sourceLng, destLat, destLng, mode, vehicle = 'car') {
    const { nodeMap, adjacency } = buildGraph(nodes, roads, accidents);

    const sourceNode = findNearestNode(nodes, sourceLat, sourceLng);
    const destNode   = findNearestNode(nodes, destLat,   destLng);
    if (!sourceNode || !destNode) return null;

    if (sourceNode.id === destNode.id) {
        return {
            geometry    : [[sourceNode.latitude, sourceNode.longitude]],
            distanceKm  : '0.00',
            durationMin : '0.0',
            totalRisk   : 0,
            pathNodeIds : [sourceNode.id],
            sourceNode,
            destNode,
        };
    }

    const pathIds = runAstar(nodeMap, adjacency, sourceNode.id, destNode.id, mode);
    if (!pathIds) return null;

    const geometry = pathIds.map(id => [nodeMap[id].latitude, nodeMap[id].longitude]);

    let totalDistance = 0, totalRisk = 0;
    for (let i = 0; i < pathIds.length - 1; i++) {
        const edge = adjacency[pathIds[i]]?.find(e => e.toId === pathIds[i + 1]);
        if (edge) { totalDistance += edge.distance; totalRisk += edge.risk; }
    }

    const speeds       = { car: 30, bike: 18, walk: 5 };
    const durationMin  = (totalDistance / (speeds[vehicle] || 30)) * 60;

    return {
        geometry,
        distanceKm  : totalDistance.toFixed(2),
        durationMin : durationMin.toFixed(1),
        totalRisk   : Math.round(totalRisk),
        pathNodeIds : pathIds,
        sourceNode,
        destNode,
    };
}

/**
 * Extract blackspot markers for nodes that lie on or adjacent to a given path.
 */
function extractBlackspots(pathNodeIds, roads, accidents, nodeMap, mode) {
    const accidentMap = {};
    for (const a of accidents) {
        if (!accidentMap[a.road_id])
            accidentMap[a.road_id] = { minor: 0, major: 0, fatal: 0 };
        accidentMap[a.road_id].minor += a.minor_count || 0;
        accidentMap[a.road_id].major += a.major_count || 0;
        accidentMap[a.road_id].fatal += a.fatal_count || 0;
    }

    const pathSet  = new Set(pathNodeIds);
    const results  = [];

    for (const road of roads) {
        if (!pathSet.has(road.start_node_id) && !pathSet.has(road.end_node_id)) continue;

        const acc   = accidentMap[road.id];
        if (!acc)   continue;
        const total = acc.minor + acc.major + acc.fatal;
        if (total === 0) continue;

        const risk = (acc.minor) + (acc.major * 3) + (acc.fatal * 5);
        if (mode === 'safest' && risk < 3) continue;

        const node = nodeMap[road.start_node_id];
        if (!node) continue;

        results.push({
            lat      : node.latitude,
            lng      : node.longitude,
            risk,
            fatal    : acc.fatal,
            major    : acc.major,
            minor    : acc.minor,
            area     : node.name,
            roadName : road.name,
        });
    }

    return results.sort((a, b) => b.risk - a.risk).slice(0, 50);
}

module.exports = { computeRoute, extractBlackspots, buildGraph, findNearestNode, haversine };
