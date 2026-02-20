import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/tasks/supabaseAdmin';

export async function GET(req: Request) {
    try {
        const supabase = createAdminClient();
        
        // Dynamic host detection for local vs prod
        const host = req.headers.get('host');
        const protocol = host?.includes('localhost') ? 'http' : 'https';
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || `${protocol}://${host}`;

        // 1. Get Blog Posts
        const { data: posts } = await supabase.from('posts').select('slug').eq('status', 'published').lte('published_at', new Date().toISOString());
        const postUrls = (posts || []).map(p => `${baseUrl}/en/news/${p.slug}`);

        // 2. Get Hosting Detail Pages
        const { data: hosting } = await supabase.from('hosting_providers').select('slug');
        const hostingUrls = (hosting || []).map(p => `${baseUrl}/en/hosting/${p.slug}`);

        // 3. Get VPN Detail Pages
        const { data: vpn } = await supabase.from('vpn_providers').select('slug');
        const vpnUrls = (vpn || []).map(p => `${baseUrl}/en/vpn/${p.slug}`);

        // 4. Generate Top 10 Comparison combinatories (Sample for power play)
        // In a real scenario, we might want ALL of them, but let's start with a sample
        const topHosting = (hosting || []).slice(0, 5);
        const compareHostingUrls: string[] = [];
        for (let i = 0; i < topHosting.length; i++) {
            for (let j = i + 1; j < topHosting.length; j++) {
                compareHostingUrls.push(`${baseUrl}/en/compare/${topHosting[i].slug}-vs-${topHosting[j].slug}`);
            }
        }

        const topVpn = (vpn || []).slice(0, 5);
        const compareVpnUrls: string[] = [];
        for (let i = 0; i < topVpn.length; i++) {
            for (let j = i + 1; j < topVpn.length; j++) {
                compareVpnUrls.push(`${baseUrl}/en/compare/${topVpn[i].slug}-vs-${topVpn[j].slug}?cat=vpn`);
            }
        }

        // 5. Add "Best" Pages
        const bestCategories = ['wordpress', 'shared', 'vps', 'cloud', 'dedicated'];
        const bestHostingUrls = bestCategories.map(c => `${baseUrl}/en/hosting/best/${c}`);
        const bestVpnUrls = ['best-privacy', 'best-streaming', 'best-budget'].map(c => `${baseUrl}/en/vpn/best/${c}`);

        const allUrls = [
            baseUrl,
            `${baseUrl}/en/hosting`,
            `${baseUrl}/en/vpn`,
            `${baseUrl}/en/news`,
            `${baseUrl}/en/compare`,
            ...postUrls,
            ...hostingUrls,
            ...vpnUrls,
            ...compareHostingUrls,
            ...compareVpnUrls,
            ...bestHostingUrls,
            ...bestVpnUrls
        ];

        return NextResponse.json({ urls: allUrls });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
