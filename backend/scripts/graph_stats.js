/**
 * Quick check — shows the geographic extent of the current node graph
 * and which regions are missing.
 */
'use strict';
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function main() {
    const { data: nodes } = await supabase.from('nodes').select('id, name, latitude, longitude');
    const { data: roads } = await supabase.from('roads').select('id, start_node_id, end_node_id, distance');

    // Edge count per node
    const degree = {};
    for (const n of nodes) degree[n.id] = 0;
    for (const r of roads) {
        if (degree[r.start_node_id] !== undefined) degree[r.start_node_id]++;
        if (degree[r.end_node_id] !== undefined) degree[r.end_node_id]++;
    }

    // Low-degree nodes (likely dead-ends or poorly connected)
    const lowDegree = nodes.filter(n => degree[n.id] <= 1).sort((a,b) => degree[a.id] - degree[b.id]);
    console.log(`\n🔎 Nodes with ≤1 edge (potential dead-ends): ${lowDegree.length}`);
    lowDegree.slice(0, 20).forEach(n =>
        console.log(`  [${n.id}] degree=${degree[n.id]}  ${n.name}`)
    );

    // Bounding box
    const lats = nodes.map(n => n.latitude);
    const lngs = nodes.map(n => n.longitude);
    console.log(`\n📍 Bounding box:`);
    console.log(`   Lat: ${Math.min(...lats).toFixed(4)} → ${Math.max(...lats).toFixed(4)}`);
    console.log(`   Lng: ${Math.min(...lngs).toFixed(4)} → ${Math.max(...lngs).toFixed(4)}`);

    // Avg degree
    const avgDeg = (roads.length * 2) / nodes.length;
    console.log(`\n📊 Average edges per node: ${avgDeg.toFixed(2)}`);
    console.log(`   (A healthy routing graph needs ≥ 3.0 average)\n`);
}

main().catch(console.error);
