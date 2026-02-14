"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { trackAffiliateClick } from "@/lib/analytics";
import { AffiliateButton } from "@/components/conversion/AffiliateButton";

interface StickyBuyBarProps {
    providerName: string;
    price: number | string;
    rating?: string | number;
    visitUrl: string;
    discount?: string;
    renewalText?: string;
}

export function StickyBuyBar({ providerName, price, rating, visitUrl, discount, renewalText }: StickyBuyBarProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const heroHeight = 500; // Approx height of hero section
            if (window.scrollY > heroHeight) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    if (!isVisible) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-t border-border shadow-2xl safe-area-bottom pb-safe"
            >
                <div className="container mx-auto px-4 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="hidden md:block">
                            <h3 className="font-bold text-lg">{providerName}</h3>
                            {rating && <div className="text-xs text-muted-foreground">⭐ {rating}/10 Expert Rating</div>}
                        </div>
                        <div className="flex flex-col md:flex-row md:items-baseline gap-1 md:gap-2">
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-bold text-foreground">${price}</span>
                                <span className="text-xs md:text-sm text-muted-foreground">/mo</span>
                            </div>
                            <div className="flex items-center gap-2">
                                {discount && <span className="text-[10px] font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full whitespace-nowrap">{discount}</span>}
                                {renewalText && <span className="text-[10px] text-muted-foreground italic truncate max-w-[150px]">{renewalText}</span>}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <AffiliateButton
                            size="lg"
                            className="shadow-lg hover:bg-primary/90 hover:scale-105 transition-all"
                            providerName={providerName}
                            visitUrl={visitUrl}
                            position="sticky_bar"
                        />
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
