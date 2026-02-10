"use client";

import { useTrackPageView } from "@/hooks/useTrackPageView";

/**
 * Drop-in client component for server pages.
 * Tracks a page view on mount.
 * 
 * Usage in server components:
 *   <PageTracker />                     — tracks current path
 *   <PageTracker postSlug="my-post" />  — also tracks as a post view
 */
export function PageTracker({ postSlug }: { postSlug?: string }) {
    useTrackPageView(postSlug);
    return null;
}
