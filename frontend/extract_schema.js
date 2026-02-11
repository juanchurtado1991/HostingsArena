
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function getTableInfo(tableName) {
    // We can't directly query schema with client, so we'll fetch one row
    const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);

    if (error) {
        console.error(`Error fetching ${tableName}:`, error);
        return;
    }

    if (data && data.length > 0) {
        console.log(`\nColumns for ${tableName}:`);
        console.log(Object.keys(data[0]).join(', '));
        console.log('\nSample Data:');
        console.log(JSON.stringify(data[0], null, 2));
    } else {
        console.log(`No data found in ${tableName} to infer schema.`);
    }
}

async function main() {
    await getTableInfo('hosting_providers');
    await getTableInfo('vpn_providers');
}

main();
