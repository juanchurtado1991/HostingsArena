"use client";

import { useEffect } from "react";

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

        if (typeof navigator !== "undefined" && navigator.sendBeacon) {
            navigator.sendBeacon(url, data);
        } else {
            fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: data,
                keepalive: true,
            }).catch(() => { });
        }
    }, [postSlug]);
}
