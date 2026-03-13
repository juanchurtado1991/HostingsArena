import { staticFile } from 'remotion';

/**
 * Shared utility for resolving asset URLs in the Video Studio.
 * Handles:
 * 1. Symbolic URLs (intro, outro)
 * 2. API proxying for external assets (Supabase, Pexels) to bypass CORS.
 * 3. Local asset resolution via staticFile.
 * 4. Production baseUrl prepending.
 * 5. Preview-mode performance optimizations (low-res external assets).
 */
export const resolveAsset = (url?: string, baseUrl?: string) => {
    if (!url) return undefined;
    if (url === 'intro' || url === 'outro') return url;

    const isPreview = !baseUrl;

    // 1. Data/Blob/Local API URLs return as-is
    if (url.startsWith('api/') || url.startsWith('/api') || url.startsWith('blob:') || url.startsWith('data:')) {
        return url;
    }

    // 2. External HTTP(S) URLs need proxying to bypass CORS
    if (url.startsWith('http') && !url.includes('localhost') && !url.includes('127.0.0.1')) {
        let finalUrl = url;
        
        // [PERF UPGRADE] If we are in PREVIEW mode, we use low-res versions for faster caching
        if (isPreview) {
            if (url.includes('images.pexels.com')) {
                // Pexels images: force small dimensions via query params
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
                // Pexels videos: swap HD for SD
                finalUrl = url.replace(/hd_1920_1080/gi, 'sd_640_360')
                              .replace(/hd_1280_720/gi, 'sd_640_360');
            }
        }

        if (url.includes('supabase.co')) {
            const isImage = /\.(jpg|jpeg|png|webp|avif)/i.test(url);
            if (isImage) {
                finalUrl += (url.includes('?') ? '&' : '?') + 'width=640&quality=60';
                // RETURN DIRECTLY - Supabase is CORS-friendly for images
                return finalUrl;
            }
            // For audio/video from Supabase, fall through to proxy bypass CORS for useWebAudioApi
        }

        // 2. Production absolute URLs
        if (baseUrl && baseUrl.length > 0) {
            const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
            
            // BYPASS PROXY for known CORS-friendly CDNs in production renderer
            // This avoids Vercel proxy bottlenecks and timeouts for large video files.
            // We can do this safely because the renderer has disableWebSecurity: true.
            const isCdn = url.includes('pexels.com') || url.includes('jamendo.com') || url.includes('pixabay.com');
            if (isCdn) {
                return finalUrl;
            }

            return `${cleanBaseUrl}/api/proxy?url=${encodeURIComponent(finalUrl)}`;
        }
        
        return `/api/proxy?url=${encodeURIComponent(finalUrl)}`;
    }

    // 3. Local assets
    const cleanPath = url.startsWith('/') ? url : `/${url}`;
    if (baseUrl && baseUrl.length > 0) {
        return `${baseUrl}${cleanPath}`;
    }

    return staticFile(cleanPath.slice(1));
};
