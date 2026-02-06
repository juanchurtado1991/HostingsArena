"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Search, Server, Globe, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export function GlobalSearch() {
    const [open, setOpen] = React.useState(false);
    const [loading, setLoading] = React.useState(false);
    const [hostingResults, setHostingResults] = React.useState<any[]>([]);
    const [vpnResults, setVpnResults] = React.useState<any[]>([]);
    const supabase = createClient();
    const router = useRouter();

    React.useEffect(() => {
        const fetchAll = async () => {
            // Only fetch when open to save resources, or pre-fetch on mount? 
            // For global search, maybe better to fetch on open or type.
            // Let's fetch on open for now to ensure fresh data.
            if (!open) return;

            setLoading(true);

            // Fetch Hosting
            const { data: hostingData } = await supabase
                .from("hosting_providers")
                .select("id, provider_name, slug")
                .order("provider_name", { ascending: true })
                .limit(20);

            // Fetch VPNs
            const { data: vpnData } = await supabase
                .from("vpn_providers")
                .select("id, provider_name, website_url") // VPNs might not have slugs yet, using name fallback
                .order("provider_name", { ascending: true })
                .limit(20);

            setHostingResults(hostingData || []);
            setVpnResults(vpnData || []);
            setLoading(false);
        };

        fetchAll();
    }, [open, supabase]);

    const handleSelect = (result: any, type: 'hosting' | 'vpn') => {
        setOpen(false);
        // Normalize slug
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
            <PopoverContent className="w-[300px] lg:w-[400px] p-0 backdrop-blur-xl bg-popover/90 border-border text-popover-foreground">
                <Command className="bg-transparent">
                    <CommandInput placeholder="Search Hosting or VPNs..." />
                    <CommandList className="max-h-[400px] overflow-y-auto">
                        <CommandEmpty>No results found.</CommandEmpty>
                        {loading && (
                            <div className="py-6 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" /> Loading...
                            </div>
                        )}
                        {!loading && (
                            <>
                                <CommandGroup heading="Hosting Providers">
                                    {hostingResults.map((provider) => (
                                        <CommandItem
                                            key={provider.id}
                                            value={`hosting-${provider.provider_name}`}
                                            onSelect={() => handleSelect(provider, 'hosting')}
                                            className="cursor-pointer aria-selected:bg-accent aria-selected:text-accent-foreground"
                                        >
                                            <Server className="mr-2 h-4 w-4 text-primary" />
                                            {provider.provider_name}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                                <CommandSeparator />
                                <CommandGroup heading="VPN Services">
                                    {vpnResults.map((provider) => (
                                        <CommandItem
                                            key={provider.id}
                                            value={`vpn-${provider.provider_name}`}
                                            onSelect={() => handleSelect(provider, 'vpn')}
                                            className="cursor-pointer aria-selected:bg-accent aria-selected:text-accent-foreground"
                                        >
                                            <Globe className="mr-2 h-4 w-4 text-green-500" />
                                            {provider.provider_name}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </>
                        )}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
