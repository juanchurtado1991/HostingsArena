import { staticFile } from 'remotion';

export const resolveAsset = (url?: string, baseUrl?: string) => {
    if (!url) return undefined;
    if (url === 'intro' || url === 'outro') return url;

    const isPreview = !baseUrl;

    if (url.startsWith('api/') || url.startsWith('/api') || url.startsWith('blob:') || url.startsWith('data:')) {
        return url;
    }

    if (url.startsWith('http') && !url.includes('localhost') && !url.includes('127.0.0.1')) {
        let finalUrl = url;
        
        if (isPreview) {
            if (url.includes('images.pexels.com')) {
                try {
                    const u = new URL(url);
                    u.searchParams.set('auto', 'compress');
                    u.searchParams.set('cs', 'tinysrgb');
                    u.searchParams.set('w', '640');
                    u.searchParams.set('h', '360');
                    u.searchParams.set('fit', 'crop');
                    finalUrl = u.toString();
                } catch { /* pass through */ }
            } else if (url.includes('pexels.com') && /\.(mp4|webm)/i.test(url)) {
                finalUrl = url.replace(/hd_1920_1080/gi, 'sd_640_360')
                              .replace(/hd_1280_720/gi, 'sd_640_360');
            }
        }

        const isCdn = url.includes('pexels.com') || url.includes('jamendo.com') || url.includes('pixabay.com') || url.includes('supabase.co');
        if (isCdn) {
            if (url.includes('supabase.co') && /\.(jpg|jpeg|png|webp|avif)/i.test(url)) {
                return finalUrl + (finalUrl.includes('?') ? '&' : '?') + 'width=640&quality=60';
            }
            return finalUrl;
        }

        if (baseUrl && baseUrl.length > 0) {
            const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
            return `${cleanBaseUrl}/api/proxy?url=${encodeURIComponent(finalUrl)}`;
        }
        
        return `/api/proxy?url=${encodeURIComponent(finalUrl)}`;
    }

    const cleanPath = url.startsWith('/') ? url : `/${url}`;
    if (baseUrl && baseUrl.length > 0) {
        return `${baseUrl}${cleanPath}`;
    }

    return staticFile(cleanPath.slice(1));
};
