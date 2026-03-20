"use client";

import React from "react";
import { BarChart3, MousePointerClick, Clock } from "lucide-react";
import { AccordionSection, Tip } from "./HelpCenterCommon";

interface AnalyticsSectionProps {
    isEs: boolean;
}

export function AnalyticsSection({ isEs }: AnalyticsSectionProps) {
    return (
        <div className="space-y-4">
            <div>
                <h2 className="text-xl md:text-2xl font-black mb-1 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    Analytics
                </h2>
                <p className="text-muted-foreground text-sm">
                    {isEs ? "Tráfico en tiempo real, affiliate click tracking y análisis de audiencia." : "Real-time traffic, affiliate click tracking, and audience analysis."}
                </p>
            </div>

            <div className="space-y-2">
                <AccordionSection title={isEs ? "Vistas Disponibles" : "Available Views"} icon={BarChart3} defaultOpen>
                    <div className="space-y-2">
                        {[
                            { icon: "👥", label: isEs ? "Activity Feed" : "Activity Feed", desc: isEs ? "Muestra visitas en tiempo real con IP anonimizada, país, dispositivo y fuente (referrer). Ayuda a detectar bots vs usuarios reales." : "Shows real-time visits with anonymized IP, country, device, and source (referrer). Helps detect bots vs real users." },
                            { icon: "🖱", label: isEs ? "Affiliate Clicks" : "Affiliate Clicks", desc: isEs ? "Track de cada click en botones 'Ver Oferta'. Muestra clicks por proveedor y tendencia diaria." : "Tracks every click on 'View Deal' buttons. Shows clicks per provider and daily trend." },
                            { icon: "📄", label: isEs ? "Top Posts" : "Top Posts", desc: isEs ? "Los posts más vistos del período seleccionado." : "The most viewed posts in the selected period." },
                            { icon: "🌍", label: isEs ? "Countries" : "Countries", desc: isEs ? "Distribución geográfica de visitantes." : "Geographic distribution of visitors." },
                        ].map(v => (
                            <div key={v.label} className="flex gap-2 text-sm">
                                <span className="shrink-0">{v.icon}</span>
                                <div>
                                    <span className="font-semibold text-foreground">{v.label}: </span>
                                    <span className="text-muted-foreground text-xs">{v.desc}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </AccordionSection>

                <AccordionSection title="CTR Global" icon={MousePointerClick}>
                    <p>{isEs
                        ? "El CTR Global (en el header de Analytics) es la tasa de clicks de afiliado sobre visitas totales del mes. Un CTR de 2-5% es saludable. Por encima del 5% indica alta intención de compra en tu audiencia."
                        : "Global CTR (in Analytics header) is the affiliate click rate over total monthly visits. 2–5% CTR is healthy. Above 5% indicates high purchase intent in your audience."}</p>
                    <Tip>{isEs ? "Un CTR bajo con muchas visitas puede indicar que los botones CTAs no están bien posicionados o que el contenido no está convirtiendo." : "Low CTR with high traffic may indicate CTAs are not well-positioned or content isn't converting."}</Tip>
                </AccordionSection>

                <AccordionSection title={isEs ? "Filtros de Tiempo" : "Time Filters"} icon={Clock}>
                    <p>{isEs ? "Usa el selector de fechas (Today / Last 7 Days / Last 30 Days / All Time / Custom) para enfocar el análisis. 'Custom' permite fechas específicas para comparar periodos." : "Use the date selector (Today / Last 7 Days / Last 30 Days / All Time / Custom) to focus analysis. 'Custom' allows specific date ranges for period comparisons."}</p>
                </AccordionSection>
            </div>
        </div>
    );
}
