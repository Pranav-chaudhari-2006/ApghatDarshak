require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function fixConnectivity() {
    const { data: nodes } = await supabase.from('nodes').select('id, name, latitude, longitude');
    const { data: roads } = await supabase.from('roads').select('start_node_id, end_node_id');

    if (!nodes || !roads) return;

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

    console.log(`Initial islands: ${islands.length}`);
    islands.sort((a, b) => b.length - a.length);

    const mainIsland = islands[0];
    const newRoads = [];

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
            newRoads.push({
                name: `Bridge: ${bestPair[0].name} ↔ ${bestPair[1].name}`,
                start_node_id: bestPair[0].id,
                end_node_id: bestPair[1].id,
                distance: parseFloat((minDist * 111).toFixed(2))
            });
            // Merge the island in our local representation to avoid redundant bridges if we were doing it iteratively
            // But here we just connect all to the main island which is sufficient for connectivity.
        }
    }

    console.log(`Adding ${newRoads.length} bridge roads to connect all islands...`);
    
    // Insert in batches of 50
    for (let i = 0; i < newRoads.length; i += 50) {
        const batch = newRoads.slice(i, i + 50);
        const { error } = await supabase.from('roads').insert(batch);
        if (error) {
            console.error('Error inserting batch:', error);
        } else {
            console.log(`Inserted batch ${Math.floor(i/50) + 1}`);
        }
    }

    console.log('Connectivity fix complete.');
}

fixConnectivity();
