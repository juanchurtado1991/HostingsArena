import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Loader2, Globe, ExternalLink, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PublishSummaryModalProps {
    isOpen: boolean;
    onClose: () => void;
    status: 'loading' | 'success' | 'error';
    postUrl: string;
    socialLinks?: {
        x_url?: string;
        li_url?: string;
    };
    errorDetails?: string;
    onRetry?: () => void;
}

export function PublishSummaryModal({
    isOpen,
    onClose,
    status,
    postUrl,
    socialLinks,
    errorDetails,
    onRetry
}: PublishSummaryModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl p-8 transform transition-all scale-100 border border-zinc-100 dark:border-zinc-800">

                {/* Header / Icon */}
                <div className="flex flex-col items-center justify-center mb-6">
                    {status === 'loading' && (
                        <div className="p-4 rounded-full bg-blue-50 text-blue-500 mb-4 animate-pulse">
                            <Loader2 className="w-8 h-8 animate-spin" />
                        </div>
                    )}
                    {status === 'success' && (
                        <div className="p-4 rounded-full bg-green-50 text-green-500 mb-4">
                            <CheckCircle className="w-8 h-8" />
                        </div>
                    )}
                    {status === 'error' && (
                        <div className="p-4 rounded-full bg-red-50 text-red-500 mb-4">
                            <XCircle className="w-8 h-8" />
                        </div>
                    )}

                    <h2 className="text-2xl font-bold text-center text-zinc-900 dark:text-white">
                        {status === 'loading' && "Publishing & Distributing..."}
                        {status === 'success' && "Published Successfully! 🚀"}
                        {status === 'error' && "Distribution Failed ❌"}
                    </h2>

                    <p className="text-center text-zinc-500 mt-2 text-sm max-w-xs">
                        {status === 'loading' && "Saving post, triggering webhooks, and requesting Google Indexing."}
                        {status === 'success' && "Your post is live and has been distributed to your social networks."}
                        {status === 'error' && "The post was saved, but social distribution failed."}
                    </p>
                </div>

                {/* Content */}
                <div className="space-y-4">
                    {/* HostingArena Link */}
                    {(status === 'success' || status === 'loading') && (
                        <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white dark:bg-zinc-700 rounded-lg shadow-sm">
                                    <Globe className="w-5 h-5 text-blue-600" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">HostingArena</span>
                                    <span className="text-xs text-zinc-500">Live Post</span>
                                </div>
                            </div>
                            {status === 'success' ? (
                                <a
                                    href={postUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-xs font-medium text-blue-600 hover:underline flex items-center gap-1"
                                >
                                    View <ExternalLink className="w-3 h-3" />
                                </a>
                            ) : (
                                <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
                            )}
                        </div>
                    )}

                    {/* Social Links (Success only) */}
                    {status === 'success' && (
                        <>
                            {socialLinks?.x_url && (
                                <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-black text-white rounded-lg shadow-sm">
                                            {/* X Icon */}
                                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zl-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">X (Twitter)</span>
                                            <span className="text-xs text-zinc-500">Distributed</span>
                                        </div>
                                    </div>
                                    <a
                                        href={socialLinks.x_url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-xs font-medium text-blue-600 hover:underline flex items-center gap-1"
                                    >
                                        View <ExternalLink className="w-3 h-3" />
                                    </a>
                                </div>
                            )}

                            {socialLinks?.li_url && (
                                <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-[#0077b5] text-white rounded-lg shadow-sm">
                                            {/* LinkedIn Icon */}
                                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">LinkedIn</span>
                                            <span className="text-xs text-zinc-500">Distributed</span>
                                        </div>
                                    </div>
                                    <a
                                        href={socialLinks.li_url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-xs font-medium text-blue-600 hover:underline flex items-center gap-1"
                                    >
                                        View <ExternalLink className="w-3 h-3" />
                                    </a>
                                </div>
                            )}
                        </>
                    )}

                    {/* Error Details */}
                    {status === 'error' && (
                        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 text-sm text-red-600 dark:text-red-400">
                            <p className="font-semibold mb-1">Error Details:</p>
                            <p className="font-mono text-xs opacity-80 break-words">{errorDetails || "Unknown error occurred"}</p>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="mt-8 flex justify-center gap-3">
                    {status === 'error' && onRetry && (
                        <Button
                            variant="outline"
                            onClick={onRetry}
                            className="rounded-full px-6 py-2"
                        >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Retry Distribution
                        </Button>
                    )}

                    <Button
                        onClick={onClose}
                        className={`rounded-full px-8 py-2 font-medium transition-all ${status === 'success'
                                ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:scale-105'
                                : 'bg-transparent text-zinc-500 hover:text-zinc-900'
                            }`}
                        variant={status === 'success' ? 'default' : 'ghost'}
                    >
                        {status === 'success' ? "Done" : "Close"}
                    </Button>
                </div>

            </div>
        </div>
    );
}
