export const trackAffiliateClick = async (provider: string, targetUrl: string, position: string = 'unknown') => {
    try {
        const data = JSON.stringify({
            provider_name: provider,
            target_url: targetUrl,
            page_path: window.location.pathname,
            position: position,
            // UTMs are handled backend side if we persist session, but for now we can just send them if needed. 
            // Better to rely on page_views for UTM attribution via session/ip matching later.
        });

        const url = "/api/track/click";

        if (typeof navigator !== "undefined" && navigator.sendBeacon) {
            navigator.sendBeacon(url, data);
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
