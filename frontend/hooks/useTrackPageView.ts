"use client";

import { useEffect } from "react";

/**
 * Lightweight page view tracker.
 * Sends a beacon to /api/track on mount.
 * Use in layout or individual pages.
 */
export function useTrackPageView(postSlug?: string) {
    useEffect(() => {
        const url = "/api/track";
        const searchParams = new URLSearchParams(window.location.search);

        const data = JSON.stringify({
            path: window.location.pathname,
            referrer: document.referrer || null,
            post_slug: postSlug || null,
            utm_source: searchParams.get("utm_source") || null,
            utm_medium: searchParams.get("utm_medium") || null,
            utm_campaign: searchParams.get("utm_campaign") || null,
        });

        // Use sendBeacon for reliable tracking that doesn't abort
        if (typeof navigator !== "undefined" && navigator.sendBeacon) {
            navigator.sendBeacon(url, data);
        } else {
            // Fallback to fetch but carefully catch errors
            fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: data,
                keepalive: true,
            }).catch(() => {
                // Ignore tracking errors to prevent crashes
            });
        }
    }, [postSlug]);
}
