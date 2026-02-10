import { createClient } from "@/utils/supabase/server";

/**
 * Fetches the affiliate link for a provider from the database.
 * Falls back to website_url if no active affiliate link exists.
 * 
 * Used server-side in detail pages to ensure all CTAs use affiliate links.
 */
export async function getAffiliateUrl(
    providerName: string,
    fallbackUrl: string
): Promise<string> {
    try {
        const supabase = await createClient();
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
        // Silently fall back to website URL
    }

    return fallbackUrl;
}

/**
 * Batch-fetches affiliate links for multiple providers at once.
 * Returns a Map of provider_name -> affiliate_link.
 * Used in list pages to minimize DB calls.
 */
export async function getAffiliateUrlBatch(
    providers: { provider_name: string; website_url: string }[]
): Promise<Map<string, string>> {
    const urlMap = new Map<string, string>();

    // Default: all providers use their website_url
    for (const p of providers) {
        urlMap.set(p.provider_name, p.website_url);
    }

    try {
        const supabase = await createClient();
        const { data: affiliates } = await supabase
            .from('affiliate_partners')
            .select('provider_name, affiliate_link')
            .eq('status', 'active');

        if (affiliates) {
            for (const aff of affiliates) {
                if (aff.affiliate_link) {
                    // Match case-insensitively, store with original casing
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
        // Silently fall back to website URLs
    }

    return urlMap;
}
