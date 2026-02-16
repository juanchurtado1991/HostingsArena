
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyFix() {
    console.log('Fetching first 500 hosting providers (alphabetical)...');
    const { data, error } = await supabase
        .from('hosting_providers')
        .select('provider_name')
        .order('provider_name', { ascending: true })
        .limit(500);

    if (error) {
        console.error('Error:', error);
        return;
    }

    const included = data.some(p => p.provider_name.toLowerCase().includes('namecheap'));
    console.log(`Is Namecheap included in the 500 results? ${included}`);

    if (included) {
        const firstOccurence = data.findIndex(p => p.provider_name.toLowerCase().includes('namecheap'));
        console.log(`Namecheap first occurrence at index: ${firstOccurence}`);
    }
}

verifyFix();
