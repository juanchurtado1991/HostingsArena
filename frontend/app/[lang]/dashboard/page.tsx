import { getDictionary } from "@/get-dictionary";
import { Locale } from "@/i18n-config";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage({
    params,
}: {
    params: Promise<{ lang: Locale }>;
}) {
    const { lang } = await params;

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect(`/${lang}/login`);
    }

    const dict = await getDictionary(lang);

    return <DashboardClient dict={dict} lang={lang} />;
}
