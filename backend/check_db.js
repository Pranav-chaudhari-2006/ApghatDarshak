require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function checkDb() {
    const { count: nodeCount } = await supabase.from('nodes').select('*', { count: 'exact', head: true });
    const { count: roadCount } = await supabase.from('roads').select('*', { count: 'exact', head: true });
    const { count: accidentCount } = await supabase.from('accidents').select('*', { count: 'exact', head: true });

    console.log(`Nodes: ${nodeCount}`);
    console.log(`Roads: ${roadCount}`);
    console.log(`Accidents: ${accidentCount}`);

    const { data: sampleNodes } = await supabase.from('nodes').select('*').limit(5);
    console.log('Sample Nodes:', sampleNodes);
}

checkDb();
