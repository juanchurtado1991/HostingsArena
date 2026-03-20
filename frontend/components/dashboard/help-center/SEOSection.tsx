"use client";

import React from "react";
import { Globe, ShieldCheck, Search } from "lucide-react";
import { AccordionSection, Step, Tip, Warning } from "./HelpCenterCommon";

interface SEOSectionProps {
    isEs: boolean;
}

export function SEOSection({ isEs }: SEOSectionProps) {
    return (
        <div className="space-y-4">
            <div>
                <h2 className="text-xl md:text-2xl font-black mb-1 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-primary" />
                    {isEs ? "SEO & Google Indexing" : "SEO & Google Indexing"}
                </h2>
                <p className="text-muted-foreground text-sm">
                    {isEs ? "Fuerza a Google a rastrear tus páginas nuevas de comparación e indexarlas en minutos, no días." : "Force Google to crawl your new comparison pages and index them in minutes, not days."}
                </p>
            </div>
            <div className="space-y-2">
                <AccordionSection title={isEs ? "Cómo Indexar Páginas" : "How to Index Pages"} icon={Globe} defaultOpen>
                    <div className="space-y-2">
                        <Step n={1} title={isEs ? "Refresh URLs" : "Refresh URLs"}>{isEs ? "Pulsa 'Refresh URLs' para cargar todas las URLs del Sitemap." : "Click 'Refresh URLs' to load all URLs from the Sitemap."}</Step>
                        <Step n={2} title={isEs ? "Index All" : "Index All"}>{isEs ? "Confirma y pulsa 'Index All'. El sistema pinga la Google Indexing API para cada URL." : "Confirm and click 'Index All'. The system pings the Google Indexing API for each URL."}</Step>
                        <Step n={3} title={isEs ? "Revisa el Log" : "Review the Log"}>{isEs ? "El log muestra ✓ para éxito y ✗ para error. Los errores generalmente indican que la URL ya está indexada." : "The log shows ✓ for success and ✗ for error. Errors usually mean the URL is already indexed."}</Step>
                    </div>
                    <Tip>{isEs ? "Usa esto siempre que agregues un proveedor nuevo o publiques un batch grande de comparaciones." : "Use this whenever you add a new provider or publish a large batch of comparisons."}</Tip>
                </AccordionSection>

                <AccordionSection title={isEs ? "Cuotas de API" : "API Quotas"} icon={ShieldCheck}>
                    <p>{isEs ? "Google permite 200 requests diarios de indexing con la cuenta de servicio configurada. El dashboard muestra el uso restante. Una vez al día es más que suficiente para el volumen de HostingArena." : "Google allows 200 daily indexing requests with the configured service account. The dashboard shows remaining quota. Once per day is more than enough for HostingArena's volume."}</p>
                    <Warning>{isEs ? "No ejecutes 'Index All' múltiples veces al día. Agota la cuota sin beneficio adicional (Google ya procesa el ping de la primera vez)." : "Don't run 'Index All' multiple times per day. It wastes quota with no additional benefit (Google already processes the first ping)."}</Warning>
                </AccordionSection>

                <AccordionSection title={isEs ? "SEO en el Editor de Posts" : "SEO in Post Editor"} icon={Search}>
                    <div className="space-y-2">
                        {[
                            { label: "SEO Title", max: "60", desc: isEs ? "El texto azul en Google. El link clickeable en los resultados." : "The blue text in Google. The clickable link in search results." },
                            { label: "Meta Description", max: "160", desc: isEs ? "El resumen bajo el link. Debe ser atractivo para mejorar el CTR." : "The summary under the link. Must be catchy to improve CTR." },
                            { label: "Target Keywords", max: "—", desc: isEs ? "Frases separadas por coma que los usuarios buscan. Ej: 'cheap hosting, wordpress hosting'." : "Comma-separated phrases users search for. E.g.: 'cheap hosting, wordpress hosting'." },
                        ].map(f => (
                            <div key={f.label} className="p-3 bg-white/5 rounded-lg">
                                <div className="flex justify-between items-baseline mb-1">
                                    <span className="font-bold text-xs text-foreground">{f.label}</span>
                                    {f.max !== "—" && <span className="text-[10px] text-muted-foreground">max {f.max} chars</span>}
                                </div>
                                <div className="text-xs text-muted-foreground">{f.desc}</div>
                            </div>
                        ))}
                    </div>
                </AccordionSection>
            </div>
        </div>
    );
}
