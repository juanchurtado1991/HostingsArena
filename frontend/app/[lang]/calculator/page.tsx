import { getDictionary } from "@/get-dictionary";
import { Locale } from "@/i18n-config";
import CalculatorClient from "./CalculatorClient";

export const metadata = {
    title: "True Cost Calculator | HostingArena",
    description: "See how \"cheap\" hosting really costs after the promo ends.",
};

export default async function CalculatorPage({
    params,
}: {
    params: Promise<{ lang: Locale }>;
}) {
    const { lang } = await params;
    const dict = await getDictionary(lang);

    return <CalculatorClient dict={dict} lang={lang} />;
}
