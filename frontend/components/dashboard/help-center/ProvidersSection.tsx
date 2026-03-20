"use client";

import React from "react";
import { Database, ShieldCheck, LayoutDashboard, DollarSign } from "lucide-react";
import { AccordionSection, Tip } from "./HelpCenterCommon";

interface ProvidersSectionProps {
    isEs: boolean;
}

export function ProvidersSection({ isEs }: ProvidersSectionProps) {
    return (
        <div className="space-y-4">
            <div>
                <h2 className="text-xl md:text-2xl font-black mb-1 flex items-center gap-2">
                    <Database className="w-5 h-5 text-primary" />
                    {isEs ? "Gestión de Proveedores" : "Provider Management"}
                </h2>
                <p className="text-muted-foreground text-sm">
                    {isEs 
                        ? "Control total sobre los datos técnicos y de precios de Hosting y VPN." 
                        : "Total control over technical and pricing data for Hosting and VPN."}
                </p>
            </div>
            <div className="space-y-2">
                <AccordionSection title={isEs ? "100% Data Audit" : "100% Data Audit"} icon={ShieldCheck} defaultOpen>
                    <p>{isEs
                        ? "El nuevo editor permite modificar cada uno de los campos que se muestran en el sitio. No hay más datos 'hardcodeados' o imposibles de editar."
                        : "The new editor allows modifying every single field displayed on the site. No more 'hardcoded' or uneditable data."}</p>
                    <Tip>{isEs ? "Los cambios realizados aquí sobrescriben cualquier dato capturado por los scrapers." : "Changes made here override any data captured by scrapers."}</Tip>
                </AccordionSection>

                <AccordionSection title={isEs ? "Organización por Pestañas" : "Tabbed Organization"} icon={LayoutDashboard}>
                    <div className="space-y-3">
                        {[
                            { title: "General", desc: isEs ? "Nombre del proveedor, Slug (URL) y Website de afiliado." : "Provider name, Slug (URL), and Affiliate website." },
                            { title: "Content", desc: isEs ? "Resúmenes bilingües, Pros/Cons y notas del editor." : "Bilingual summaries, Pros/Cons, and editor notes." },
                            { title: "Pricing", desc: isEs ? "Precios mensuales, anuales, a 2-3 años y tasas de renovación." : "Monthly, yearly, 2-3 year pricing, and renewal rates." },
                            { title: "Specs", desc: isEs ? "Datos técnicos: Inodes, Web Server, Control Panel (Hosting) o Speed, Protocols, Jurisdiction (VPN)." : "Technical data: Inodes, Web Server, Control Panel (Hosting) or Speed, Protocols, Jurisdiction (VPN)." },
                            { title: "Features", desc: isEs ? "Toggles para Free SSL, Domain, Kill Switch, Streaming, etc." : "Toggles for Free SSL, Domain, Kill Switch, Streaming, etc." },
                            { title: "Scores", desc: isEs ? "Ajuste manual de Support Score y Performance Grades." : "Manual adjustment of Support Score and Performance Grades." },
                        ].map(t => (
                            <div key={t.title} className="flex gap-2 text-xs">
                                <span className="font-bold text-foreground min-w-[70px]">{t.title}:</span>
                                <span className="text-muted-foreground">{t.desc}</span>
                            </div>
                        ))}
                    </div>
                </AccordionSection>

                <AccordionSection title={isEs ? "Sincronización de Precios" : "Price Syncing"} icon={DollarSign}>
                    <p>{isEs
                        ? "Asegúrate de configurar tanto el 'Monthly Intro' como el 'Renewal Price'. El sistema usa el 'Renewal Price' para las tablas de comparación de largo plazo."
                        : "Make sure to set both 'Monthly Intro' and 'Renewal Price'. The system uses the 'Renewal Price' for long-term comparison tables."}</p>
                </AccordionSection>
            </div>
        </div>
    );
}
