require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function findIslands() {
    const { data: nodes } = await supabase.from('nodes').select('id, name, latitude, longitude');
    const { data: roads } = await supabase.from('roads').select('start_node_id, end_node_id');

    const adj = {};
    for (const n of nodes) adj[n.id] = [];
    for (const r of roads) {
        if (adj[r.start_node_id]) adj[r.start_node_id].push(r.end_node_id);
        if (adj[r.end_node_id]) adj[r.end_node_id].push(r.start_node_id);
    }

    const islands = [];
    const visited = new Set();

    for (const n of nodes) {
        if (!visited.has(n.id)) {
            const island = [];
            const queue = [n.id];
            visited.add(n.id);
            while (queue.length > 0) {
                const u = queue.shift();
                island.push(nodes.find(node => node.id === u));
                for (const v of adj[u]) {
                    if (!visited.has(v)) {
                        visited.add(v);
                        queue.push(v);
                    }
                }
            }
            islands.push(island);
        }
    }

    console.log(`Found ${islands.length} islands.`);
    islands.sort((a, b) => b.length - a.length);
    
    islands.forEach((island, i) => {
        console.log(`Island ${i+1}: ${island.length} nodes (Main: ${island[0].name})`);
    });

    // Suggest bridge roads between the largest island and others
    const mainIsland = islands[0];
    const suggestions = [];

    for (let i = 1; i < islands.length; i++) {
        const otherIsland = islands[i];
        let bestPair = null;
        let minDist = Infinity;

        for (const n1 of mainIsland) {
            for (const n2 of otherIsland) {
                const d = Math.sqrt((n1.latitude - n2.latitude)**2 + (n1.longitude - n2.longitude)**2);
                if (d < minDist) {
                    minDist = d;
                    bestPair = [n1, n2];
                }
            }
        }

        if (bestPair) {
            suggestions.push(`('${bestPair[0].name} Bridge to ${bestPair[1].name}', ${bestPair[0].id}, ${bestPair[1].id}, ${(minDist * 111).toFixed(2)})`);
        }
    }

    console.log("\nSuggested Patch (Add these to roads):");
    console.log(suggestions.join(",\n") + ";");
}

findIslands();
