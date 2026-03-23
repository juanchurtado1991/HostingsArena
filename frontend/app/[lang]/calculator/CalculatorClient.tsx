"use client";

import { formatCurrency } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useTrackPageView } from "@/hooks/useTrackPageView";
import { CalculatorChart } from "@/components/calculator/CalculatorChart";
import { CalculatorControls } from "@/components/calculator/CalculatorControls";
import { CalculatorResults } from "@/components/calculator/CalculatorResults";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle } from "lucide-react";
import { getCalculatorAffiliateLinks, getDefaultCompareProviders } from "@/lib/actions/affiliates";

interface CalculatorClientProps {
    dict: any;
    lang: string;
}

export default function CalculatorClient({ dict, lang }: CalculatorClientProps) {
    const [category, setCategory] = useState<"hosting" | "vpn">("hosting");
    const [years, setYears] = useState(3);
    const [provider1, setProvider1] = useState({ id: "", provider_name: "Loading...", initial: 0, renewal: 0, promo: 12, website_url: "" });
    const [provider2, setProvider2] = useState({ id: "", provider_name: "Loading...", initial: 0, renewal: 0, promo: 12, website_url: "" });
    const [p1Link, setP1Link] = useState("#");
    const [p2Link, setP2Link] = useState("#");
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    
    useTrackPageView();

    useEffect(() => {
        const fetchDefaults = async () => {
            try {
                const defaults = await getDefaultCompareProviders(category);
                if (defaults.length > 0) {
                    const p1 = defaults[0];
                    const p1Renewal = p1.renewal_price || p1.renewal_price_monthly || (p1.pricing_monthly * 2) || 0;
                    setProvider1({
                        id: p1.id,
                        provider_name: p1.provider_name,
                        initial: Number(p1.pricing_monthly) || 0,
                        renewal: Number(p1Renewal),
                        promo: 12,
                        website_url: p1.website_url || ""
                    });
                }
                if (defaults.length > 1) {
                    const p2 = defaults[1];
                    const p2Renewal = p2.renewal_price || p2.renewal_price_monthly || (p2.pricing_monthly * 2) || 0;
                    setProvider2({
                        id: p2.id,
                        provider_name: p2.provider_name,
                        initial: Number(p2.pricing_monthly) || 0,
                        renewal: Number(p2Renewal),
                        promo: 12,
                        website_url: p2.website_url || ""
                    });
                }
            } catch (e) {
                console.error("Error fetching defaults", e);
            }
            setIsInitialLoad(false);
        };
        fetchDefaults();
    }, [category]);

    useEffect(() => {
        if (!isInitialLoad && provider1.provider_name !== "Loading..." && provider2.provider_name !== "Loading...") {
        getCalculatorAffiliateLinks(
            provider1.provider_name,
            provider1.website_url || "#",
            provider2.provider_name,
            provider2.website_url || "#"
        ).then(({ p1Link, p2Link }) => {
            setP1Link(p1Link);
            setP2Link(p2Link);
        });
        }
    }, [provider1.provider_name, provider1.website_url, provider2.provider_name, provider2.website_url, isInitialLoad]);

    const data = [];
    let p1Total = 0;
    let p2Total = 0;
    const totalMonths = years * 12;

    for (let i = 1; i <= totalMonths; i++) {
        const p1Monthly = i <= provider1.promo ? provider1.initial : provider1.renewal;
        p1Total += p1Monthly;

        const p2Monthly = i <= provider2.promo ? provider2.initial : provider2.renewal;
        p2Total += p2Monthly;

        const step = Math.max(1, Math.floor(totalMonths / 10));

        if (i % step === 0 || i === totalMonths) {
            data.push({
                month: i,
                [provider1.provider_name]: parseFloat(p1Total.toFixed(2)),
                [provider2.provider_name]: parseFloat(p2Total.toFixed(2)),
            });
        }
    }

    const diff = Math.abs(p1Total - p2Total);
    const winner = p1Total < p2Total ? provider1.provider_name : provider2.provider_name;
    const loser = p1Total < p2Total ? provider2.provider_name : provider1.provider_name;

    return (
        <div className="min-h-screen pt-20 pb-12 px-4 md:px-6">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-8 md:mb-12">
                    <h1 className="text-2xl md:text-4xl font-bold mb-3">
                        {dict.calculator.title}
                    </h1>
                    <p className="text-muted-foreground text-lg mb-8">
                        {dict.calculator.subtitle}
                    </p>

                    <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-xl p-3 md:p-4 max-w-2xl mx-auto flex items-start md:items-center justify-center gap-2 md:gap-3">
                        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 md:mt-0" />
                        <span className="font-bold text-sm md:text-lg text-left">
                            {dict.calculator.stop_bleeding.replace('{amount}', formatCurrency(diff)).replace('{years}', years.toString())}
                        </span>
                    </div>

                    <div className="flex justify-center mt-10">
                        <Tabs value={category} onValueChange={(v) => {
                            setCategory(v as "hosting" | "vpn");
                            setIsInitialLoad(true);
                            setProvider1({ id: "", provider_name: "Loading...", initial: 0, renewal: 0, promo: 12, website_url: "" });
                            setProvider2({ id: "", provider_name: "Loading...", initial: 0, renewal: 0, promo: 12, website_url: "" });
                        }}>
                            <TabsList className="bg-muted p-1 rounded-xl glass-morphism-header backdrop-blur-md">
                                <TabsTrigger value="hosting" className="px-8 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all">{dict.compare.tab_hosting}</TabsTrigger>
                                <TabsTrigger value="vpn" className="px-8 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all">{dict.compare.tab_vpn}</TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                    <CalculatorControls 
                        dict={dict} 
                        category={category} 
                        years={years} 
                        setYears={setYears} 
                        provider1={provider1} 
                        setProvider1={setProvider1} 
                        provider2={provider2} 
                        setProvider2={setProvider2} 
                    />

                    {/* Chart & Results */}
                    <div className="lg:col-span-2 space-y-6">
                        <CalculatorChart data={data} provider1Name={provider1.provider_name} provider2Name={provider2.provider_name} />

                        <CalculatorResults
                            dict={dict}
                            loser={loser}
                            winner={winner}
                            p1Total={p1Total}
                            p2Total={p2Total}
                            diff={diff}
                            years={years}
                            provider1Name={provider1.provider_name}
                            p1Link={p1Link}
                            p2Link={p2Link}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
