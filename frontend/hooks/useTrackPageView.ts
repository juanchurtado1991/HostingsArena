"use client";

import { useEffect } from "react";

/**
 * Lightweight page view tracker.
 * Sends a beacon to /api/track on mount.
 * Use in layout or individual pages.
 */
export function useTrackPageView(postSlug?: string) {
    useEffect(() => {
        const track = async () => {
            try {
                await fetch("/api/track", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        path: window.location.pathname,
                        referrer: document.referrer || null,
                        post_slug: postSlug || null,
                    }),
                    keepalive: true,
                });
            } catch {
                // Silent fail — tracking should never break the page
            }
        };
        track();
    }, [postSlug]);
}
