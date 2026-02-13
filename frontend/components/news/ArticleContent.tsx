"use client";

import { useEffect, useRef } from "react";
import { trackAffiliateClick } from "@/lib/analytics";
import { cn } from "@/lib/utils";

interface ArticleContentProps {
    content: string;
    className?: string;
}

export function ArticleContent({ content, className }: ArticleContentProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        // Find all links that might be affiliate links
        // The editor will add data-provider attribute to affiliate links
        // But we also want to catch old links if possible, or just rely on the new ones
        const links = container.querySelectorAll("a");

        const handleClick = (e: MouseEvent) => {
            const target = e.currentTarget as HTMLAnchorElement;
            const provider = target.getAttribute("data-provider") || target.title || target.textContent;

            // Only track if it looks like an external/affiliate link or explicitly marked
            if (provider && (target.getAttribute("data-affiliate") === "true" || target.getAttribute("data-provider"))) {
                trackAffiliateClick(provider, target.href, "news_content_link");
            }
        };

        links.forEach(link => {
            // Check if it's an affiliate link (marked by editor or heuristically)
            if (link.getAttribute("data-provider") || link.getAttribute("href")?.includes("/go/")) {
                link.addEventListener("click", handleClick as EventListener);
            }
        });

        return () => {
            links.forEach(link => {
                link.removeEventListener("click", handleClick as EventListener);
            });
        };
    }, [content]);

    return (
        <div
            ref={containerRef}
            className={cn(
                "prose prose-lg dark:prose-invert max-w-none",
                "prose-headings:font-bold prose-headings:tracking-tight",
                "prose-a:text-primary prose-a:no-underline hover:prose-a:underline",
                "prose-img:rounded-2xl prose-img:shadow-lg",
                "prose-p:leading-relaxed prose-p:text-muted-foreground",
                className
            )}
            dangerouslySetInnerHTML={{ __html: content }}
        />
    );
}
