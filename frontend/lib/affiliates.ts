import { createAdminClient } from "@/lib/tasks/supabaseAdmin";

export async function getAffiliateUrl(
    providerName: string,
    fallbackUrl: string
): Promise<string> {
    try {
        const supabase = createAdminClient();
        const { data } = await supabase
            .from('affiliate_partners')
            .select('affiliate_link, status')
            .ilike('provider_name', providerName)
            .eq('status', 'active')
            .limit(1)
            .single();

        if (data?.affiliate_link) {
            return data.affiliate_link;
        }
    } catch {
    }

    return fallbackUrl;
}

export async function getAffiliateUrlBatch(
    providers: { provider_name: string; website_url: string }[]
): Promise<Map<string, string>> {
    const urlMap = new Map<string, string>();

    for (const p of providers) {
        urlMap.set(p.provider_name, p.website_url);
    }

    try {
        const supabase = createAdminClient();
        const { data: affiliates } = await supabase
            .from('affiliate_partners')
            .select('provider_name, affiliate_link')
            .eq('status', 'active');

        if (affiliates) {
            for (const aff of affiliates) {
                if (aff.affiliate_link) {
                    const match = providers.find(
                        p => p.provider_name.toLowerCase() === aff.provider_name.toLowerCase()
                    );
                    if (match) {
                        urlMap.set(match.provider_name, aff.affiliate_link);
                    }
                }
            }
        }
    } catch {
    }

    return urlMap;
}

export async function getActiveAffiliatePartners(): Promise<Set<string>> {
    try {
        const supabase = createAdminClient();
        const { data } = await supabase
            .from('affiliate_partners')
            .select('provider_name')
            .eq('status', 'active');
            
        return new Set(data?.map(a => a.provider_name.toLowerCase()) || []);
    } catch {
        return new Set();
    }
}
