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
        const data = JSON.stringify({
            path: window.location.pathname,
            referrer: document.referrer || null,
            post_slug: postSlug || null,
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
