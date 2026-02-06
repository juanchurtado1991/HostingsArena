// Central Source of Truth for Affiliate Links
// In the future, this will fetch directly from Supabase 'affiliate_links' table

export const AFFILIATE_LINKS: Record<string, string> = {
    "Bluehost": "https://www.bluehost.com/track/hostingarena",
    "NordVPN": "https://go.nordvpn.net/aff_c?offer_id=15&aff_id=1234",
    "SiteGround": "https://www.siteground.com/go/hostingarena",
    "Hostinger": "https://www.hostg.xyz/SH123",
    "ExpressVPN": "https://www.expressrefer.com/refer-a-friend/30-days-free?referrer_id=1234",
    "Surfshark": "https://surfshark.club/friend/123456",
    "CyberGhost": "https://www.cyberghostvpn.com/offer/hostingarena",
    "Dft": "#" // Default fallback
};

export function getAffiliateLink(providerName: string): string {
    return AFFILIATE_LINKS[providerName] || "#";
}
