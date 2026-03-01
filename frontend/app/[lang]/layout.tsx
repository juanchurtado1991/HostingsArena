import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/layout/Footer";
import { i18n } from "../../i18n-config";
import { getDictionary } from "../../get-dictionary";
import type { Locale } from "../../i18n-config";
import { ConditionalWrapper } from "@/components/layout/ConditionalWrapper";

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ lang: locale }));
}

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);

  return (
    <ConditionalWrapper
      navbar={<Navbar dict={dict} lang={lang} />}
      footer={<Footer dict={dict} lang={lang} />}
    >
      {children}
    </ConditionalWrapper>
  );
}

