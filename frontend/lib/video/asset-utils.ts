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
        
        // [PERF UPGRADE] If we are in PREVIEW mode, we use low-res versions for Supabase/External assets
        if (isPreview) {
            if (url.includes('supabase.co')) {
                finalUrl += (url.includes('?') ? '&' : '?') + 'width=640&quality=60';
            } else if (url.includes('pexels.com')) {
                finalUrl = url.replace('original', 'medium').replace('large', 'medium');
            }
        }

        if (baseUrl) {
            return finalUrl;
        }
        
        return `/api/proxy?url=${encodeURIComponent(finalUrl)}`;
    }

    // 3. Local assets
    const cleanPath = url.startsWith('/') ? url : `/${url}`;
    if (baseUrl) {
        return `${baseUrl}${cleanPath}`;
    }

    return staticFile(cleanPath.slice(1));
};
