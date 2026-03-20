"use client";

import React from "react";
import { LayoutDashboard, Activity, Server, BarChart3 } from "lucide-react";
import { Tip } from "./HelpCenterCommon";

interface OverviewSectionProps {
    isEs: boolean;
}

export function OverviewSection({ isEs }: OverviewSectionProps) {
    return (
        <div className="space-y-4">
            <div>
                <h2 className="text-xl md:text-2xl font-black mb-1 flex items-center gap-2">
                    <LayoutDashboard className="w-5 h-5 text-primary" />
                    {isEs ? "Vista General del Dashboard" : "Dashboard Overview"}
                </h2>
                <p className="text-muted-foreground text-sm">
                    {isEs
                        ? "Centro de control central de HostingArena. Desde aquí gestionas datos, contenido, afiliados y automatización."
                        : "HostingArena's mission control. Manage data, content, affiliates, and automation all in one place."}
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                    { icon: Activity, color: "text-emerald-400", title: isEs ? "Fila Ejecutiva" : "Executive Row", desc: isEs ? "Clicks 30 días, ingresos estimados, tasa de éxito de scrapers e ítems monitoreados." : "30-day clicks, estimated revenue, scraper success rate, and monitored items." },
                    { icon: Server, color: "text-blue-400", title: isEs ? "Salud Técnica" : "Technical Health", desc: isEs ? "Scrapers online, fallando, desactualizados e ítems sincronizados en tiempo real." : "Scrapers online, failing, stale, and total items synced in real time." },
                    { icon: BarChart3, color: "text-purple-400", title: "Analytics", desc: isEs ? "Tráfico en tiempo real, por páginas, posts, referrers, países y affiliate clicks." : "Real-time traffic by pages, posts, referrers, countries, and affiliate clicks." },
                    { icon: Server, color: "text-orange-400", title: isEs ? "Live Scraper Table" : "Live Scraper Table", desc: isEs ? "Estado detallado de cada scraper: status, ítems, duración, última ejecución y errores." : "Detailed status per scraper: status, items, duration, last run, and errors." },
                ].map((item) => (
                    <div key={item.title} className="p-3 rounded-xl bg-white/5 border border-white/[0.07] flex gap-3">
                        <item.icon className={`w-5 h-5 shrink-0 mt-0.5 ${item.color}`} />
                        <div>
                            <div className="font-bold text-xs mb-0.5 text-foreground">{item.title}</div>
                            <div className="text-xs text-muted-foreground">{item.desc}</div>
                        </div>
                    </div>
                ))}
            </div>

            <Tip>{isEs ? "Todos los datos del Overview son en tiempo real. Refresca el tab para ver los últimos valores." : "All Overview data is real-time. Refresh the tab to see the latest values."}</Tip>
        </div>
    );
}
