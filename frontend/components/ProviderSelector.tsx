"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { createClient } from "@/utils/supabase/client";
import { logger } from "@/utils/logger";

interface ProviderSelectorProps {
    type: "hosting" | "vpn";
    onSelect: (provider: any) => void;
    selectedProviderName?: string;
    className?: string;
}

export function ProviderSelector({ type, onSelect, selectedProviderName, className }: ProviderSelectorProps) {
    const [open, setOpen] = React.useState(false);
    const [value, setValue] = React.useState(selectedProviderName || "");
    const [providers, setProviders] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(false);
    // Removed direct Supabase client initialization to use Proxy API instead
    // const supabase = createClient();

    // Debug: Check if Env Vars are present (Detailed)
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
            logger.log('SEARCH', `Fetching providers for ${type} from DB`);

            try {
                const table = type === "hosting" ? "hosting_providers" : "vpn_providers";

                // Create a promise that rejects after 15 seconds
                const timeoutPromise = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('TIMEOUT_15S: Supabase did not respond in 15s')), 15000)
                );

                const dataPromise = supabase
                    .from(table)
                    .select("*")
                    .order("provider_name", { ascending: true });

                // Race the data fetch against the timeout
                const { data, error } = await Promise.race([dataPromise, timeoutPromise]) as any;

                if (error) {
                    logger.error('Supabase Error Trace', error);
                } else {
                    logger.log('SEARCH', `Supabase Response Success`, {
                        count: data?.length,
                        sample: data?.[0] ? { name: data[0].provider_name, id: data[0].id } : 'Empty'
                    });
                    setProviders(data || []);
                }
            } catch (err) {
                logger.error('CRITICAL SEARCH CRASH', err);
            } finally {
                setLoading(false);
            }
        };

        fetchProviders();
    }, [type, supabase]);

    const handleSelect = (currentValue: string) => {
        setValue(currentValue === value ? "" : currentValue);
        const provider = providers.find((p) => p.provider_name.toLowerCase() === currentValue.toLowerCase());
        onSelect(provider);
        setOpen(false);
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn("w-full justify-between backdrop-blur-md bg-background/50 border-input hover:bg-accent hover:text-accent-foreground", className)}
                >
                    {selectedProviderName || `Select ${type === "hosting" ? "Host" : "VPN"}...`}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0 backdrop-blur-xl bg-popover/80 border-border text-popover-foreground">
                <Command className="bg-transparent">
                    <CommandInput placeholder={`Search ${type}...`} />
                    <CommandList className="max-h-[300px] overflow-y-auto">
                        <CommandEmpty>No provider found.</CommandEmpty>
                        <CommandGroup>
                            {!loading && providers.map((provider) => (
                                <CommandItem
                                    key={provider.id}
                                    value={provider.id.toString()}
                                    keywords={[provider.provider_name]}
                                    onSelect={() => {
                                        onSelect(provider);
                                        setOpen(false);
                                    }}
                                    onMouseDown={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        onSelect(provider);
                                        setOpen(false);
                                    }}
                                    className="cursor-pointer pointer-events-auto aria-selected:bg-accent aria-selected:text-accent-foreground"
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            selectedProviderName === provider.provider_name ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {provider.provider_name}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
