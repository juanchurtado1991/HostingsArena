"use server";

import { getAffiliateUrl, getActiveAffiliatePartners } from "@/lib/affiliates";
import { createAdminClient } from "@/lib/tasks/supabaseAdmin";

export async function getCalculatorAffiliateLinks(
    p1Name: string,
    p1Fallback: string,
    p2Name: string,
    p2Fallback: string
) {
    const [p1Link, p2Link] = await Promise.all([
        getAffiliateUrl(p1Name, p1Fallback),
        getAffiliateUrl(p2Name, p2Fallback)
    ]);

    return {
        p1Link,
        p2Link
    };
}

export async function getDefaultCompareProviders(type: 'hosting' | 'vpn') {
    const supabase = createAdminClient();
    const activeNames = await getActiveAffiliatePartners();
    
    const table = type === 'hosting' ? 'hosting_providers' : 'vpn_providers';
    
    // We fetch a handful of top providers
    const { data } = await supabase
        .from(table)
        .select('*')
        .order('pricing_monthly', { ascending: true })
        .limit(20);

    const activeProviders = (data || []).filter(p => activeNames.has(p.provider_name.toLowerCase()));
    
    // Select the first two that have affiliates
    let selected = activeProviders.slice(0, 2);
    
    // Fallback if we don't have enough active affiliates
    if (selected.length < 2 && data) {
         for (const p of data) {
             if (!selected.find(s => s.id === p.id)) {
                 selected.push(p);
             }
             if (selected.length >= 2) break;
         }
    }

    return selected;
}
