/**
 * ApghatDarshak — Graph Connectivity Checker
 * Run: node scripts/check_graph.js
 *
 * Reports:
 *  • Total nodes / roads / accidents
 *  • How many nodes are completely isolated (no edges)
 *  • Connected components (BFS flood-fill)
 *  • Top 10 most-isolated areas
 */
'use strict';
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function main() {
    console.log('\n🔍 ApghatDarshak — Graph Connectivity Audit\n');

    // Fetch all data
    const [nodesRes, roadsRes, accRes] = await Promise.all([
        supabase.from('nodes').select('id, name, latitude, longitude'),
        supabase.from('roads').select('id, name, start_node_id, end_node_id, distance'),
        supabase.from('accidents').select('road_id', { count: 'exact', head: true }),
    ]);

    if (nodesRes.error) { console.error('Nodes error:', nodesRes.error.message); process.exit(1); }
    if (roadsRes.error) { console.error('Roads error:', roadsRes.error.message); process.exit(1); }

    const nodes = nodesRes.data || [];
    const roads = roadsRes.data || [];

    console.log(`📊 Total nodes    : ${nodes.length}`);
    console.log(`📊 Total roads    : ${roads.length}`);
    console.log(`📊 Total accidents: ${accRes.count ?? 'N/A'}\n`);

    if (nodes.length === 0) {
        console.error('❌ No nodes found in database. Please run the seed SQL first.');
        process.exit(1);
    }

    // Build adjacency for connectivity check
    const adj = {};
    for (const n of nodes) adj[n.id] = new Set();

    let orphanRoads = 0;
    for (const r of roads) {
        if (adj[r.start_node_id] && adj[r.end_node_id]) {
            adj[r.start_node_id].add(r.end_node_id);
            adj[r.end_node_id].add(r.start_node_id);
        } else {
            orphanRoads++;
        }
    }

    if (orphanRoads > 0) {
        console.warn(`⚠️  ${orphanRoads} roads reference non-existent node IDs (FK mismatch)\n`);
    }

    // Isolated nodes (degree 0)
    const isolated = nodes.filter(n => adj[n.id].size === 0);
    console.log(`🔴 Isolated nodes (no edges): ${isolated.length}`);
    if (isolated.length > 0) {
        console.log('   First 10 isolated nodes:');
        isolated.slice(0, 10).forEach(n =>
            console.log(`   • [${n.id}] ${n.name} (${n.latitude.toFixed(4)}, ${n.longitude.toFixed(4)})`)
        );
        console.log('');
    }

    // Connected components using BFS
    const visited = new Set();
    const components = [];

    for (const n of nodes) {
        if (visited.has(n.id)) continue;
        const component = [];
        const queue = [n.id];
        visited.add(n.id);
        while (queue.length > 0) {
            const cur = queue.shift();
            component.push(cur);
            for (const nb of (adj[cur] || [])) {
                if (!visited.has(nb)) {
                    visited.add(nb);
                    queue.push(nb);
                }
            }
        }
        components.push(component);
    }

    components.sort((a, b) => b.length - a.length);
    console.log(`🌐 Connected components: ${components.length}`);
    console.log(`✅ Largest component  : ${components[0].length} nodes`);

    if (components.length > 1) {
        const nodeMap = {};
        for (const n of nodes) nodeMap[n.id] = n;

        console.log('\n   Smaller components (unreachable from main graph):');
        components.slice(1, 15).forEach((comp, i) => {
            const names = comp.slice(0, 3).map(id => nodeMap[id]?.name ?? `id=${id}`).join(', ');
            console.log(`   [${i+1}] ${comp.length} node(s): ${names}${comp.length > 3 ? ', ...' : ''}`);
        });
        if (components.length > 16) {
            console.log(`   ... and ${components.length - 16} more small components`);
        }
    }

    const coverage = ((components[0].length / nodes.length) * 100).toFixed(1);
    console.log(`\n📈 Graph coverage: ${coverage}% of nodes are reachable from the main component`);

    if (parseFloat(coverage) < 80) {
        console.log('\n⚠️  RECOMMENDATION: Run graph_expansion_v2.sql in Supabase SQL Editor');
        console.log('   File: backend/seed/graph_expansion_v2.sql\n');
    } else {
        console.log('\n✅ Graph connectivity is healthy!\n');
    }
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
