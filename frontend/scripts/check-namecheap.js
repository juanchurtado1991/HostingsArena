
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkNamecheap() {
    const { count, error } = await supabase
        .from('hosting_providers')
        .select('*', { count: 'exact', head: true });

    if (error) {
        console.error('Error counting rows:', error);
        return;
    }

    console.log(`Total rows in hosting_providers: ${count}`);

    const { data: namecheapRows } = await supabase
        .from('hosting_providers')
        .select('id, provider_name')
        .ilike('provider_name', '%namecheap%');

    console.log(`Namecheap rows: ${namecheapRows?.length || 0}`);

    const { data: first50 } = await supabase
        .from('hosting_providers')
        .select('provider_name')
        .order('provider_name', { ascending: true })
        .limit(50);

    if (first50) {
        const included = first50.some(p => p.provider_name.toLowerCase().includes('namecheap'));
        console.log(`Is Namecheap in the first 50 results (sorted alphabetically)? ${included}`);
    }
}

checkNamecheap();
