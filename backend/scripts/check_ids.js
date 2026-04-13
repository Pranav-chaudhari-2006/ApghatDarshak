/**
 * Show the actual min/max node ID and sample of existing IDs
 * so we can safely write a new seed without ID conflicts.
 */
'use strict';
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
async function main() {
    const { data: nodes } = await supabase.from('nodes').select('id').order('id', { ascending: false }).limit(5);
    const { data: nodesMin } = await supabase.from('nodes').select('id').order('id', { ascending: true }).limit(5);
    console.log('Max 5 node IDs:', nodes.map(n => n.id));
    console.log('Min 5 node IDs:', nodesMin.map(n => n.id));
}
main().catch(console.error);
