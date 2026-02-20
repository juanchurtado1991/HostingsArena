import { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL!;

    // Use direct client for sitemap to avoid cookie/header dependency of SSR client
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Get all published posts
    const { data: posts } = await supabase
        .from('posts')
        .select('slug, updated_at, published_at')
        .eq('status', 'published');

    const newsEntries: MetadataRoute.Sitemap = (posts || []).map((post) => ({
        url: `${baseUrl}/news/${post.slug}`,
        lastModified: new Date(post.updated_at || post.published_at || Date.now()),
        changeFrequency: 'weekly',
        priority: 0.8,
    }));

    // Get all hosting providers
    const { data: hostingProviders } = await supabase
        .from('hosting_providers')
        .select('slug, updated_at');
    
    const hostingEntries: MetadataRoute.Sitemap = (hostingProviders || []).map((p) => ({
        url: `${baseUrl}/hosting/${p.slug}`,
        lastModified: new Date(p.updated_at || Date.now()),
        changeFrequency: 'daily',
        priority: 0.7,
    }));

    // Get all VPN providers
    const { data: vpnProviders } = await supabase
        .from('vpn_providers')
        .select('slug, updated_at');
    
    const vpnEntries: MetadataRoute.Sitemap = (vpnProviders || []).map((p) => ({
        url: `${baseUrl}/vpn/${p.slug}`,
        lastModified: new Date(p.updated_at || Date.now()),
        changeFrequency: 'daily',
        priority: 0.7,
    }));

    return [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: `${baseUrl}/hosting`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/vpn`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/news`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/compare`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.8,
        },
        ...newsEntries,
        ...hostingEntries,
        ...vpnEntries,
    ];
}
