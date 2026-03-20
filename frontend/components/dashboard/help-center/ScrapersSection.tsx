"use client";

import React from "react";
import { Server, Activity, ArrowRight, Search } from "lucide-react";
import { AccordionSection, Badge, Warning } from "./HelpCenterCommon";

interface ScrapersSectionProps {
    isEs: boolean;
}

export function ScrapersSection({ isEs }: ScrapersSectionProps) {
    return (
        <div className="space-y-4">
            <div>
                <h2 className="text-xl md:text-2xl font-black mb-1 flex items-center gap-2">
                    <Server className="w-5 h-5 text-primary" />
                    {isEs ? "Live Scraper Health" : "Live Scraper Health"}
                </h2>
                <p className="text-muted-foreground text-sm">
                    {isEs ? "Estado en tiempo real de todos los scrapers de Python que alimentan la base de datos." : "Real-time status of all Python scrapers that feed the database."}
                </p>
            </div>
            <div className="space-y-2">
                <AccordionSection title={isEs ? "Estados de los Scrapers" : "Scraper Status Codes"} icon={Activity} defaultOpen>
                    <div className="space-y-3">
                        {[
                            { badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", label: "Online", desc: isEs ? "Funcionando correctamente. Datos frescos y sincronizados con Supabase." : "Working correctly. Data is fresh and synced with Supabase." },
                            { badge: "bg-amber-500/10 text-amber-400 border-amber-500/20", label: "Warning", desc: isEs ? "Problemas menores (ej. un campo no encontrado). Datos mayormente precisos." : "Minor issues (e.g., one field not found). Data mostly accurate." },
                            { badge: "bg-red-500/10 text-red-400 border-red-500/20", label: "Error", desc: isEs ? "Fallo crítico. El proveedor puede haber cambiado su sitio. Requiere intervención técnica." : "Critical failure. The provider may have redesigned their site. Needs developer intervention." },
                            { badge: "bg-blue-500/10 text-blue-400 border-blue-500/20", label: "Stale", desc: isEs ? "El scraper no ha corrido en más de 3 días. Puede estar pausado o con cron fallado." : "Scraper hasn't run in 3+ days. May be paused or cron job failed." },
                        ].map(s => (
                            <div key={s.label} className="flex items-start gap-3">
                                <Badge color={s.badge} label={s.label} />
                                <span className="text-xs text-muted-foreground">{s.desc}</span>
                            </div>
                        ))}
                    </div>
                </AccordionSection>

                <AccordionSection title={isEs ? "Flujo de Datos" : "Data Flow"} icon={ArrowRight}>
                    <div className="flex flex-col gap-2">
                        {[
                            isEs ? "🐍 Scrapers Python corren vía GitHub Actions (diario automático)" : "🐍 Python scrapers run via GitHub Actions (daily automatic)",
                            isEs ? "📦 Datos guardados en Supabase (tabla hosting_plans / vpn_providers)" : "📦 Data saved to Supabase (hosting_plans / vpn_providers tables)",
                            isEs ? "⚡ Next.js revalida via ISR cada 5 minutos para servir datos frescos" : "⚡ Next.js revalidates via ISR every 5 minutes to serve fresh data",
                            isEs ? "👤 Usuario ve precios reales sin recargar manualmente" : "👤 User sees real prices without manual refresh",
                        ].map((step, i) => (
                            <div key={i} className="text-xs flex gap-2 p-2 bg-white/5 rounded-lg">{step}</div>
                        ))}
                    </div>
                </AccordionSection>

                <AccordionSection title={isEs ? "Cómo Filtrar y Reportar" : "Filtering & Reporting"} icon={Search}>
                    <p>{isEs
                        ? "Usa los filtros (All / Online / Failing / Stale) para enfocar la vista. El botón 'Copy Report' copia un resumen de texto de todos los scrapers al portapapeles para compartir con el equipo técnico."
                        : "Use filters (All / Online / Failing / Stale) to focus the view. 'Copy Report' copies a text summary of all scrapers to clipboard to share with the technical team."}</p>
                    <Warning>{isEs ? "Los scrapers en 'Error' afectan directamente la calidad de los datos mostrados a los usuarios. Prioriza su reparación." : "Scrapers in 'Error' directly affect data quality shown to users. Prioritize fixing them."}</Warning>
                </AccordionSection>
            </div>
        </div>
    );
}
