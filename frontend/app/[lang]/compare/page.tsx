import { getDictionary } from "@/get-dictionary";
import { Locale } from "@/i18n-config";
import CompareClient from "./CompareClient";

export const metadata = {
    title: "Compare Providers Side-by-Side | HostingArena",
    description: "Select two providers to see their differences in renewal price, hidden limits, and performance benchmarks.",
};

export default async function ComparePage({
    params,
}: {
    params: Promise<{ lang: Locale }>;
}) {
    const { lang } = await params;
    const dict = await getDictionary(lang);

    return <CompareClient dict={dict} lang={lang} />;
}
