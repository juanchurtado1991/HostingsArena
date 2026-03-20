"use client";

import React from "react";
import { Zap, CheckCircle, Search } from "lucide-react";
import { AccordionSection, Step, Tip } from "./HelpCenterCommon";

interface TasksSectionProps {
    isEs: boolean;
}

export function TasksSection({ isEs }: TasksSectionProps) {
    return (
        <div className="space-y-4">
            <div>
                <h2 className="text-xl md:text-2xl font-black mb-1 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-primary" />
                    {isEs ? "Task Center" : "Task Center"}
                </h2>
                <p className="text-muted-foreground text-sm">
                    {isEs ? "Motor de auditoría automática. Genera tareas de mantenimiento para mantener el sitio óptimo." : "Automatic audit engine. Generates maintenance tasks to keep the site optimal."}
                </p>
            </div>
            <div className="space-y-2">
                <AccordionSection title={isEs ? "Tipos de Tareas" : "Task Types"} icon={Zap} defaultOpen>
                    <div className="space-y-2">
                        {[
                            { emoji: "🔥", label: isEs ? "Critical – Links Faltantes" : "Critical – Missing Links", desc: isEs ? "Un proveedor no tiene link de afiliado. Cada visita a ese proveedor es ingreso perdido." : "A provider has no affiliate link. Every visit to that provider is lost revenue." },
                            { emoji: "⚠️", label: isEs ? "High – Scraper con Error" : "High – Scraper Error", desc: isEs ? "Un scraper falló. Los datos pueden estar desactualizados o incorrectos." : "A scraper failed. Data may be outdated or incorrect." },
                            { emoji: "📝", label: isEs ? "Normal – Scraper Stale" : "Normal – Stale Scraper", desc: isEs ? "El scraper no ha corrido en 3+ días. Puede necesitar revisión del cron job." : "Scraper hasn't run in 3+ days. May need cron job review." },
                        ].map(t => (
                            <div key={t.label} className="p-3 bg-white/5 rounded-lg">
                                <div className="font-bold text-xs mb-0.5 text-foreground">{t.emoji} {t.label}</div>
                                <div className="text-xs text-muted-foreground">{t.desc}</div>
                            </div>
                        ))}
                    </div>
                </AccordionSection>

                <AccordionSection title={isEs ? "Cómo Resolver Tareas" : "How to Resolve Tasks"} icon={CheckCircle}>
                    <div className="space-y-2">
                        <p>{isEs ? "Haz clic en 'Resolve' en la tarea:" : "Click 'Resolve' on the task:"}</p>
                        <Step n={1} title={isEs ? "Affiliate Audit" : "Affiliate Audit"}>{isEs ? "Abre el modal para agregar el link de afiliado faltante directamente desde la tarea." : "Opens modal to add the missing affiliate link directly from the task."}</Step>
                        <Step n={2} title={isEs ? "Scraper Fix" : "Scraper Fix"}>{isEs ? "Marca la tarea como resuelta después de reparar el scraper manualmente." : "Mark task as resolved after manually fixing the scraper."}</Step>
                        <Step n={3} title="Clear All">{isEs ? "Usa 'Clear All' para borrar todas las tareas después de mantenimiento masivo." : "Use 'Clear All' to delete all tasks after bulk maintenance."}</Step>
                    </div>
                    <Tip>{isEs ? "El motor de deduplicación agrupa planes por proveedor. Si tienes 5 planes de Hostinger, solo generará 1 tarea." : "The deduplication engine groups plans by provider. If Hostinger has 5 plans, only 1 task is created."}</Tip>
                </AccordionSection>

                <AccordionSection title={isEs ? "Escaneo Manual" : "Manual Scan"} icon={Search}>
                    <p>{isEs ? "Usa el botón 'Scan' para ejecutar una auditoría manual inmediata. El motor revisa todos los proveedores en busca de links faltantes, scrapers con errores y datos desactualizados, y genera las tareas correspondientes." : "Use the 'Scan' button to run an immediate manual audit. The engine checks all providers for missing links, failing scrapers, and stale data, and generates the corresponding tasks."}</p>
                </AccordionSection>
            </div>
        </div>
    );
}
