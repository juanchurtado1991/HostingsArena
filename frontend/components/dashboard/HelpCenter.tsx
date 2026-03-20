"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import {
    Server, Zap, Handshake, Newspaper, BookOpen,
    BarChart3, GitBranch,
    Globe, ArrowRight, LayoutDashboard,
    Database, Bell
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

// Modules
import { OverviewSection } from "./help-center/OverviewSection";
import { NewsroomSection } from "./help-center/NewsroomSection";
import { AffiliatesSection } from "./help-center/AffiliatesSection";
import { AnalyticsSection } from "./help-center/AnalyticsSection";
import { ScrapersSection } from "./help-center/ScrapersSection";
import { TasksSection } from "./help-center/TasksSection";
import { SEOSection } from "./help-center/SEOSection";
import { RemindersSection } from "./help-center/RemindersSection";
import { ProvidersSection } from "./help-center/ProvidersSection";
import { WorkflowsSection } from "./help-center/WorkflowsSection";

interface HelpCenterProps {
    dict: any;
    lang: string;
}

export function HelpCenter({ dict, lang }: HelpCenterProps) {
    const [activeCategory, setActiveCategory] = useState("overview");
    const isEs = lang === 'es';

    const categories = [
        { id: "overview",   label: isEs ? "Vista General"         : "Dashboard Overview",     icon: LayoutDashboard },
        { id: "newsroom",   label: isEs ? "Editor y Noticias"     : "Newsroom & Editor",      icon: Newspaper },
        { id: "affiliates", label: isEs ? "Afiliados"             : "Affiliate Manager",      icon: Handshake },
        { id: "analytics",  label: isEs ? "Analytics"             : "Analytics",              icon: BarChart3 },
        { id: "scrapers",   label: isEs ? "Scrapers (Live)"       : "Live Scraper Health",    icon: Server },
        { id: "tasks",      label: isEs ? "Task Center"           : "Task Center",            icon: Zap },
        { id: "seo",        label: isEs ? "SEO e Indexing"        : "SEO & Indexing",         icon: Globe },
        { id: "providers",  label: isEs ? "Gestión de Proveedores" : "Provider Management",    icon: Database },
        { id: "reminders",  label: isEs ? "Recordatorios"         : "Slack Reminders",        icon: Bell },
        { id: "workflows",  label: isEs ? "Workflows"             : "Workflows / CI",         icon: GitBranch },
    ];

    const renderContent = () => {
        const props = { isEs };
        switch (activeCategory) {
            case "overview":   return <OverviewSection {...props} />;
            case "newsroom":   return <NewsroomSection {...props} />;
            case "affiliates": return <AffiliatesSection {...props} />;
            case "analytics":  return <AnalyticsSection {...props} />;
            case "scrapers":   return <ScrapersSection {...props} />;
            case "tasks":      return <TasksSection {...props} />;
            case "seo":        return <SEOSection {...props} />;
            case "reminders":  return <RemindersSection {...props} />;
            case "providers":  return <ProvidersSection {...props} />;
            case "workflows":  return <WorkflowsSection {...props} />;
            default:           return null;
        }
    };

    return (
        <GlassCard className="overflow-hidden p-0 border-white/10 shadow-2xl">
            <div className="md:hidden border-b border-white/10 bg-white/5">
                <div className="flex overflow-x-auto scrollbar-hide px-3 py-2 gap-1">
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={cn(
                                "flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                                activeCategory === cat.id
                                    ? "bg-primary text-white shadow-lg shadow-primary/25"
                                    : "text-muted-foreground hover:bg-white/10"
                            )}
                        >
                            <cat.icon className="w-3.5 h-3.5" />
                            <span className="whitespace-nowrap">{cat.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex h-[calc(100vh-220px)] md:h-[calc(100vh-200px)] overflow-hidden">
                <div className="hidden md:flex flex-col w-56 xl:w-64 border-r border-white/10 bg-white/[0.02] shrink-0">
                    <div className="p-4 border-b border-white/5">
                        <h3 className="font-bold flex items-center gap-2 text-foreground">
                            <BookOpen className="w-4 h-4 text-primary" />
                            Help Center
                        </h3>
                        <p className="text-[10px] text-muted-foreground mt-0.5">v3.0 — Feb 2026</p>
                    </div>
                    <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={cn(
                                    "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left",
                                    activeCategory === cat.id
                                        ? "bg-primary/10 text-primary ring-1 ring-primary/20"
                                        : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                                )}
                            >
                                <cat.icon className="w-4 h-4 shrink-0 opacity-70" />
                                <span className="truncate">{cat.label}</span>
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="flex-1 overflow-y-auto p-4 md:p-8">
                    <div className="max-w-2xl mx-auto pb-16 animate-in fade-in slide-in-from-right-4 duration-300" key={activeCategory}>
                        {renderContent()}

                        <div className="mt-10 pt-6 border-t border-white/10 text-xs text-muted-foreground flex flex-col sm:flex-row justify-between gap-2">
                            <span>HostingArena Dashboard v3.0 · Feb 2026</span>
                            <a href="https://github.com/juanchurtado1991/HostingsArena" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors flex items-center gap-1">
                                {isEs ? "Ver Repositorio" : "View Repository"} <ArrowRight className="w-3 h-3" />
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </GlassCard>
    );
}