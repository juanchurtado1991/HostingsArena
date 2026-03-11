/**
 * Persistent Asset Cache for Video Studio
 * Uses the browser Cache API to store proxied media assets (images, videos, SFX)
 * across page refreshes. Cleared on project reset.
 */

const CACHE_NAME = 'ha-studio-assets';

/**
 * Check if Cache API is available in the current environment
 */
const isCacheAvailable = (): boolean => {
    return typeof caches !== 'undefined';
};

/**
 * Fetch a URL, serving from cache if available, otherwise fetching from network and caching.
 * Returns the Response object (clone-safe).
 */
export async function fetchWithCache(url: string): Promise<Response> {
    if (!isCacheAvailable()) {
        return fetch(url);
    }

    try {
        const cache = await caches.open(CACHE_NAME);
        const cached = await cache.match(url);
        
        if (cached) {
            return cached;
        }

        // Fetch from network
        const response = await fetch(url);
        
        if (response.ok) {
            // Cache a clone (response body can only be consumed once)
            cache.put(url, response.clone());
        }
        
        return response;
    } catch (err) {
        console.warn('[AssetCache] Cache operation failed, falling back to network:', err);
        return fetch(url);
    }
}

/**
 * Pre-warm the cache for a URL without consuming the response.
 * Returns true if the asset was already cached (cache hit).
 */
export async function prewarmCache(url: string): Promise<boolean> {
    if (!isCacheAvailable()) return false;

    try {
        const cache = await caches.open(CACHE_NAME);
        const cached = await cache.match(url);
        
        if (cached) {
            return true; // Already cached
        }

        // Fetch and store
        const response = await fetch(url);
        if (response.ok) {
            await cache.put(url, response);
        }
        return false;
    } catch (err) {
        console.warn('[AssetCache] Prewarm failed:', url, err);
        return false;
    }
}

/**
 * Delete the entire asset cache bucket.
 * Called on project reset to free storage.
 */
export async function clearAssetCache(): Promise<void> {
    if (!isCacheAvailable()) return;

    try {
        await caches.delete(CACHE_NAME);
        console.log('[AssetCache] Cache cleared successfully');
    } catch (err) {
        console.warn('[AssetCache] Failed to clear cache:', err);
    }
}

/**
 * Get cache statistics for debugging.
 */
export async function getCacheStats(): Promise<{ count: number }> {
    if (!isCacheAvailable()) return { count: 0 };

    try {
        const cache = await caches.open(CACHE_NAME);
        const keys = await cache.keys();
        return { count: keys.length };
    } catch {
        return { count: 0 };
    }
}
