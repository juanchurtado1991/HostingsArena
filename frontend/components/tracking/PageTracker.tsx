"use client";

import { useTrackPageView } from "@/hooks/useTrackPageView";

export function PageTracker({ postSlug }: { postSlug?: string }) {
    useTrackPageView(postSlug);
    return null;
}
