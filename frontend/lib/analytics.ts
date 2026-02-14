export const trackAffiliateClick = async (provider: string, targetUrl: string, position: string = 'unknown') => {
    try {
        const data = JSON.stringify({
            provider_name: provider,
            target_url: targetUrl,
            page_path: typeof window !== "undefined" ? window.location.pathname : 'unknown',
            position: position,
        });

        const url = "/api/track/click";

        if (typeof navigator !== "undefined" && navigator.sendBeacon) {
            const blob = new Blob([data], { type: 'application/json' });
            navigator.sendBeacon(url, blob);
        } else {
            await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: data,
                keepalive: true,
            });
        }
    } catch (e) {
        console.error("Failed to track click", e);
    }
};
