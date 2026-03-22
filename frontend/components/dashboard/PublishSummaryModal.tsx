"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PublishStatusHeader } from "./publish-modal/PublishStatusHeader";
import { PlatformStatus } from "./publish-modal/PlatformStatus";
import { LanguageSwitcher } from "./publish-modal/LanguageSwitcher";
import { SocialContentCard } from "./publish-modal/SocialContentCard";

interface PublishSummaryModalProps {
    isOpen: boolean;
    onClose: () => void;
    status: 'loading' | 'success' | 'error';
    postUrl: string;
    socialContent?: {
        twitter?: string;
        facebook?: string;
        linkedin?: string;
        hashtags?: string[];
    };
    socialContentEs?: {
        twitter?: string;
        facebook?: string;
        linkedin?: string;
        hashtags?: string[];
    };
    indexingStatus?: 'idle' | 'loading' | 'success' | 'error';
    errorDetails?: string;
    isScheduled?: boolean;
    scheduledDateStr?: string;
};

export function PublishSummaryModal({
    isOpen,
    onClose,
    status,
    postUrl,
    socialContent,
    socialContentEs,
    errorDetails,
    indexingStatus = 'idle',
    isScheduled = false,
    scheduledDateStr = ''
}: PublishSummaryModalProps) {
    const [activeLang, setActiveLang] = useState<'en' | 'es'>('en');
    const [copiedTw, setCopiedTw] = useState(false);
    const [copiedFb, setCopiedFb] = useState(false);
    const [copiedLi, setCopiedLi] = useState(false);

    if (!isOpen) return null;

    const handleCopy = async (text: string, type: 'tw' | 'li' | 'fb') => {
        try {
            await navigator.clipboard.writeText(text);
            if (type === 'tw') {
                setCopiedTw(true);
                setTimeout(() => setCopiedTw(false), 2000);
            } else if (type === 'fb') {
                setCopiedFb(true);
                setTimeout(() => setCopiedFb(false), 2000);
            } else {
                setCopiedLi(true);
                setTimeout(() => setCopiedLi(false), 2000);
            }
        } catch (err) {
            console.error("Failed to copy!", err);
        }
    };

    const currentContent = activeLang === 'es' && socialContentEs ? socialContentEs : socialContent;
    const localePrefix = activeLang === 'es' ? '/es' : '/en';
    const finalPostUrl = postUrl.replace(/https:\/\/hostingsarena\.com\/news\//, `https://hostingsarena.com${localePrefix}/news/`);

    const buildFullText = (baseText?: string) => {
        if (!baseText) return "";
        let text = baseText;

        if (currentContent?.hashtags && currentContent.hashtags.length > 0) {
            const hashtagsStr = currentContent.hashtags.join(' ');
            if (!text.includes(currentContent.hashtags[0])) {
                text += `\n\n${hashtagsStr}`;
            }
        }

        if (!text.match(/https?:\/\/(www\.)?hostingsarena\.com(\/[a-z]{2})?\/news\//)) {
            text += `\n\n${finalPostUrl}`;
        }

        return text;
    };

    const twitterFullText = buildFullText(currentContent?.twitter);
    const facebookFullText = buildFullText(currentContent?.facebook);
    const linkedinFullText = buildFullText(currentContent?.linkedin);

    return (
        <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 p-4"
            onClick={(e) => e.stopPropagation()} 
        >
            <div className="w-full max-w-xl bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl p-6 md:p-8 transform transition-all scale-100 border border-zinc-100 dark:border-zinc-800 max-h-[90vh] overflow-y-auto">

                <PublishStatusHeader status={status} isScheduled={isScheduled} />

                <div className="space-y-6">
                    {(status === 'success' || status === 'loading') && (
                        <PlatformStatus 
                            status={status}
                            indexingStatus={indexingStatus}
                            isScheduled={isScheduled}
                            scheduledDateStr={scheduledDateStr}
                            finalPostUrl={finalPostUrl}
                        />
                    )}

                    {status === 'success' && (
                        <LanguageSwitcher activeLang={activeLang} setActiveLang={setActiveLang} />
                    )}

                    {status === 'success' && (
                        <div className="grid gap-6">
                            <SocialContentCard 
                                platform="twitter"
                                title={activeLang === 'en' ? "Content for X (Twitter)" : "Contenido para X (Twitter)"}
                                content={twitterFullText}
                                isCopied={copiedTw}
                                onCopy={() => handleCopy(twitterFullText, 'tw')}
                                activeLang={activeLang}
                                platformIcon={
                                    <div className="p-1.5 bg-black text-white rounded-md">
                                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" /></svg>
                                    </div>
                                }
                            />

                            <SocialContentCard 
                                platform="facebook"
                                title={activeLang === 'en' ? "Content for Facebook" : "Contenido para Facebook"}
                                content={facebookFullText}
                                isCopied={copiedFb}
                                onCopy={() => handleCopy(facebookFullText, 'fb')}
                                activeLang={activeLang}
                                platformIcon={
                                    <div className="p-1.5 bg-[#1877F2] text-white rounded-md">
                                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                                    </div>
                                }
                            />

                            <SocialContentCard 
                                platform="linkedin"
                                title={activeLang === 'en' ? "Content for LinkedIn" : "Contenido para LinkedIn"}
                                content={linkedinFullText}
                                isCopied={copiedLi}
                                onCopy={() => handleCopy(linkedinFullText, 'li')}
                                activeLang={activeLang}
                                height="h-32"
                                platformIcon={
                                    <div className="p-1.5 bg-[#0077b5] text-white rounded-md">
                                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                                    </div>
                                }
                            />
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 text-sm text-red-600 dark:text-red-400">
                            <p className="font-semibold mb-1">Error Details:</p>
                            <p className="font-mono text-xs opacity-80 break-words">{errorDetails || "Unknown error occurred"}</p>
                        </div>
                    )}
                </div>

                <div className="mt-8 flex justify-center">
                    <Button
                        onClick={onClose}
                        className={`rounded-full px-12 py-3 font-bold transition-all hover:scale-105 active:scale-95 ${status === 'success'
                            ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900'
                            : 'bg-zinc-100 text-zinc-500'
                            }`}
                        variant={status === 'success' ? 'default' : 'ghost'}
                    >
                        {status === 'success' ? "Listo" : "Cerrar"}
                    </Button>
                </div>

            </div>
        </div>
    );
}