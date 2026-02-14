"use client";

import { Facebook, Linkedin, Link2, MessageCircle, Twitter, Check } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface SocialShareProps {
    title: string;
    url: string;
    dict: {
        share_title: string;
        share_subtitle: string;
        copy_link: string;
        copied: string;
    };
    className?: string;
}

const XIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" className={cn("w-5 h-5 fill-current", className)} aria-hidden="true">
        <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932 6.064-6.932zm-1.294 19.497h2.039L6.482 3.239H4.293L17.607 20.65z" />
    </svg>
);

const WhatsAppIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" className={cn("w-5 h-5 fill-current", className)} aria-hidden="true">
        <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.18-2.587-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.664.07-.947-.03-1.026-.358-1.571-.741-2.457-1.536-.883-.794-1.285-1.554-1.859-2.502-.132-.218-.046-.432.062-.556.126-.145.244-.249.366-.4.124-.15.166-.256.248-.426.082-.17.042-.32-.02-.454-.06-.135-.553-1.332-.757-1.825-.2-.48-.413-.418-.567-.426l-.485-.008c-.167 0-.44.062-.67.314-.23.251-.877.857-.877 2.09 0 1.233.896 2.423 1.02 2.59.125.168 1.764 2.693 4.274 3.774.6.258 1.066.412 1.432.527.604.192 1.154.165 1.587.101.483-.072 1.487-.608 1.696-1.196.208-.588.208-1.094.147-1.197-.06-.103-.223-.165-.487-.298z" />
    </svg>
);

const FacebookIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" className={cn("w-5 h-5 fill-current", className)} aria-hidden="true">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
);

const LinkedInIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" className={cn("w-5 h-5 fill-current", className)} aria-hidden="true">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
);

export function SocialShare({ title, url, dict, className }: SocialShareProps) {
    const [copied, setCopied] = useState(false);

    const shareLinks = [
        {
            name: "X",
            icon: XIcon,
            href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
            color: "hover:text-[#000000] hover:bg-black/5 dark:hover:text-white dark:hover:bg-white/10"
        },
        {
            name: "Facebook",
            icon: FacebookIcon,
            href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
            color: "hover:text-[#1877F2] hover:bg-[#1877F2]/10"
        },
        {
            name: "LinkedIn",
            icon: LinkedInIcon,
            href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
            color: "hover:text-[#0A66C2] hover:bg-[#0A66C2]/10"
        },
        {
            name: "WhatsApp",
            icon: WhatsAppIcon,
            href: `https://wa.me/?text=${encodeURIComponent(title + " " + url)}`,
            color: "hover:text-[#25D366] hover:bg-[#25D366]/10"
        }
    ];

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy:", err);
        }
    };

    return (
        <div className={cn("mt-12 pt-8 border-t border-border/50", className)}>
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="text-center md:text-left">
                    <h3 className="font-bold text-xl mb-1">{dict.share_title}</h3>
                    <p className="text-sm text-muted-foreground">{dict.share_subtitle}</p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3">
                    {shareLinks.map((link) => (
                        <a
                            key={link.name}
                            href={link.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={cn(
                                "group relative p-3 rounded-2xl transition-all duration-300 bg-muted/30 text-muted-foreground ring-1 ring-border/20",
                                link.color,
                                "hover:scale-110 active:scale-95 hover:shadow-lg"
                            )}
                            title={`Share on ${link.name}`}
                        >
                            <link.icon className="w-5 h-5 group-hover:fill-current" />
                            <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-foreground text-background text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none font-bold whitespace-nowrap">
                                {link.name}
                            </span>
                        </a>
                    ))}

                    <div className="w-px h-8 bg-border/50 mx-1 hidden md:block" />

                    <button
                        onClick={copyToClipboard}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2.5 rounded-2xl transition-all duration-300 text-sm font-bold ring-1",
                            copied
                                ? "bg-green-500/10 text-green-600 ring-green-500/20"
                                : "bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 ring-primary/20"
                        )}
                    >
                        {copied ? (
                            <>
                                <Check className="w-4 h-4" />
                                {dict.copied}
                            </>
                        ) : (
                            <>
                                <Link2 className="w-4 h-4" />
                                {dict.copy_link}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
