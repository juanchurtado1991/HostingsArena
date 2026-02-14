"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Search, Server, Globe, Loader2 } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface GlobalSearchProps {
    placeholder?: string;
    variant?: "default" | "hero";
    className?: string;
}

export function GlobalSearch({
    placeholder = "Search providers...",
    variant = "default",
    className
}: GlobalSearchProps) {
    const [open, setOpen] = React.useState(false);
    const [loading, setLoading] = React.useState(false);
    const [hostingResults, setHostingResults] = React.useState<any[]>([]);
    const [vpnResults, setVpnResults] = React.useState<any[]>([]);
    const supabase = createClient();
    const router = useRouter();

    const [searchTerm, setSearchTerm] = React.useState("");

    React.useEffect(() => {
        const fetchAll = async () => {
            if (!open) return;

            setLoading(true);

            try {
                let hostingUrl = `/api/providers?type=hosting`;
                if (searchTerm) hostingUrl += `&search=${encodeURIComponent(searchTerm)}`;

                const hostingRes = await fetch(hostingUrl);
                let hostingData = [];
                if (hostingRes.ok) {
                    try {
                        hostingData = await hostingRes.json();
                    } catch (e) {
                        console.error("Hosting JSON parse error", e);
                    }
                }

                let vpnUrl = `/api/providers?type=vpn`;
                if (searchTerm) vpnUrl += `&search=${encodeURIComponent(searchTerm)}`;

                const vpnRes = await fetch(vpnUrl);
                let vpnData = [];
                if (vpnRes.ok) {
                    try {
                        vpnData = await vpnRes.json();
                    } catch (e) {
                        console.error("VPN JSON parse error", e);
                    }
                }

                setHostingResults(Array.isArray(hostingData) ? hostingData.slice(0, 5) : []);
                setVpnResults(Array.isArray(vpnData) ? vpnData.slice(0, 5) : []);

            } catch (err) {
                console.error("Global Search Fetch Error:", err);
                setHostingResults([]);
                setVpnResults([]);
            } finally {
                setLoading(false);
            }
        };

        const timeoutId = setTimeout(() => {
            fetchAll();
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [open, searchTerm, supabase]);

    const handleSelect = (result: any, type: 'hosting' | 'vpn') => {
        setOpen(false);
        setSearchTerm("");
        const slug = result.slug || result.provider_name.toLowerCase().replace(/\s+/g, '-');
        router.push(`/${type}/${slug}`);
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn(
                        "justify-between text-muted-foreground transition-all duration-300",
                        variant === "default"
                            ? "w-[200px] xl:w-[300px] bg-muted/50 border-input hover:bg-accent hover:text-accent-foreground"
                            : "w-full max-w-2xl h-14 px-6 rounded-2xl bg-background/50 backdrop-blur-md border-primary/20 hover:border-primary/40 hover:bg-background/80 text-lg shadow-xl shadow-primary/5",
                        className
                    )}
                >
                    <span className="flex items-center gap-3">
                        <Search className={cn("text-primary", variant === "default" ? "h-4 w-4" : "h-5 w-5")} />
                        <span className={cn(variant === "default" ? "hidden xl:inline" : "")}>
                            {placeholder}
                        </span>
                        {variant === "default" && <span className="xl:hidden">Search...</span>}
                    </span>
                    {variant === "default" && (
                        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                            <span className="text-xs">⌘</span>K
                        </kbd>
                    )}
                    {variant === "hero" && (
                        <div className="flex items-center gap-2 text-xs font-bold text-primary/40 uppercase tracking-widest hidden sm:flex">
                            {placeholder.includes("Hosting") ? "Hosting" : "Search"}
                        </div>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] lg:w-[400px] p-0 backdrop-blur-xl bg-popover/95 border-border text-popover-foreground shadow-2xl">
                <div className="flex items-center border-b px-3">
                    <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                    <input
                        className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="Search Hosting or VPNs..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        autoFocus
                    />
                </div>

                <div className="max-h-[400px] overflow-y-auto p-1">
                    {loading && (
                        <div className="py-6 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" /> Loading...
                        </div>
                    )}

                    {!loading && hostingResults.length === 0 && vpnResults.length === 0 && (
                        <div className="py-6 text-center text-sm text-muted-foreground">No results found.</div>
                    )}

                    {!loading && (
                        <>
                            {hostingResults.length > 0 && (
                                <div className="mb-2">
                                    <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">Hosting Providers</div>
                                    {hostingResults.map((provider) => (
                                        <div
                                            key={provider.id}
                                            onClick={() => handleSelect(provider, 'hosting')}
                                            className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground group/item"
                                        >
                                            <Server className="mr-2 h-4 w-4 text-primary" />
                                            <span className="flex-1">{provider.provider_name}</span>
                                            {provider.pricing_monthly !== undefined && provider.pricing_monthly !== null && (
                                                <span className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded ml-2 group-hover/item:bg-background">
                                                    {formatCurrency(provider.pricing_monthly)}
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {hostingResults.length > 0 && vpnResults.length > 0 && <div className="h-px bg-border my-1" />}

                            {vpnResults.length > 0 && (
                                <div>
                                    <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">VPN Services</div>
                                    {vpnResults.map((provider) => (
                                        <div
                                            key={provider.id}
                                            onClick={() => handleSelect(provider, 'vpn')}
                                            className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground group/item"
                                        >
                                            <Globe className="mr-2 h-4 w-4 text-green-500" />
                                            <span className="flex-1">{provider.provider_name}</span>
                                            {provider.pricing_monthly !== undefined && provider.pricing_monthly !== null && (
                                                <span className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded ml-2 group-hover/item:bg-background">
                                                    {formatCurrency(provider.pricing_monthly)}
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}
