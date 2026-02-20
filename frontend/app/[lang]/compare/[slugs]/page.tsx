import { getDictionary } from "@/get-dictionary";
import { Locale } from "@/i18n-config";
import CompareClient from "../CompareClient";
import { createAdminClient } from "@/lib/tasks/supabaseAdmin";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { FAQSchema } from "@/components/seo/FAQSchema";

interface Props {
    params: Promise<{
        lang: Locale;
        slugs: string;
    }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { lang, slugs } = await params;
    
    // Parse providerA-vs-providerB
    const match = slugs.match(/^([a-z0-9-]+)-vs-([a-z0-9-]+)$/i);
    
    if (!match) {
        return {
            title: "Compare Providers | HostingArena",
            description: "Detailed side-by-side comparison of hosting and VPN providers."
        };
    }
    
    const [, slugA, slugB] = match;
    const supabase = createAdminClient();
    
    // Fetch basic names for the title to be accurate by checking both tables
    const fetchProviderName = async (slug: string) => {
        const { data: h } = await supabase.from('hosting_providers').select('provider_name').eq('slug', slug).single();
        if (h) return h.provider_name;
        const { data: v } = await supabase.from('vpn_providers').select('provider_name').eq('slug', slug).single();
        if (v) return v.provider_name;
        return slug;
    };

    const nameA = await fetchProviderName(slugA);
    const nameB = await fetchProviderName(slugB);

    return {
        title: `${nameA} vs ${nameB}: Which is Better? (2026 Comparison) | HostingArena`,
        description: `In-depth side-by-side comparison of ${nameA} and ${nameB}. Uncover hidden renewal fees, true performance metrics, and feature limits before you buy.`,
    };
}

export default async function CompareDynamicPage({ params }: Props) {
    const { lang, slugs } = await params;
    const dict = await getDictionary(lang);

    const match = slugs.match(/^([a-z0-9-]+)-vs-([a-z0-9-]+)$/i);
    
    if (!match) {
        // Invalid URL structure, fallback to empty compare
        redirect(`/${lang}/compare`);
    }

    const [, slugA, slugB] = match;
    const supabase = createAdminClient();

    // Fetch names for FAQ Schema
    const fetchProviderName = async (slug: string) => {
        const { data: h } = await supabase.from('hosting_providers').select('provider_name').eq('slug', slug).single();
        if (h) return h.provider_name;
        const { data: v } = await supabase.from('vpn_providers').select('provider_name').eq('slug', slug).single();
        if (v) return v.provider_name;
        return slug;
    };

    const nameA = await fetchProviderName(slugA);
    const nameB = await fetchProviderName(slugB);

    // Determine category and fetch full data
    const fetchFullProvider = async (slug: string) => {
        // We use .limit(1) instead of .single() because some providers might have multiple plan tiers
        // in the database with the same slug. .single() would fail in that case.
        const { data: h } = await supabase.from('hosting_providers').select('*').eq('slug', slug).limit(1);
        if (h && h.length > 0) return { data: h[0], cat: "hosting" as const };
        
        const { data: v } = await supabase.from('vpn_providers').select('*').eq('slug', slug).limit(1);
        if (v && v.length > 0) return { data: v[0], cat: "vpn" as const };
        
        return { data: null, cat: "hosting" as const };
    };

    const [{ data: dataA, cat: catA }, { data: dataB }] = await Promise.all([
        fetchFullProvider(slugA),
        fetchFullProvider(slugB)
    ]);

    const initialCategory = catA;

    const faqs = [
        {
            question: `Which is better, ${nameA} or ${nameB}?`,
            acceptedAnswer: `Choosing between ${nameA} and ${nameB} depends on your performance requirements and budget. ${nameA} is known for its reliability, while ${nameB} provides great value for those starting out.`
        },
        {
            question: `Does ${nameA} offer better pricing than ${nameB}?`,
            acceptedAnswer: `Pricing changes frequently due to seasonal offers. Based on our latest data, ${nameA} and ${nameB} both offer competitive introductory rates, but it's important to check the renewal fees in our comparison table.`
        }
    ];

    return (
        <>
            <FAQSchema faqs={faqs} />
            <CompareClient 
                key={slugs}
                dict={dict} 
                lang={lang} 
                initialCategory={initialCategory}
                initialSlugA={slugA}
                initialSlugB={slugB}
                initialDataA={dataA}
                initialDataB={dataB}
            />
        </>
    );
}
