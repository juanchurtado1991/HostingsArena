"use client";

import { useState, useEffect, useMemo } from "react";

export function usePickerPagination<T>(
    items: T[],
    initialCount = 30,
    increment = 30,
    dependencies: any[] = []
) {
    const [visibleCount, setVisibleCount] = useState(initialCount);

    // Reset pagination when dependencies (search, filters, etc.) change
    useEffect(() => {
        setVisibleCount(initialCount);
    }, [initialCount, ...dependencies]);

    const visibleItems = useMemo(() => {
        return items.slice(0, visibleCount);
    }, [items, visibleCount]);

    const handleScroll = (e: React.UIEvent<HTMLElement>) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        if (scrollHeight - scrollTop <= clientHeight + 400) {
            setVisibleCount(prev => Math.min(prev + increment, items.length));
        }
    };

    return {
        visibleItems,
        handleScroll,
        visibleCount,
        setVisibleCount
    };
}
