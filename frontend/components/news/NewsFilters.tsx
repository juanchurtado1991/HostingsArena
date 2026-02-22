"use client";

import { Search, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useTransition } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { getCategoryColorClasses } from "@/lib/news-utils";

interface NewsFiltersProps {
    categories: string[];
    lang: string;
    dict: {
        searchPlaceholder: string;
        allCategories: string;
    };
}

export function NewsFilters({ categories, lang, dict }: NewsFiltersProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    const [search, setSearch] = useState(searchParams.get("q") || "");
    const selectedCategory = searchParams.get("category") || "all";
    const debouncedSearch = useDebounce(search, 500);

    const updateFilters = (q: string, category: string) => {
        const params = new URLSearchParams(searchParams);
        if (q) params.set("q", q);
        else params.delete("q");

        if (category && category !== "all") params.set("category", category);
        else params.delete("category");

        startTransition(() => {
            router.push(`/${lang}/news?${params.toString()}`, { scroll: false });
        });
    };

    useEffect(() => {
        if (debouncedSearch !== (searchParams.get("q") || "")) {
            updateFilters(debouncedSearch, selectedCategory);
        }
    }, [debouncedSearch]);

    return (
        <div className="space-y-6 mb-4">
            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={dict.searchPlaceholder}
                    className="w-full pl-12 pr-12 py-4 rounded-2xl bg-white/5 border border-primary/20 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-lg"
                />
                {search && (
                    <button
                        onClick={() => setSearch("")}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5 text-muted-foreground" />
                    </button>
                )}
            </div>

            {/* Tags / Categories */}
            <div className="flex flex-wrap justify-center gap-2">
                <button
                    onClick={() => updateFilters(search, "all")}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${selectedCategory === "all"
                        ? "bg-primary border-primary text-white shadow-lg shadow-primary/20"
                        : "bg-blue-500/10 border-blue-500/20 text-blue-500 hover:border-primary/50"
                        }`}
                >
                    {dict.allCategories}
                </button>
                {categories.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => updateFilters(search, cat)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${getCategoryColorClasses(cat, selectedCategory === cat)}`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {isPending && (
                <div className="text-center">
                    <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
                </div>
            )}
        </div>
    );
}
