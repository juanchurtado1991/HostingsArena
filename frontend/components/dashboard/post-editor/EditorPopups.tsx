import { X, ExternalLink, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/GlassCard";
import { normalizeUrl } from "./utils";
import { AffiliateLink } from "./types";

export function LinkMenu({
    show,
    onClose,
    linkUrl,
    setLinkUrl,
    editor
}: any) {
    if (!show) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <GlassCard className="w-full max-w-sm p-6 shadow-2xl relative animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-bold flex items-center gap-2">
                        <LinkIcon className="w-4 h-4 text-primary" />
                        Edit Link
                    </h4>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                        <X className="w-4 h-4" />
                    </button>
                </div>
                <div className="space-y-4">
                    <input
                        type="url"
                        value={linkUrl}
                        onChange={(e) => setLinkUrl(e.target.value)}
                        placeholder="https://example.com"
                        className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                        autoFocus
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                if (linkUrl === '') {
                                    editor.chain().focus().extendMarkRange('link').unsetLink().run();
                                } else {
                                    const normalized = normalizeUrl(linkUrl);
                                    editor.chain().focus().extendMarkRange('link').setLink({ href: normalized }).run();
                                }
                                onClose();
                            }
                        }}
                    />
                    <div className="flex gap-2">
                        <Button
                            variant="ghost"
                            className="flex-1 rounded-xl"
                            onClick={() => {
                                editor.chain().focus().extendMarkRange('link').unsetLink().run();
                                onClose();
                            }}
                        >
                            Remove
                        </Button>
                        <Button
                            className="flex-1 rounded-xl font-bold"
                            onClick={() => {
                                if (linkUrl === '') {
                                    editor.chain().focus().extendMarkRange('link').unsetLink().run();
                                } else {
                                    const normalized = normalizeUrl(linkUrl);
                                    editor.chain().focus().extendMarkRange('link').setLink({ href: normalized }).run();
                                }
                                onClose();
                            }}
                        >
                            Apply
                        </Button>
                    </div>
                </div>
            </GlassCard>
        </div>
    );
}

export function VsMenu({
    show,
    onClose,
    vsCategory,
    setVsCategory,
    vsA,
    setVsA,
    vsB,
    setVsB,
    vsProviders,
    vsLoading,
    editor
}: any) {
    if (!show) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="w-full max-w-[320px] p-5 bg-background border border-border rounded-3xl shadow-2xl z-50 animate-in zoom-in-95 duration-200 relative">
                <div className="space-y-4">
                    <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-black uppercase tracking-wider text-primary flex items-center gap-2">
                            <span className="p-1 px-1.5 bg-primary text-white rounded text-[10px]">VS</span>
                            Comparison
                        </h4>
                        <button onClick={onClose} className="text-muted-foreground hover:text-foreground hover:rotate-90 transition-transform" type="button">
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="flex p-1 bg-muted/50 rounded-xl mb-4 ring-1 ring-border/50">
                        <button
                            type="button"
                            onClick={() => setVsCategory("hosting")}
                            className={`flex-1 py-2 text-[10px] font-bold rounded-lg transition-all ${vsCategory === "hosting" ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"}`}
                        >
                            HOSTING
                        </button>
                        <button
                            type="button"
                            onClick={() => setVsCategory("vpn")}
                            className={`flex-1 py-2 text-[10px] font-bold rounded-lg transition-all ${vsCategory === "vpn" ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"}`}
                        >
                            VPN
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] uppercase font-bold text-muted-foreground/60 px-1">Provider A</label>
                            <select
                                value={vsA}
                                onChange={(e) => setVsA(e.target.value)}
                                className="w-full bg-muted/50 rounded-2xl px-4 py-2.5 text-sm border-none ring-1 ring-border/50 focus:ring-primary/50 outline-none font-medium"
                                disabled={vsLoading}
                            >
                                <option value="">{vsLoading ? 'Loading...' : 'Select...'}</option>
                                {vsProviders.map((a: any) => (
                                    <option key={a.id} value={a.id}>{a.provider_name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] uppercase font-bold text-muted-foreground/60 px-1">Provider B</label>
                            <select
                                value={vsB}
                                onChange={(e) => setVsB(e.target.value)}
                                className="w-full bg-muted/50 rounded-2xl px-4 py-2.5 text-sm border-none ring-1 ring-border/50 focus:ring-primary/50 outline-none font-medium"
                                disabled={vsLoading}
                            >
                                <option value="">{vsLoading ? 'Loading...' : 'Select...'}</option>
                                {vsProviders.map((a: any) => (
                                    <option key={a.id} value={a.id}>{a.provider_name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <Button
                        className="w-full rounded-2xl py-6 font-bold shadow-xl shadow-primary/20 mt-2"
                        disabled={!vsA || !vsB || vsA === vsB || vsLoading}
                        type="button"
                        onClick={() => {
                            const lang = window.location.pathname.split('/')[1] || 'en';
                            const finalLang = ['en', 'es'].includes(lang) ? lang : 'en';
                            const url = `/${finalLang}/compare?a=${vsA}&b=${vsB}&cat=${vsCategory}`;

                            const providerA = vsProviders.find((p: any) => p.id === vsA);
                            const providerB = vsProviders.find((p: any) => p.id === vsB);
                            const label = `${providerA?.provider_name || 'Provider A'} vs ${providerB?.provider_name || 'Provider B'}`;

                            editor.chain().focus().extendMarkRange('link').setLink({ href: url }).insertContent(label).run();
                            onClose();
                            setVsA("");
                            setVsB("");
                        }}
                    >
                        Insert Comparison
                    </Button>
                </div>
            </div>
        </div>
    );
}

export function AffiliateMenu({
    show,
    onClose,
    affSearch,
    setAffSearch,
    filteredLinks,
    onInsertAffiliate
}: any) {
    if (!show) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="w-full max-w-[320px] rounded-3xl bg-background border border-border shadow-2xl z-50 overflow-hidden animate-in zoom-in-95 duration-200 relative">
                <div className="p-4 border-b border-border/50 bg-primary/5 flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary/60">Active Partners</span>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                        <X className="w-4 h-4" />
                    </button>
                </div>
                <div className="p-4">
                    <input
                        type="text"
                        value={affSearch}
                        onChange={(e) => setAffSearch(e.target.value)}
                        placeholder="Search partners..."
                        className="w-full px-4 py-2.5 rounded-2xl bg-muted/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                        autoFocus
                    />
                </div>
                <div className="max-h-60 overflow-y-auto pb-4 px-2">
                    {filteredLinks.length === 0 ? (
                        <div className="py-8 text-xs text-muted-foreground text-center">
                            No active affiliates found
                        </div>
                    ) : filteredLinks.map((link: any) => (
                        <button
                            key={link.id}
                            type="button"
                            onClick={() => {
                                onInsertAffiliate(link);
                                onClose();
                                setAffSearch("");
                            }}
                            className="w-full text-left px-4 py-3 text-sm hover:bg-primary/5 rounded-2xl transition-all flex items-center justify-between group"
                        >
                            <span className="font-semibold group-hover:text-primary">{link.provider_name}</span>
                            <ExternalLink className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
