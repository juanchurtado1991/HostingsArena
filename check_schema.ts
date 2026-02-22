import { createAdminClient } from './frontend/lib/tasks/supabaseAdmin';

async function checkSchema() {
    const supabase = createAdminClient();
    
    console.log('--- Hosting Providers ---');
    const { data: hData, error: hError } = await supabase.from('hosting_providers').select('*').limit(1);
    if (hError) console.error(hError);
    else if (hData && hData.length > 0) console.log(Object.keys(hData[0]));
    
    console.log('\n--- VPN Providers ---');
    const { data: vData, error: vError } = await supabase.from('vpn_providers').select('*').limit(1);
    if (vError) console.error(vError);
    else if (vData && vData.length > 0) console.log(Object.keys(vData[0]));
}

checkSchema();
