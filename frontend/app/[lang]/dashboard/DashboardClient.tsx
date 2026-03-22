"use client";

import { useState, useEffect } from "react";
import { logger } from "@/lib/logger";
import { createClient } from "@/lib/supabase/client";
import {
    LayoutDashboard, Zap, Handshake, Database, Newspaper,
    Play, GitBranch, Globe, Bell, HelpCircle, Monitor
} from "lucide-react";
import {
    AffiliateManager, PostEditor, AffiliateLinkTester,
    RemindersManager, ProviderManager,
} from "@/components/dashboard";
import { SEOManager } from "@/components/dashboard/SEOManager";
import { HelpCenter } from "@/components/dashboard/HelpCenter";
import { OverviewTab } from "./tabs/OverviewTab";
import { TasksTab } from "./tabs/TasksTab";
import { WorkflowsTab } from "./tabs/WorkflowsTab";
import type { AdminTask, TaskType, TaskPriority, ScraperStatus } from "@/lib/tasks/types";

interface ScraperMetrics { total: number; online: number; failing: number; stale: number; syncCount: number }

export default function DashboardClient({ dict, lang }: { dict: any; lang: string }) {
    const [activeTab, setActiveTab] = useState("overview");
    const [workflowRuns, setWorkflowRuns] = useState<any[]>([]);
    const [scraperStatuses, setScraperStatuses] = useState<ScraperStatus[]>([]);
    const [scraperFilter, setScraperFilter] = useState<'all' | 'online' | 'failing' | 'stale'>('all');
    const [scraperMetrics, setScraperMetrics] = useState<ScraperMetrics>({ total: 0, online: 0, failing: 0, stale: 0, syncCount: 0 });
    const [loadingWorkflows, setLoadingWorkflows] = useState(false);
    const [loadingScrapers, setLoadingScrapers] = useState(false);
    const [triggering, setTriggering] = useState(false);
    const [supabase] = useState(() => createClient());
    const [tasks, setTasks] = useState<AdminTask[]>([]);
    const [loadingTasks, setLoadingTasks] = useState(false);
    const [generatingTasks, setGeneratingTasks] = useState(false);
    const [selectedTask, setSelectedTask] = useState<AdminTask | null>(null);
    const [taskFilter, setTaskFilter] = useState<'all' | TaskType | TaskPriority>('all');
    const [searchQuery, setSearchQuery] = useState("");
    const [taskPage, setTaskPage] = useState(1);
    const [deletingAll, setDeletingAll] = useState(false);
    const [revenueData, setRevenueData] = useState({ activeAffiliates: 0, totalPosts: 0, projectedRevenue: 0 });
    const [analyticsSummary, setAnalyticsSummary] = useState({ clicksToday: 0, clicksMonth: 0 });

    useEffect(() => {
        document.cookie = "ha_ignore_tracking=true; path=/; max-age=86400; SameSite=Lax";
        if (activeTab === "workflows") fetchWorkflows();
        if (activeTab === "overview") { fetchScraperStatus(); fetchRevenueData(); fetchAnalyticsSummary(); }
        if (activeTab === "tasks") fetchTasks();
    }, [activeTab]);

    const fetchTasks = async () => {
        setLoadingTasks(true);
        try { const res = await fetch('/api/admin/tasks?status=pending'); const data = await res.json(); if (data.tasks) setTasks(data.tasks); }
        catch (e) { logger.error("Failed to fetch tasks", e); }
        finally { setLoadingTasks(false); }
    };

    const generateTasks = async () => {
        setGeneratingTasks(true);
        try {
            const res = await fetch('/api/admin/tasks/generate', { method: 'POST' });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Error generating tasks');
            if (data.created > 0) fetchTasks();
            alert(data.message || `Scan completed: ${data.created || 0} tasks found`);
        } catch (e) { logger.error("Failed to generate tasks", e); alert(e instanceof Error ? e.message : "Error"); }
        finally { setGeneratingTasks(false); }
    };

    const dismissTask = async (taskId: string) => {
        try {
            await fetch(`/api/admin/tasks/${taskId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'ignored' }) });
            setTasks(prev => prev.filter(t => t.id !== taskId));
        } catch (e) { logger.error("Failed to dismiss task", e); }
    };

    const deleteAllTasks = async () => {
        if (!confirm(lang === 'es' ? "¿Seguro que deseas eliminar todas las tareas?" : "Are you sure you want to delete all tasks?")) return;
        setDeletingAll(true);
        try {
            const res = await fetch('/api/admin/tasks', { method: 'DELETE' });
            if (res.ok) { setTasks([]); alert(lang === 'es' ? "Tareas eliminadas." : "Tasks deleted."); }
        } catch (e) { logger.error("Failed to delete all tasks", e); }
        finally { setDeletingAll(false); }
    };

    const fetchScraperStatus = async () => {
        setLoadingScrapers(true);
        try {
            const { data, error } = await supabase.from('scraper_status').select('*').order('last_run', { ascending: false });
            if (error) throw error;
            if (data) {
                const now = new Date();
                const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
                const enriched: ScraperStatus[] = data.map((item: any) => ({ ...item, status: new Date(item.last_run) < threeDaysAgo ? 'stale' : item.status }));
                const metrics = enriched.reduce((acc, curr) => {
                    acc.total++; if (curr.status === 'success') acc.online++; if (curr.status === 'error' || curr.status === 'warning') acc.failing++; if (curr.status === 'stale') acc.stale++; acc.syncCount += (curr.items_synced || 0); return acc;
                }, { total: 0, online: 0, failing: 0, stale: 0, syncCount: 0 });
                setScraperStatuses(enriched); setScraperMetrics(metrics);
            }
        } catch (e) { logger.error("Error fetching scrapers", e); }
        finally { setLoadingScrapers(false); }
    };

    const fetchWorkflows = async () => {
        setLoadingWorkflows(true);
        try { const res = await fetch('/api/github/workflow'); const data = await res.json(); if (data.runs) setWorkflowRuns(data.runs); }
        catch (e) { logger.error("Failed to fetch workflows", e); if (!workflowRuns.length) setWorkflowRuns([]); }
        finally { setLoadingWorkflows(false); }
    };

    const triggerWorkflow = async () => {
        setTriggering(true);
        try {
            const res = await fetch('/api/github/workflow', { method: 'POST' });
            if (res.ok) { alert(lang === 'es' ? "¡Flujo iniciado!" : "Workflow triggered!"); setTimeout(fetchWorkflows, 3000); }
            else { const err = await res.json(); alert("Error: " + err.error); }
        } catch { alert("Failed to trigger workflow"); }
        finally { setTriggering(false); }
    };

    const fetchRevenueData = async () => {
        try {
            const affRes = await fetch('/api/admin/affiliates?status=active');
            const affData = await affRes.json();
            const activeAffiliates = affData.stats?.active || 0;
            const { count: postCount } = await supabase.from('posts').select('*', { count: 'exact', head: true }).eq('status', 'published');
            const totalPosts = postCount ?? 0;
            const projectedRevenue = Math.round(Math.min(totalPosts * 15 * 0.008, activeAffiliates * 3) * 65);
            setRevenueData({ activeAffiliates, totalPosts, projectedRevenue });
        } catch (e) { logger.error('Failed to calculate revenue', e); }
    };

    const fetchAnalyticsSummary = async () => {
        try { const res = await fetch('/api/admin/analytics'); const data = await res.json(); if (data.summary) setAnalyticsSummary({ clicksToday: data.summary.clicksToday || 0, clicksMonth: data.summary.clicksMonth || 0 }); }
        catch (e) { logger.error('Failed to fetch analytics', e); }
    };

    const successCount = scraperStatuses.filter(s => s.status === 'success').length;
    const errorCount = scraperStatuses.filter(s => s.status === 'error').length;
    const successRate = scraperStatuses.length > 0 ? (successCount / scraperStatuses.length) * 100 : 0;

    const TABS = [
        { id: 'overview', icon: LayoutDashboard, label: dict.dashboard.tabs.overview },
        { id: 'tasks', icon: Zap, label: dict.dashboard.tabs.tasks, badge: tasks.length || undefined },
        { id: 'affiliates', icon: Handshake, label: dict.dashboard.tabs.affiliates },
        { id: 'providers', icon: Database, label: 'Proveedores' },
        { id: 'newsroom', icon: Newspaper, label: dict.dashboard.tabs.newsroom },
        { id: 'studio', icon: Play, label: 'Studio' },
        { id: 'workflows', icon: GitBranch, label: dict.dashboard.tabs.workflows },
        { id: 'seo', icon: Globe, label: dict.dashboard.tabs.seo || 'Indexing' },
        { id: 'reminders', icon: Bell, label: 'Recordatorios' },
        { id: 'tutorial', icon: HelpCircle, label: dict.dashboard.tabs.tutorial },
    ];

    return (
        <div className="min-h-screen pt-20 pb-12 px-4 md:px-6 dashboard-content">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl md:text-4xl font-bold tracking-tight">{dict.dashboard.title}</h1>
                        <p className="text-muted-foreground mt-1 text-sm">{dict.dashboard.subtitle}</p>
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
                        {TABS.map(({ id, icon: Icon, label, badge }) => (
                            <button key={id} onClick={() => setActiveTab(id)}
                                className={`flex-shrink-0 px-3 py-2 rounded-full text-xs md:text-sm font-medium transition-colors flex items-center gap-1.5 ${activeTab === id ? 'bg-primary text-white' : 'bg-white/5 hover:bg-white/10'}`}>
                                <Icon className="w-4 h-4" />
                                <span className="hidden sm:inline">{label}</span>
                                {badge && <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{badge}</span>}
                            </button>
                        ))}
                    </div>
                </div>

                {activeTab === 'overview' && (
                    <OverviewTab dict={dict} lang={lang} scraperStatuses={scraperStatuses} scraperMetrics={scraperMetrics} scraperFilter={scraperFilter} setScraperFilter={setScraperFilter} loadingScrapers={loadingScrapers} fetchScraperStatus={fetchScraperStatus} analyticsSummary={analyticsSummary} revenueData={revenueData} successRate={successRate} successCount={successCount} errorCount={errorCount} />
                )}
                {activeTab === 'tasks' && (
                    <TasksTab dict={dict} tasks={tasks} loadingTasks={loadingTasks} generatingTasks={generatingTasks} deletingAll={deletingAll} taskFilter={taskFilter} setTaskFilter={setTaskFilter} searchQuery={searchQuery} setSearchQuery={setSearchQuery} taskPage={taskPage} setTaskPage={setTaskPage} selectedTask={selectedTask} setSelectedTask={setSelectedTask} fetchTasks={fetchTasks} generateTasks={generateTasks} deleteAllTasks={deleteAllTasks} dismissTask={dismissTask} />
                )}
                {activeTab === 'affiliates' && <div className="space-y-8"><AffiliateLinkTester /><AffiliateManager /></div>}
                {activeTab === 'newsroom' && <div className="space-y-6"><PostEditor onNavigateToAffiliates={() => setActiveTab('affiliates')} /></div>}
                {activeTab === 'studio' && (
                    <div className="flex flex-col items-center justify-center py-20 px-4 text-center space-y-6 animate-in zoom-in-95 duration-500">
                        <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-xl shadow-primary/5"><Play className="w-10 h-10 ml-2" /></div>
                        <div className="space-y-2">
                            <h2 className="text-2xl font-bold tracking-tight">Focus Mode Essential</h2>
                            <p className="text-muted-foreground max-w-md mx-auto text-sm leading-relaxed">The Video Studio requires a dedicated fullscreen experience to run the precision timeline and high-performance React renderer.</p>
                        </div>
                        <a href={`/${lang}/studio`} className="bg-primary hover:bg-primary/90 text-white font-bold h-14 px-8 rounded-2xl gap-3 inline-flex items-center transition-all shadow-xl shadow-primary/20 mt-4 hover:scale-105">
                            <Monitor className="w-5 h-5" /> Launch Video Studio
                        </a>
                    </div>
                )}
                {activeTab === 'workflows' && <WorkflowsTab dict={dict} lang={lang} workflowRuns={workflowRuns} loadingWorkflows={loadingWorkflows} triggering={triggering} triggerWorkflow={triggerWorkflow} />}
                {activeTab === 'seo' && <SEOManager dict={dict} lang={lang} />}
                {activeTab === 'providers' && <ProviderManager />}
                {activeTab === 'tutorial' && <HelpCenter dict={dict} lang={lang} />}
                {activeTab === 'reminders' && <RemindersManager />}
            </div>
        </div>
    );
}
