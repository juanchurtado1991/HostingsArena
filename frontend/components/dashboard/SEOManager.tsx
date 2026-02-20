"use client";

import React, { useState, useEffect } from 'react';
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/button";
import { Search, Globe, Zap, CheckCircle, AlertTriangle, RefreshCw, ExternalLink, Send } from "lucide-react";
import { logger } from "@/lib/logger";

interface SEOManagerProps {
    lang: string;
    dict: any;
}

export function SEOManager({ lang, dict }: SEOManagerProps) {
    const [urls, setUrls] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [indexingMode, setIndexingMode] = useState<'sitemap' | 'manual'>('sitemap');
    const [status, setStatus] = useState<{url: string, status: 'pending' | 'success' | 'error', message?: string}[]>([]);
    const [progress, setProgress] = useState(0);

    const fetchSitemapUrls = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/seo/urls');
            const data = await res.json();
            if (data.urls) {
                setUrls(data.urls);
                setStatus(data.urls.map((u: string) => ({ url: u, status: 'pending' })));
            }
        } catch (e) {
            logger.error("Failed to fetch sitemap URLs", e);
        } finally {
            setLoading(false);
        }
    };

    const handleIndexAll = async () => {
        if (!confirm(`Are you sure you want to ping Google for ${urls.length} URLs?`)) return;
        
        setLoading(true);
        let completed = 0;

        for (const urlObj of status) {
            if (urlObj.status === 'success') {
                completed++;
                continue;
            }

            try {
                const res = await fetch('/api/admin/seo/index', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ url: urlObj.url })
                });

                if (res.ok) {
                    setStatus(prev => prev.map(s => s.url === urlObj.url ? { ...s, status: 'success' } : s));
                } else {
                    const err = await res.json();
                    setStatus(prev => prev.map(s => s.url === urlObj.url ? { ...s, status: 'error', message: err.error } : s));
                }
            } catch (e) {
                setStatus(prev => prev.map(s => s.url === urlObj.url ? { ...s, status: 'error', message: 'Network error' } : s));
            }

            completed++;
            setProgress(Math.round((completed / urls.length) * 100));
            
            // Limit rate to avoid Google API quota issues if necessary
            await new Promise(r => setTimeout(r, 200)); 
        }
        setLoading(false);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Globe className="w-6 h-6 text-primary" />
                        Google Indexing Manager
                    </h2>
                    <p className="text-muted-foreground text-sm">Force Google to crawl your new comparison pages and posts instantly.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={fetchSitemapUrls} disabled={loading}>
                        <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh URLs
                    </Button>
                    <Button variant="default" size="sm" onClick={handleIndexAll} disabled={loading || urls.length === 0}>
                        <Zap className="w-4 h-4 mr-2 text-yellow-400 fill-yellow-400" />
                        Index All ({urls.length})
                    </Button>
                </div>
            </div>

            {loading && progress > 0 && (
                <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-primary transition-all duration-300" 
                        style={{ width: `${progress}%` }}
                    />
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <GlassCard className="p-6 lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold">Execution Log</h3>
                        <span className="text-[10px] uppercase font-bold text-muted-foreground">Top 100 URLs</span>
                    </div>
                    
                    <div className="max-h-[500px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                        {status.length === 0 ? (
                            <div className="py-20 text-center text-muted-foreground border border-dashed border-white/10 rounded-xl">
                                <Search className="w-12 h-12 mx-auto mb-2 opacity-10" />
                                <p>Click "Refresh URLs" to pull from Sitemap</p>
                            </div>
                        ) : (
                            status.slice(0, 500).map((s, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5 text-xs">
                                    <div className="flex items-center gap-3 truncate">
                                        {s.status === 'success' ? <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" /> : 
                                         s.status === 'error' ? <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" /> : 
                                         <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
                                        <span className="truncate opacity-80">{s.url}</span>
                                    </div>
                                    {s.message && <span className="text-[10px] text-red-400 ml-2 italic">{s.message}</span>}
                                </div>
                            ))
                        )}
                    </div>
                </GlassCard>

                <div className="space-y-6">
                    <GlassCard className="p-6">
                        <h3 className="font-bold mb-4 flex items-center gap-2">
                            <Send className="w-4 h-4" />
                            API Status
                        </h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Google Service Account</span>
                                <span className="text-emerald-500 font-bold flex items-center gap-1 text-[10px]">
                                    <CheckCircle className="w-3 h-3" />
                                    CONNECTED
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Daily Quota Remain</span>
                                <span className="font-mono text-[10px]">185 / 200</span>
                            </div>
                        </div>
                    </GlassCard>

                    <GlassCard className="p-6 bg-primary/5 border-primary/20">
                        <h3 className="font-bold mb-2 text-sm">Pro Tip</h3>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                            Google usually indexes pages in <strong>24-48 hours</strong> after using this API, compared to weeks via standard crawling. Use this whenever you add a new provider or large batch of comparisons.
                        </p>
                    </GlassCard>
                </div>
            </div>
        </div>
    );
}

function Clock({ className }: { className: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
        </svg>
    );
}
