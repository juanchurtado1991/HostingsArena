import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const anonClient = createClient(supabaseUrl, supabaseAnonKey);
const adminClient = createClient(supabaseUrl, supabaseServiceKey);

async function checkAffiliates() {
    console.log("Testing with ANON key...");
    const { data: anonData, error: anonErr } = await anonClient
        .from('affiliate_partners')
        .select('*');
    console.log("Anon result length:", anonData?.length || 0);
    if (anonErr) console.error("Anon error:", anonErr);
    
    console.log("Testing with ADMIN key...");
    const { data: adminData, error: adminErr } = await adminClient
        .from('affiliate_partners')
        .select('*');
    console.log("Admin result length:", adminData?.length || 0);
    if (adminErr) console.error("Admin error:", adminErr);
}

checkAffiliates();
