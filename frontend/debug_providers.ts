
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

function createAdminClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error('Missing Supabase admin credentials');
    }

    return createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });
}

async function checkProviders() {
    console.log("Initializing Supabase Admin Client...");
    try {
        const supabase = createAdminClient();

        console.log("Checking all Hostinger rows in hosting_providers...");
        const { data: hosting, error: hError } = await supabase
            .from('hosting_providers')
            .select('*')
            .ilike('provider_name', 'Hostinger');

        if (hError) {
            console.error("Hosting Error:", hError);
        } else {
            console.log(`Hosting Count: ${hosting?.length || 0}`);
            if (hosting && hosting.length > 0) {
                console.log("Hostinger Specs:", JSON.stringify(hosting[0], null, 2));
            } else {
                console.log("Hostinger not found.");
            }
        }

        console.log("\nChecking vpn_providers...");
        const { data: vpn, error: vError } = await supabase.from('vpn_providers').select('*').limit(5);

        if (vError) {
            console.error("VPN Error:", vError);
        } else {
            console.log(`VPN Count: ${vpn?.length || 0}`);
            if (vpn && vpn.length > 0) {
                console.log("Sample VPN:", JSON.stringify(vpn[0], null, 2));
                const hasRating = 'rating' in vpn[0];
                console.log(`Column 'rating' exists in vpn_providers? ${hasRating}`);
            } else {
                console.log("No VPN providers found.");
            }
        }

    } catch (e) {
        console.error("Script Error:", e);
    }
}

checkProviders();
