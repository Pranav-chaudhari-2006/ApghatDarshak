require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function check() {
    const { data: acc } = await supabase.from('accidents').select('*');
    console.log("Accidents count:", acc.length);
    const { data: roads } = await supabase.from('roads').select('id, name');
    console.log("Roads count:", roads.length);
    const { data: nodes } = await supabase.from('nodes').select('id, name');
    console.log("Nodes count:", nodes.length);
}
check();
