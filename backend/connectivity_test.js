require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function testConnectivity() {
    const { data: nodes } = await supabase.from('nodes').select('id, name');
    const { data: roads } = await supabase.from('roads').select('start_node_id, end_node_id');

    const adj = {};
    for (const n of nodes) adj[n.id] = [];
    for (const r of roads) {
        if (adj[r.start_node_id]) adj[r.start_node_id].push(r.end_node_id);
        if (adj[r.end_node_id]) adj[r.end_node_id].push(r.start_node_id);
    }

    const startNode = nodes.find(n => n.name.includes('Shivajinagar')) || nodes[0];
    console.log(`Checking connectivity from: ${startNode.name} (ID: ${startNode.id})`);

    const visited = new Set();
    const queue = [startNode.id];
    visited.add(startNode.id);

    while (queue.length > 0) {
        const u = queue.shift();
        for (const v of adj[u]) {
            if (!visited.has(v)) {
                visited.add(v);
                queue.push(v);
            }
        }
    }

    console.log(`Total nodes: ${nodes.length}`);
    console.log(`Reachable nodes: ${visited.size}`);

    if (visited.size < nodes.length) {
        console.log(`Disconnected nodes: ${nodes.length - visited.size}`);
        const unreachable = nodes.filter(n => !visited.has(n.id));
        console.log('Sample unreachable nodes:', unreachable.slice(0, 5).map(n => n.name));
    }
}

testConnectivity();
