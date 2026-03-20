const CACHE_NAME = 'ha-studio-assets';


const isCacheAvailable = (): boolean => {
    return typeof caches !== 'undefined';
};

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

        const response = await fetch(url);
        
        if (response.ok) {
            cache.put(url, response.clone());
        }
        
        return response;
    } catch (err) {
        console.warn('[AssetCache] Cache operation failed, falling back to network:', err);
        return fetch(url);
    }
}

export async function prewarmCache(url: string): Promise<boolean> {
    if (!isCacheAvailable()) return false;

    try {
        const cache = await caches.open(CACHE_NAME);
        const cached = await cache.match(url);
        
        if (cached) {
            return true; 
        }

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

export async function clearAssetCache(): Promise<void> {
    if (!isCacheAvailable()) return;

    try {
        await caches.delete(CACHE_NAME);
        console.log('[AssetCache] Cache cleared successfully');
    } catch (err) {
        console.warn('[AssetCache] Failed to clear cache:', err);
    }
}

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
