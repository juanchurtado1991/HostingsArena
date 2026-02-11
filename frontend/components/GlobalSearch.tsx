"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Search, Server, Globe, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function GlobalSearch() {
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
                    className="w-[200px] lg:w-[300px] justify-between text-muted-foreground bg-muted/50 border-input hover:bg-accent hover:text-accent-foreground"
                >
                    <span className="flex items-center gap-2">
                        <Search className="h-4 w-4" />
                        <span className="hidden lg:inline">Search providers...</span>
                        <span className="lg:hidden">Search...</span>
                    </span>
                    <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                        <span className="text-xs">⌘</span>K
                    </kbd>
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
                                            className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                                        >
                                            <Server className="mr-2 h-4 w-4 text-primary" />
                                            {provider.provider_name}
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
                                            className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                                        >
                                            <Globe className="mr-2 h-4 w-4 text-green-500" />
                                            {provider.provider_name}
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
