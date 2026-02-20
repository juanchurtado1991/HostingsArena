"use client";
import { useState } from "react";
import { testAllAffiliateLinks } from "@/lib/actions/testAffiliates";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/button";
import { RefreshCw, ExternalLink, CheckCircle, AlertTriangle } from "lucide-react";

export function AffiliateLinkTester() {
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const runTest = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await testAllAffiliateLinks();
            setResults(data);
        } catch (err: any) {
            setError(err.message || 'Error running test');
        } finally {
            setLoading(false);
        }
    };

    const activeLinksCount = results.filter(r => !r.isFallback).length;
    const missingLinksCount = results.filter(r => r.isFallback).length;

    return (
        <GlassCard className="p-8">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        Sitewide Affiliate Verification Tool
                    </h2>
                    <p className="text-sm text-muted-foreground">Generates and verifies affiliate links for all providers to ensure buttons are monetizing correctly.</p>
                </div>
                <Button onClick={runTest} disabled={loading} className="font-bold">
                    <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    {loading ? 'Running Test...' : 'Run Sitewide Test'}
                </Button>
            </div>

            {error && <div className="text-red-500 mb-4 font-bold">{error}</div>}

            {results.length > 0 && (
                <>
                    <div className="flex gap-4 mb-6">
                        <div className="px-4 py-2 bg-green-500/10 text-green-500 rounded-lg flex items-center gap-2 border border-green-500/20">
                            <CheckCircle className="w-5 h-5" />
                            <span className="font-bold">{activeLinksCount} Active Affiliate Links</span>
                        </div>
                        <div className="px-4 py-2 bg-red-500/10 text-red-500 rounded-lg flex items-center gap-2 border border-red-500/20">
                            <AlertTriangle className="w-5 h-5" />
                            <span className="font-bold">{missingLinksCount} Missing (Fallback to Website)</span>
                        </div>
                    </div>

                    <div className="overflow-x-auto max-h-[600px] border border-white/10 rounded-xl relative">
                        <table className="w-full text-left text-sm">
                            <thead className="text-xs uppercase text-muted-foreground border-b border-white/10 sticky top-0 bg-background/95 backdrop-blur z-10 shadow-sm">
                                <tr>
                                    <th className="py-4 pl-4">Provider</th>
                                    <th className="py-4">Type</th>
                                    <th className="py-4">Status</th>
                                    <th className="py-4">Generated URL</th>
                                    <th className="py-4 text-right pr-4">Test Button</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 bg-background/30">
                                {results.map((r, i) => (
                                    <tr key={i} className="hover:bg-white/5 transition-colors">
                                        <td className="py-3 pl-4 font-bold">{r.providerName}</td>
                                        <td className="py-3 uppercase text-xs tracking-wider text-muted-foreground">{r.type}</td>
                                        <td className="py-3">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${r.isFallback ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'}`}>
                                                {r.isFallback ? <AlertTriangle className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
                                                {r.status}
                                            </span>
                                        </td>
                                        <td className="py-3 font-mono text-[11px] max-w-[300px] truncate text-muted-foreground" title={r.generatedUrl}>
                                            {r.generatedUrl}
                                        </td>
                                        <td className="py-3 text-right pr-4">
                                            <Button variant={r.isFallback ? "outline" : "default"} size="sm" asChild className="h-8 text-xs font-bold rounded-full px-4 text-white">
                                                <a href={r.generatedUrl} target="_blank" rel="noopener noreferrer" className={r.isFallback ? "text-foreground" : "bg-primary"}>
                                                    Test Link <ExternalLink className="w-3 h-3 ml-2" />
                                                </a>
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </GlassCard>
    );
}
