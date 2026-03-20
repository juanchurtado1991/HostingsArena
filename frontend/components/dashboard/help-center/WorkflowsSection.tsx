"use client";

import React from "react";
import { GitBranch, Activity, ArrowRight } from "lucide-react";
import { AccordionSection, Tip, Badge } from "./HelpCenterCommon";

interface WorkflowsSectionProps {
    isEs: boolean;
}

export function WorkflowsSection({ isEs }: WorkflowsSectionProps) {
    return (
        <div className="space-y-4">
            <div>
                <h2 className="text-xl md:text-2xl font-black mb-1 flex items-center gap-2">
                    <GitBranch className="w-5 h-5 text-primary" />
                    {isEs ? "Workflows / CI Pipelines" : "Workflows / CI Pipelines"}
                </h2>
                <p className="text-muted-foreground text-sm">
                    {isEs ? "Monitorea y dispara los GitHub Actions que mantienen los datos frescos." : "Monitor and trigger the GitHub Actions that keep data fresh."}
                </p>
            </div>
            <div className="space-y-2">
                <AccordionSection title={isEs ? "Flujos Automáticos" : "Automatic Workflows"} icon={GitBranch} defaultOpen>
                    <div className="space-y-2">
                        {[
                            { label: "daily_update.yml", freq: isEs ? "Diario (3am UTC)" : "Daily (3am UTC)", desc: isEs ? "Corre todos los scrapers en paralelo. Sincroniza datos con Supabase. Registra status en scraper_status table." : "Runs all scrapers in parallel. Syncs data to Supabase. Logs status to scraper_status table." },
                            { label: "reminders_cron.yml", freq: isEs ? "Cada hora" : "Every hour", desc: isEs ? "Revisa recordatorios de Slack pendientes y los despacha si la hora llegó." : "Checks pending Slack reminders and dispatches them if their time has arrived." },
                        ].map(w => (
                            <div key={w.label} className="p-3 bg-white/5 rounded-lg">
                                <div className="flex justify-between items-baseline mb-1">
                                    <code className="text-primary font-mono text-xs font-bold">{w.label}</code>
                                    <span className="text-[10px] text-muted-foreground">{w.freq}</span>
                                </div>
                                <div className="text-xs text-muted-foreground">{w.desc}</div>
                            </div>
                        ))}
                    </div>
                </AccordionSection>

                <AccordionSection title={isEs ? "Ejecución Manual" : "Manual Execution"} icon={ArrowRight}>
                    <p>{isEs
                        ? "Usa el botón 'Run Manual Update' para disparar el workflow de scrapers inmediatamente sin esperar al cron diario. Útil cuando agregas un proveedor nuevo y quieres datos frescos de inmediato."
                        : "Use 'Run Manual Update' to trigger the scraper workflow immediately without waiting for the daily cron. Useful when you add a new provider and want fresh data right away."}</p>
                    <Tip>{isEs ? "El run puede tardar 5-15 minutos dependiendo de la cantidad de scrapers. Revisa el log en GitHub Actions para ver el progreso." : "The run may take 5–15 minutes depending on the number of scrapers. Check the GitHub Actions log to see progress."}</Tip>
                </AccordionSection>

                <AccordionSection title={isEs ? "Entender el Log de Runs" : "Understanding the Run Log"} icon={Activity}>
                    <div className="space-y-2">
                        {[
                            { badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", label: "Success", desc: isEs ? "El workflow completó sin errores. Todos los scrapers corren y datos sincronizados." : "Workflow completed without errors. All scrapers ran and data is synced." },
                            { badge: "bg-red-500/10 text-red-400 border-red-500/20", label: "Failed", desc: isEs ? "Algo falló. Haz clic en 'View Logs' para ver el error exacto en GitHub Actions." : "Something failed. Click 'View Logs' to see the exact error in GitHub Actions." },
                            { badge: "bg-blue-500/10 text-blue-400 border-blue-500/20", label: "In Progress", desc: isEs ? "El workflow está corriendo actualmente. Espera 5-15 minutos." : "Workflow is currently running. Wait 5–15 minutes." },
                        ].map(s => (
                            <div key={s.label} className="flex items-start gap-3">
                                <Badge color={s.badge} label={s.label} />
                                <span className="text-xs text-muted-foreground">{s.desc}</span>
                            </div>
                        ))}
                    </div>
                </AccordionSection>
            </div>
        </div>
    );
}
