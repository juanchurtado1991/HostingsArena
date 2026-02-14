"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { logger } from "@/lib/logger";

import { formatCurrency } from "@/lib/utils";

interface ProviderSelectorProps {
    type: "hosting" | "vpn";
    onSelect: (provider: any) => void;
    selectedProvider?: any;
    className?: string;
}

export function ProviderSelector({ type, onSelect, selectedProvider, className }: ProviderSelectorProps) {
    const [open, setOpen] = React.useState(false);
    const [searchTerm, setSearchTerm] = React.useState("");
    const [providers, setProviders] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(false);

    React.useEffect(() => {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
        const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

        logger.log('SYSTEM', `Supabase URL Check: ${url.substring(0, 15)}...`);

        if (!url || !key) {
            logger.error('CRITICAL: Missing Supabase Env Vars');
        }
    }, []);

    React.useEffect(() => {
        const fetchProviders = async () => {
            setLoading(true);
            logger.log('SEARCH', `Fetching providers for ${type} via PROXY API`);

            try {
                const response = await fetch(`/api/providers?type=${type}`);

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || `Proxy Error ${response.status}`);
                }

                const data = await response.json();

                logger.log('SEARCH', `Proxy Response Success`, {
                    count: data?.length,
                    sample: data?.[0] ? { name: data[0].provider_name, id: data[0].id } : 'Empty'
                });
                setProviders(data || []);

            } catch (err) {
                logger.error('CRITICAL SEARCH CRASH (Proxy)', err);
            } finally {
                setLoading(false);
            }
        };

        fetchProviders();
    }, [type]);

    const filteredProviders = providers.filter(p =>
        p.provider_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn("w-full justify-between backdrop-blur-md bg-background/50 border-input hover:bg-accent hover:text-accent-foreground", className)}
                >
                    {(selectedProvider?.provider_name || selectedProvider?.name) || `Select ${type === "hosting" ? "Host" : "VPN"}...`}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0 backdrop-blur-xl bg-popover/95 border-border text-popover-foreground shadow-xl">
                <div className="flex items-center border-b px-3">
                    <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                    <input
                        className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder={`Search ${type}...`}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="max-h-[300px] overflow-y-auto p-1">
                    {loading && <div className="py-6 text-center text-sm text-muted-foreground">Loading...</div>}

                    {!loading && filteredProviders.length === 0 && (
                        <div className="py-6 text-center text-sm text-muted-foreground">No provider found.</div>
                    )}

                    {!loading && filteredProviders.map((provider) => (
                        <div
                            key={provider.id}
                            className={cn(
                                "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                                selectedProvider?.id === provider.id && "bg-accent/50"
                            )}
                            onClick={() => {
                                logger.log('SEARCH', 'Provider selected via CLICK (Div)', { name: provider.provider_name });
                                onSelect(provider);
                                setOpen(false);
                                setSearchTerm(""); // Reset search after select
                            }}
                        >
                            <Check
                                className={cn(
                                    "mr-2 h-4 w-4",
                                    selectedProvider?.id === provider.id ? "opacity-100" : "opacity-0"
                                )}
                            />
                            <div className="flex-1 flex items-center justify-between">
                                <span>{provider.provider_name}</span>
                                {provider.pricing_monthly !== undefined && provider.pricing_monthly !== null && (
                                    <span className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded ml-2">
                                        {formatCurrency(provider.pricing_monthly)}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </PopoverContent>
        </Popover>
    );
}
