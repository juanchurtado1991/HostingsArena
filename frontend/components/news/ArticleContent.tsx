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

        const links = container.querySelectorAll("a");

        const handleClick = (e: MouseEvent) => {
            const target = e.currentTarget as HTMLAnchorElement;
            const provider = target.getAttribute("data-provider") || target.title || target.textContent || "External Link";
            const href = target.getAttribute("href") || "";

            const isAffiliate = target.getAttribute("data-affiliate") === "true" || target.getAttribute("data-provider");
            const isRedirect = href.includes("/go/");
            const isExternal = href.startsWith("http") && !href.includes(window.location.hostname);

            if (isAffiliate || isRedirect || isExternal) {
                console.log(`[Tracking] News link click: ${provider} -> ${href}`);
                trackAffiliateClick(provider, href, "news_content_link");
            }
        };

        links.forEach(link => {
            link.addEventListener("click", handleClick as EventListener);
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
                "article-body w-full max-w-none",
                className
            )}
            dangerouslySetInnerHTML={{ __html: content }}
        />
    );
}
