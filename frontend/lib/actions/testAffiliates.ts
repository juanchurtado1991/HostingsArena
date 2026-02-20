"use server";
import { createAdminClient } from "@/lib/tasks/supabaseAdmin";
import { getAffiliateUrl } from "@/lib/affiliates";

export async function testAllAffiliateLinks() {
    const supabase = createAdminClient();
    
    const { data: hosting } = await supabase.from('hosting_providers').select('id, provider_name, website_url');
    const { data: vpn } = await supabase.from('vpn_providers').select('id, provider_name, website_url');
    
    const allProviders = [
        ...(hosting || []).map(p => ({ ...p, type: 'hosting' })),
        ...(vpn || []).map(p => ({ ...p, type: 'vpn' }))
    ];
    
    const results = await Promise.all(allProviders.map(async p => {
        const url = await getAffiliateUrl(p.provider_name, p.website_url || '#');
        const isFallback = url === p.website_url || url === '#';
        return {
            providerName: p.provider_name,
            type: p.type,
            generatedUrl: url,
            isFallback,
            status: isFallback ? 'Missing Affiliate Link' : 'Active Affiliate'
        };
    }));
    
    return results.sort((a, b) => {
        if (a.isFallback === b.isFallback) return a.providerName.localeCompare(b.providerName);
        return a.isFallback ? 1 : -1;
    });
}
