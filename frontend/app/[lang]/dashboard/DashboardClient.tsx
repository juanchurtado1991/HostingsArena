"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { formatCurrency } from "@/lib/utils";
import { Activity, Server, DollarSign, Users, AlertCircle, CheckCircle, Link as LinkIcon, Plus, Play, Clock, Github, AlertTriangle, Zap, RefreshCw, Newspaper, LayoutDashboard, Handshake, GitBranch, HelpCircle, ChevronRight, BookOpen } from "lucide-react";
import { useState, useEffect } from "react";
import { logger } from "@/lib/logger";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { TaskCard, AffiliateResolveModal, AffiliateManager, PostEditor } from "@/components/dashboard";
import { AnalyticsCard } from "@/components/dashboard/AnalyticsCard";
import type { AdminTask, TaskType, TaskPriority } from "@/lib/tasks/types";

const TASKS_PER_PAGE = 15;
export default function DashboardClient({ dict, lang }: { dict: any; lang: string }) {
    const TUTORIAL_TOPICS = [
        {
            id: "scrapers",
            title: dict.dashboard.tabs.workflows,
            icon: Server,
            category: lang === 'es' ? "Automatización" : "Automation",
            content: lang === 'es' ? `
                HostingArena utiliza scrapers de Python para obtener datos en tiempo real.
                \n• **Online**: El scraper funciona correctamente y está sincronizado.
                \n• **Warning**: Problemas menores (ej. faltó un campo), pero mayormente operativo.
                \n• **Error**: El scraper falló completamente por cambios en el sitio del proveedor. Requiere revisión técnica.
                \n• **Sync**: Los datos se suben a Supabase y se refrescan vía ISR para máxima velocidad.
            ` : `
                HostingArena uses Python scrapers to fetch real-time data. 
                \n• **Online**: Scraper is working correctly and synced.
                \n• **Warning**: Minor issues (e.g., a field was missed), but mostly operational.
                \n• **Error**: Scraper failed completely due to provider website changes. Needs technical review.
                \n• **Sync**: Data is uploaded to Supabase and refreshed via ISR for maximum speed.
            `
        },
        {
            id: "tasks",
            title: dict.dashboard.tasks.title,
            icon: Zap,
            category: lang === 'es' ? "Operaciones" : "Operations",
            content: lang === 'es' ? `
                El motor de auditoría genera tareas automáticamente para asegurar la calidad de los datos.
                \n• **Scan**: Ejecuta una auditoría manual para revisar links faltantes o errores.
                \n• **Deduplicación**: El sistema agrupa planes por proveedor para que solo arregles un link una vez.
                \n• **Draft**: Puedes limpiar la lista usando 'Borrar Todo' si realizaste mantenimiento manual masivo.
            ` : `
                The audit engine generates tasks automatically to ensure data quality.
                \n• **Scan**: Runs a manual audit to check for missing links or errors.
                \n• **Deduplication**: System groups plans by provider so you only fix a link once.
                \n• **Draft**: You can clear the list using 'Clear All' if you've done massive manual maintenance.
            `
        },
        {
            id: "affiliates",
            title: dict.dashboard.tabs.affiliates,
            icon: Handshake,
            category: lang === 'es' ? "Ingresos" : "Revenue",
            content: lang === 'es' ? `
                Gestiona cómo monetizamos cada proveedor.
                \n• **Links de Afiliado**: Se aplican automáticamente a todos los botones 'Ver Oferta' basados en 'provider_name'.
                \n• **Credenciales de Panel**: Guarda la URL y login del panel de afiliados para acceso rápido.
                \n• **Estado**: Proveedores 'Pausados' o 'Expirados' dispararán alertas críticas en el Centro de Tareas.
            ` : `
                Manage how we monetize each provider.
                \n• **Affiliate Links**: Automatically applied to all 'View Deal' buttons based on 'provider_name'.
                \n• **Dashboard Credentials**: Store affiliate panel URL and login for quick access.
                \n• **Status**: 'Paused' or 'Expired' providers will trigger critical alerts in Task Center.
            `
        },
        {
            id: "newsroom",
            title: dict.dashboard.tutorial.newsroom.title,
            icon: Newspaper,
            category: dict.dashboard.tutorial.newsroom.category,
            content: dict.dashboard.tutorial.newsroom.content
        }
    ];

    const [activeTab, setActiveTab] = useState("overview");
    const [workflowRuns, setWorkflowRuns] = useState<any[]>([]);
    const [scraperStatuses, setScraperStatuses] = useState<any[]>([]);
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
    const [tutorialSearch, setTutorialSearch] = useState("");

    const [revenueData, setRevenueData] = useState<{
        activeAffiliates: number;
        totalPosts: number;
        projectedRevenue: number;
    }>({ activeAffiliates: 0, totalPosts: 0, projectedRevenue: 0 });

    useEffect(() => {
        if (activeTab === "workflows") {
            fetchWorkflows();
        }
        if (activeTab === "overview") {
            fetchScraperStatus();
            fetchRevenueData();
        }
        if (activeTab === "tasks") {
            fetchTasks();
        }
    }, [activeTab]);

    const fetchTasks = async () => {
        setLoadingTasks(true);
        try {
            const res = await fetch('/api/admin/tasks?status=pending');
            const data = await res.json();
            if (data.tasks) setTasks(data.tasks);
        } catch (error) {
            logger.error("Failed to fetch tasks", error);
        } finally {
            setLoadingTasks(false);
        }
    };

    const generateTasks = async () => {
        setGeneratingTasks(true);
        try {
            const res = await fetch('/api/admin/tasks/generate', { method: 'POST' });
            const data = await res.json();
            if (data.created > 0) {
                fetchTasks();
            }
            alert(data.message);
        } catch (error) {
            logger.error("Failed to generate tasks", error);
            alert("Error generating tasks");
        } finally {
            setGeneratingTasks(false);
        }
    };

    const dismissTask = async (taskId: string) => {
        try {
            await fetch(`/api/admin/tasks/${taskId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'ignored' }),
            });
            setTasks(prev => prev.filter(t => t.id !== taskId));
        } catch (error) {
            logger.error("Failed to dismiss task", error);
        }
    };

    const deleteAllTasks = async () => {
        if (!confirm(lang === 'es' ? "¿Seguro que deseas eliminar todas las tareas?" : "Are you sure you want to delete all tasks?")) return;
        setDeletingAll(true);
        try {
            const res = await fetch('/api/admin/tasks', { method: 'DELETE' });
            if (res.ok) {
                setTasks([]);
                alert(lang === 'es' ? "Tareas eliminadas." : "Tasks deleted.");
            }
        } catch (error) {
            logger.error("Failed to delete all tasks", error);
        } finally {
            setDeletingAll(false);
        }
    };

    const fetchScraperStatus = async () => {
        setLoadingScrapers(true);
        logger.log('SYSTEM', "Fetching scraper statuses...", {
            url: process.env.NEXT_PUBLIC_SUPABASE_URL,
            keyPrefix: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 5)
        });
        try {
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Request timed out: Check your Supabase connection or Table Policies')), 15000)
            );

            const fetchPromise = supabase
                .from('scraper_status')
                .select('*')
                .order('last_run', { ascending: false });

            // @ts-ignore
            const result = await Promise.race([fetchPromise, timeoutPromise]);
            const { data, error } = result as any;

            if (error) {
                logger.error("Supabase Error fetching scrapers", error);
                logger.error("Scraper fetch error:", error.message);
                throw error;
            }

            logger.log('SYSTEM', `Data received: ${data?.length} rows`, data);
            if (data) setScraperStatuses(data);
            if (data?.length === 0) {
                logger.log('SYSTEM', "Received 0 rows. Check RLS or Table content.");
            }
        } catch (error) {
            const err = error as Error;
            logger.error("Exception fetching scrapers", err);

            if (err.message && err.message.includes('timed out')) {
                logger.log('SYSTEM', "⚠️ Trying direct FETCH fallback...");
                try {
                    const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/scraper_status?select=*&order=last_run.desc`;
                    const res = await fetch(url, {
                        headers: {
                            'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
                            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
                        }
                    });
                    if (res.ok) {
                        const data = await res.json();
                        logger.log('SYSTEM', `✅ Fallback fetch success: ${data.length} rows`);
                        setScraperStatuses(data);
                        return; // Success!
                    } else {
                        const text = await res.text();
                        logger.error("Fallback fetch failed", { status: res.status, body: text });
                    }
                } catch (fallbackError: any) {
                    logger.error("Fallback fetch exception", fallbackError);
                }
            }

            alert(`Error fetching scrapers: ${err.message || 'Unknown error'}`);
        } finally {
            setLoadingScrapers(false);
        }
    };

    const fetchWorkflows = async () => {
        setLoadingWorkflows(true);
        try {
            const res = await fetch('/api/github/workflow');
            const data = await res.json();
            if (data.runs) setWorkflowRuns(data.runs);
        } catch (e) {
            logger.error("Failed to fetch workflows", e);
            if (!workflowRuns.length) setWorkflowRuns([]);
        } finally {
            setLoadingWorkflows(false);
        }
    };

    const triggerWorkflow = async () => {
        setTriggering(true);
        try {
            const res = await fetch('/api/github/workflow', { method: 'POST' });
            if (res.ok) {
                alert(lang === 'es' ? "¡Flujo iniciado! Puede tardar unos segundos en aparecer." : "Workflow triggered! It may take a few seconds to appear in the list.");
                setTimeout(fetchWorkflows, 3000); // Refresh after 3s
            } else {
                const err = await res.json();
                alert((lang === 'es' ? "Error iniciando flujo: " : "Error triggering workflow: ") + err.error);
            }
        } catch (e) {
            alert("Failed to trigger workflow");
        } finally {
            setTriggering(false);
        }
    };

    const fetchRevenueData = async () => {
        try {
            const affRes = await fetch('/api/admin/affiliates?status=active');
            const affData = await affRes.json();
            const activeAffiliates = affData.stats?.active || 0;

            const { count: postCount } = await supabase
                .from('posts')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'published');

            const totalPosts = postCount ?? 0;

            const clicksPerPost = 15;
            const conversionRate = 0.008;
            const avgCommission = 65;

            const monthlyClicks = totalPosts * clicksPerPost;
            const conversions = monthlyClicks * conversionRate;
            const effectiveConversions = Math.min(conversions, activeAffiliates * 3);
            const projectedRevenue = Math.round(effectiveConversions * avgCommission);

            setRevenueData({ activeAffiliates, totalPosts, projectedRevenue });
        } catch (e) {
            logger.error('Failed to calculate revenue', e);
        }
    };

    const activeProviders = scraperStatuses.length;
    const successCount = scraperStatuses.filter(s => s.status === 'success').length;
    const errorCount = scraperStatuses.filter(s => s.status === 'error').length;
    const successRate = activeProviders > 0 ? (successCount / activeProviders) * 100 : 0;
    const avgDuration = activeProviders > 0
        ? scraperStatuses.reduce((acc, curr) => acc + (curr.duration_seconds || 0), 0) / activeProviders
        : 0;

    const criticalTasks = tasks.filter(t => t.priority === 'critical');
    const highTasks = tasks.filter(t => t.priority === 'high');
    const normalTasks = tasks.filter(t => t.priority === 'normal' || t.priority === 'low');

    const filteredTasks = tasks.filter(task => {
        // Priority/Type Filter
        let matchesFilter = true;
        if (taskFilter !== 'all') {
            if (taskFilter === 'critical' || taskFilter === 'high' || taskFilter === 'normal' || taskFilter === 'low') {
                matchesFilter = task.priority === taskFilter;
            } else {
                matchesFilter = task.task_type === taskFilter;
            }
        }

        // Search Filter
        const matchesSearch = !searchQuery ||
            task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (task.description?.toLowerCase().includes(searchQuery.toLowerCase()));

        return matchesFilter && matchesSearch;
    });

    const paginatedTasks: AdminTask[] = filteredTasks.slice(
        (taskPage - 1) * TASKS_PER_PAGE,
        taskPage * TASKS_PER_PAGE
    );

    return (
        <div className="min-h-screen pt-24 pb-12 px-6 dashboard-content">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-12">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight">{dict.dashboard.title}</h1>
                        <p className="text-muted-foreground mt-2">{dict.dashboard.subtitle}</p>
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={() => setActiveTab("overview")}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === "overview" ? "bg-primary text-white" : "bg-white/5 hover:bg-white/10"}`}
                        >
                            <LayoutDashboard className="w-4 h-4" />
                            {dict.dashboard.tabs.overview}
                        </button>
                        <button
                            onClick={() => setActiveTab("tasks")}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === "tasks" ? "bg-primary text-white" : "bg-white/5 hover:bg-white/10"}`}
                        >
                            <Zap className="w-4 h-4" />
                            {dict.dashboard.tabs.tasks}
                            {tasks.length > 0 && (
                                <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">{tasks.length}</span>
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab("affiliates")}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === "affiliates" ? "bg-primary text-white" : "bg-white/5 hover:bg-white/10"}`}
                        >
                            <Handshake className="w-4 h-4" />
                            {dict.dashboard.tabs.affiliates}
                        </button>
                        <button
                            onClick={() => setActiveTab("newsroom")}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === "newsroom" ? "bg-primary text-white" : "bg-white/5 hover:bg-white/10"}`}
                        >
                            <Newspaper className="w-4 h-4" />
                            {dict.dashboard.tabs.newsroom}
                        </button>
                        <button
                            onClick={() => setActiveTab("workflows")}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === "workflows" ? "bg-primary text-white" : "bg-white/5 hover:bg-white/10"}`}
                        >
                            <GitBranch className="w-4 h-4" />
                            {dict.dashboard.tabs.workflows}
                        </button>
                        <button
                            onClick={() => setActiveTab("tutorial")}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === "tutorial" ? "bg-primary text-white" : "bg-white/5 hover:bg-white/10"}`}
                        >
                            <HelpCircle className="w-4 h-4" />
                            {dict.dashboard.tabs.tutorial}
                        </button>
                    </div>
                </div>

                {activeTab === "overview" && (
                    <>
                        {/* Metrics Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                            <GlassCard className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500">
                                        <Server className="w-6 h-6" />
                                    </div>
                                </div>
                                <div className="text-3xl font-bold mb-1">{activeProviders}</div>
                                <div className="text-sm text-muted-foreground">{dict.dashboard.metrics.monitored_scrapers}</div>
                            </GlassCard>

                            <GlassCard className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`p-3 rounded-xl ${successRate > 90 ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                                        <Activity className="w-6 h-6" />
                                    </div>
                                    <span className="text-xs font-medium text-muted-foreground">{successCount} Success / {errorCount} Fail</span>
                                </div>
                                <div className="text-3xl font-bold mb-1">{successRate.toFixed(1)}%</div>
                                <div className="text-sm text-muted-foreground">{dict.dashboard.metrics.success_rate}</div>
                            </GlassCard>

                            <GlassCard className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-purple-500/10 rounded-xl text-purple-500">
                                        <Clock className="w-6 h-6" />
                                    </div>
                                </div>
                                <div className="text-3xl font-bold mb-1">{avgDuration.toFixed(2)}s</div>
                                <div className="text-sm text-muted-foreground">{dict.dashboard.metrics.avg_duration}</div>
                            </GlassCard>

                            <GlassCard className="p-6 relative group">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-green-500/10 rounded-xl text-green-500">
                                        <DollarSign className="w-6 h-6" />
                                    </div>
                                    <span className="text-[10px] font-medium text-muted-foreground bg-white/5 px-2 py-1 rounded-lg">
                                        {new Date().toLocaleDateString('en-US', { month: 'short' })} estimate
                                    </span>
                                </div>
                                <div className="text-3xl font-bold mb-1">
                                    {formatCurrency(revenueData.projectedRevenue)}
                                </div>
                                <div className="text-sm text-muted-foreground">{dict.dashboard.metrics.est_revenue}</div>
                                <div className="mt-3 flex gap-2 text-[10px] text-muted-foreground">
                                    <span className="bg-white/5 px-1.5 py-0.5 rounded">{revenueData.activeAffiliates} affiliates</span>
                                    <span className="bg-white/5 px-1.5 py-0.5 rounded">{revenueData.totalPosts} posts</span>
                                    <span className="bg-white/5 px-1.5 py-0.5 rounded">0.8% CVR</span>
                                </div>
                            </GlassCard>
                        </div>

                        {/* Analytics Card */}
                        <AnalyticsCard />

                        {/* Status Table */}
                        <GlassCard className="p-8">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold">{dict.dashboard.scrapers.title}</h3>
                                <div className="flex gap-2">
                                    <Button size="sm" variant="outline" onClick={() => {
                                        const report = scraperStatuses.map(s =>
                                            `[${s.status.toUpperCase()}] ${s.provider_name} (${s.items_synced} items) - ${s.duration_seconds}s - ${s.error_message || 'OK'}`
                                        ).join('\n');
                                        navigator.clipboard.writeText(report);
                                        alert("Report copied to clipboard!");
                                    }}>
                                        {dict.dashboard.scrapers.copy_report}
                                    </Button>
                                    <Button size="sm" variant="outline" onClick={fetchScraperStatus}>
                                        {dict.dashboard.scrapers.refresh}
                                    </Button>
                                </div>
                            </div>

                            {loadingScrapers ? (
                                <div className="text-center py-12 text-muted-foreground">Loading status...</div>
                            ) : (
                                <div className="overflow-x-auto max-h-[600px]">
                                    <table className="w-full text-left">
                                        <thead className="text-xs uppercase text-muted-foreground border-b border-white/10 sticky top-0 bg-background/95 backdrop-blur z-10">
                                            <tr>
                                                <th className="pb-4 pl-4">{dict.dashboard.scrapers.col_provider}</th>
                                                <th className="pb-4">{dict.dashboard.scrapers.col_type}</th>
                                                <th className="pb-4">{dict.dashboard.scrapers.col_status}</th>
                                                <th className="pb-4">{dict.dashboard.scrapers.col_items}</th>
                                                <th className="pb-4">{dict.dashboard.scrapers.col_duration}</th>
                                                <th className="pb-4">{dict.dashboard.scrapers.col_last_update}</th>
                                                <th className="pb-4 w-[200px]">{dict.dashboard.scrapers.col_message}</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {scraperStatuses.map((item) => (
                                                <tr key={item.id} className="hover:bg-white/5 transition-colors">
                                                    <td className="py-3 pl-4 font-medium">{item.provider_name}</td>
                                                    <td className="py-3 text-muted-foreground capitalize">{item.provider_type}</td>
                                                    <td className="py-3">
                                                        {item.status === "success" && (
                                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-500">
                                                                <CheckCircle className="w-3 h-3" /> Online
                                                            </span>
                                                        )}
                                                        {item.status === "warning" && (
                                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-500">
                                                                <AlertCircle className="w-3 h-3" /> Warning
                                                            </span>
                                                        )}
                                                        {item.status === "error" && (
                                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-500">
                                                                <AlertTriangle className="w-3 h-3" /> Error
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="py-3 text-center w-24">
                                                        <span className="font-mono bg-white/5 px-2 py-1 rounded text-xs">{item.items_synced}</span>
                                                    </td>
                                                    <td className="py-3 font-mono text-xs text-muted-foreground">{item.duration_seconds}s</td>
                                                    <td className="py-3 text-muted-foreground text-xs">
                                                        {new Date(item.last_run).toLocaleTimeString()}
                                                    </td>
                                                    <td className="py-3 text-xs text-red-400 truncate max-w-[200px]" title={item.error_message}>
                                                        {item.error_message || "-"}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </GlassCard>
                    </>
                )}

                {activeTab === "tasks" && (
                    <div className="space-y-6">
                        {/* Header with stats and actions */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <h2 className="text-2xl font-bold">{dict.dashboard.tasks.title}</h2>
                                <p className="text-muted-foreground">
                                    {dict.dashboard.tasks.pending_count.replace('{count}', tasks.length.toString())} • {dict.dashboard.tasks.page_x_of_y.replace('{current}', taskPage.toString()).replace('{total}', (Math.ceil(filteredTasks.length / TASKS_PER_PAGE) || 1).toString())}
                                </p>
                            </div>
                            <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder={dict.dashboard.tasks.search_placeholder}
                                        value={searchQuery}
                                        onChange={(e) => {
                                            setSearchQuery(e.target.value);
                                            setTaskPage(1);
                                        }}
                                        className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary w-full md:w-64 pl-10"
                                    />
                                    <Activity className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={fetchTasks}
                                    disabled={loadingTasks}
                                >
                                    <RefreshCw className={`w-4 h-4 mr-2 ${loadingTasks ? 'animate-spin' : ''}`} />
                                    {dict.dashboard.tasks.btn_refresh}
                                </Button>
                                <Button
                                    onClick={generateTasks}
                                    disabled={generatingTasks}
                                    size="sm"
                                >
                                    {generatingTasks ? (
                                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                    ) : (
                                        <Zap className="w-4 h-4 mr-2" />
                                    )}
                                    {dict.dashboard.tasks.btn_scan}
                                </Button>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={deleteAllTasks}
                                    disabled={deletingAll || tasks.length === 0}
                                >
                                    {deletingAll ? (
                                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                    ) : (
                                        <AlertTriangle className="w-4 h-4 mr-2" />
                                    )}
                                    {dict.dashboard.tasks.btn_clear_all}
                                </Button>
                            </div>
                        </div>

                        {/* Priority Summary Cards */}
                        <div className="grid grid-cols-3 gap-4">
                            <button
                                onClick={() => setTaskFilter('critical')}
                                className={`p-4 rounded-xl border transition-all text-left ${taskFilter === 'critical' ? 'bg-red-500/20 border-red-500' : 'bg-red-500/5 border-transparent hover:border-red-500/50'}`}
                                title="Links de afiliados faltantes = dinero perdido inmediatamente"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-2xl font-bold text-red-500">{criticalTasks.length}</span>
                                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">🔥 {dict.dashboard.tasks.priority_critical}</p>
                                <p className="text-xs text-red-500/70 mt-1">Links de afiliado faltantes</p>
                            </button>
                            <button
                                onClick={() => setTaskFilter('high')}
                                className={`p-4 rounded-xl border transition-all text-left ${taskFilter === 'high' ? 'bg-orange-500/20 border-orange-500' : 'bg-orange-500/5 border-transparent hover:border-orange-500/50'}`}
                                title="Scrapers con errores = datos incorrectos o desactualizados"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-2xl font-bold text-orange-500">{highTasks.length}</span>
                                    <div className="w-3 h-3 bg-orange-500 rounded-full" />
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">⚠️ {dict.dashboard.tasks.priority_high}</p>
                                <p className="text-xs text-orange-500/70 mt-1">Scrapers con errores</p>
                            </button>
                            <button
                                onClick={() => setTaskFilter('normal')}
                                className={`p-4 rounded-xl border transition-all text-left ${taskFilter === 'normal' ? 'bg-blue-500/20 border-blue-500' : 'bg-blue-500/5 border-transparent hover:border-blue-500/50'}`}
                                title="Scrapers desactualizados (+3 días sin ejecutar)"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-2xl font-bold text-blue-500">{normalTasks.length}</span>
                                    <div className="w-3 h-3 bg-blue-500 rounded-full" />
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">📝 {dict.dashboard.tasks.priority_normal}</p>
                                <p className="text-xs text-blue-500/70 mt-1">Scrapers desactualizados</p>
                            </button>
                        </div>

                        {/* Filter tabs */}
                        <div className="flex gap-2 flex-wrap">
                            <Button
                                variant={taskFilter === 'all' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setTaskFilter('all')}
                            >
                                {dict.dashboard.tasks.filter_all} ({tasks.length})
                            </Button>
                            <Button
                                variant={taskFilter === 'affiliate_audit' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setTaskFilter('affiliate_audit')}
                            >
                                <LinkIcon className="w-3 h-3 mr-1" />
                                {dict.dashboard.tasks.type_links} ({tasks.filter(t => t.task_type === 'affiliate_audit').length})
                            </Button>
                            <Button
                                variant={taskFilter === 'scraper_fix' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setTaskFilter('scraper_fix')}
                            >
                                <Server className="w-3 h-3 mr-1" />
                                {dict.dashboard.tasks.type_scrapers} ({tasks.filter(t => t.task_type === 'scraper_fix').length})
                            </Button>
                        </div>

                        {loadingTasks ? (
                            <div className="text-center py-12 text-muted-foreground">Cargando tareas...</div>
                        ) : tasks.length === 0 ? (
                            <GlassCard className="p-12 text-center">
                                <div className="flex flex-col items-center gap-4">
                                    <div className="p-4 bg-green-500/10 rounded-full">
                                        <CheckCircle className="w-8 h-8 text-green-500" />
                                    </div>
                                    <h3 className="text-xl font-bold">{dict.dashboard.tasks.empty_title}</h3>
                                    <p className="text-muted-foreground max-w-md">
                                        {dict.dashboard.tasks.empty_desc}
                                    </p>
                                </div>
                            </GlassCard>
                        ) : (
                            <GlassCard className="overflow-hidden">
                                {/* Task Table */}
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="text-xs uppercase text-muted-foreground border-b border-white/10 bg-white/5">
                                            <tr>
                                                <th className="py-3 px-4 w-16">{dict.dashboard.tasks.priority_critical.substring(0, 1)}</th>
                                                <th className="py-3 px-4">{dict.dashboard.tasks.title.split(' ')[0]}</th>
                                                <th className="py-3 px-4 w-32">{dict.dashboard.scrapers.col_type}</th>
                                                <th className="py-3 px-4 w-32 text-right">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {paginatedTasks.map(task => (
                                                <tr key={task.id} className="hover:bg-white/5 transition-colors">
                                                    <td className="py-3 px-4">
                                                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${task.priority === 'critical' ? 'bg-red-500/10 text-red-500' :
                                                            task.priority === 'high' ? 'bg-orange-500/10 text-orange-500' :
                                                                'bg-blue-500/10 text-blue-500'
                                                            }`}>
                                                            {task.priority === 'critical' && '🔥'}
                                                            {task.priority === 'high' && '⚠️'}
                                                            {task.priority === 'normal' && '📝'}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <div className="font-medium text-sm">{task.title}</div>
                                                        {task.description && (
                                                            <div className="text-xs text-muted-foreground line-clamp-1 max-w-md">{task.description}</div>
                                                        )}
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                            {task.task_type === 'affiliate_audit' && <><LinkIcon className="w-3 h-3" /> Link</>}
                                                            {task.task_type === 'scraper_fix' && <><Server className="w-3 h-3" /> Scraper</>}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4 text-right">
                                                        <div className="flex gap-2 justify-end">
                                                            <Button
                                                                size="sm"
                                                                variant="default"
                                                                onClick={() => setSelectedTask(task)}
                                                                className="h-7 text-xs"
                                                            >
                                                                {dict.dashboard.tasks.btn_resolve}
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                onClick={() => dismissTask(task.id!)}
                                                                className="h-7 text-xs text-muted-foreground"
                                                            >
                                                                ✕
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination */}
                                {filteredTasks.length > TASKS_PER_PAGE && (
                                    <div className="flex items-center justify-between px-4 py-3 border-t border-white/10">
                                        <p className="text-sm text-muted-foreground">
                                            Mostrando {((taskPage - 1) * TASKS_PER_PAGE) + 1}-{Math.min(taskPage * TASKS_PER_PAGE, filteredTasks.length)} de {filteredTasks.length}
                                        </p>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setTaskPage(p => Math.max(1, p - 1))}
                                                disabled={taskPage === 1}
                                            >
                                                ← {dict.dashboard.tasks.prev}
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setTaskPage(p => p + 1)}
                                                disabled={taskPage >= Math.ceil(filteredTasks.length / TASKS_PER_PAGE)}
                                            >
                                                {dict.dashboard.tasks.next} →
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </GlassCard>
                        )}
                    </div>
                )}

                {/* Affiliate Resolve Modal */}
                {selectedTask && selectedTask.task_type === 'affiliate_audit' && (
                    <AffiliateResolveModal
                        task={selectedTask}
                        onClose={() => setSelectedTask(null)}
                        onResolved={() => {
                            setSelectedTask(null);
                            fetchTasks();
                        }}
                    />
                )}

                {activeTab === "affiliates" && (
                    <AffiliateManager />
                )}

                {activeTab === "newsroom" && (
                    <PostEditor onNavigateToAffiliates={() => setActiveTab("affiliates")} />
                )}

                {activeTab === "workflows" && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-bold">{dict.dashboard.tabs.workflows}</h2>
                                <p className="text-muted-foreground">{lang === 'es' ? "Monitorea y dispara flujos de scraping directamente." : "Monitor and trigger scraping pipelines directly."}</p>
                            </div>

                            <Button
                                onClick={triggerWorkflow}
                                disabled={triggering}
                                className="flex items-center gap-2 bg-foreground text-background"
                            >
                                {triggering ? <Clock className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                                {triggering ? (lang === 'es' ? "Iniciando..." : "Starting...") : (lang === 'es' ? "Ejecutar Actualización Manual" : "Run Manual Update")}
                            </Button>
                        </div>

                        <GlassCard className="p-8">
                            <div className="flex items-center gap-2 mb-6">
                                <Github className="w-5 h-5" />
                                <h3 className="text-lg font-bold">Recent Workflow Runs (daily_update.yml)</h3>
                            </div>

                            {loadingWorkflows ? (
                                <div className="py-12 flex justify-center text-muted-foreground">Loading runs...</div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="text-xs uppercase text-muted-foreground border-b border-border/10">
                                            <tr>
                                                <th className="pb-4 pl-4">ID</th>
                                                <th className="pb-4">Status</th>
                                                <th className="pb-4">Conclusion</th>
                                                <th className="pb-4">Started At</th>
                                                <th className="pb-4 text-right pr-4">Link</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {workflowRuns.length === 0 ? (
                                                <tr><td colSpan={5} className="py-8 text-center text-muted-foreground">No recent runs found.</td></tr>
                                            ) : workflowRuns.map((run) => (
                                                <tr key={run.id} className="hover:bg-muted/5 transition-colors">
                                                    <td className="py-4 pl-4 font-mono text-xs">{run.id}</td>
                                                    <td className="py-4">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize 
                                                        ${run.status === 'completed' ? 'bg-muted text-muted-foreground' : 'bg-blue-500/10 text-blue-500 animate-pulse'}`}>
                                                            {run.status}
                                                        </span>
                                                    </td>
                                                    <td className="py-4">
                                                        {run.conclusion === 'success' && <span className="text-green-500 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Success</span>}
                                                        {run.conclusion === 'failure' && <span className="text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Failed</span>}
                                                        {!run.conclusion && <span className="text-muted-foreground">-</span>}
                                                    </td>
                                                    <td className="py-4 text-sm text-muted-foreground">
                                                        {new Date(run.created_at).toLocaleString()}
                                                    </td>
                                                    <td className="py-4 text-right pr-4">
                                                        <a href={run.html_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm">View Logs</a>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </GlassCard>
                    </div>
                )}

                {activeTab === "tutorial" && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <h2 className="text-3xl font-bold tracking-tight">Centro de Ayuda y Tutoriales</h2>
                                <p className="text-muted-foreground mt-1">Domina todas las herramientas de HostingArena.</p>
                            </div>
                            <div className="relative w-full md:w-96">
                                <Activity className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="¿Qué necesitas aprender hoy?"
                                    value={tutorialSearch}
                                    onChange={(e) => setTutorialSearch(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {TUTORIAL_TOPICS.filter(t =>
                                t.title.toLowerCase().includes(tutorialSearch.toLowerCase()) ||
                                t.content.toLowerCase().includes(tutorialSearch.toLowerCase())
                            ).map((topic) => (
                                <GlassCard key={topic.id} className="p-8 group hover:border-primary/30 transition-all">
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-primary/10 rounded-xl text-primary group-hover:bg-primary group-hover:text-white transition-all">
                                            <topic.icon className="w-6 h-6" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-[10px] uppercase tracking-widest font-bold text-primary/70">{topic.category}</span>
                                                <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </div>
                                            <h3 className="text-xl font-bold mb-4">{topic.title}</h3>
                                            <div className="text-sm text-muted-foreground leading-relaxed space-y-2 whitespace-pre-wrap">
                                                {topic.content}
                                            </div>
                                        </div>
                                    </div>
                                </GlassCard>
                            ))}
                        </div>

                        <div className="bg-primary/5 border border-primary/10 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-primary/20 rounded-full">
                                    <BookOpen className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <h4 className="font-bold">¿Necesitas ayuda avanzada?</h4>
                                    <p className="text-sm text-muted-foreground">Consulta la documentación técnica completa en el repositorio.</p>
                                </div>
                            </div>
                            <Button variant="default">Ver Repo GitHub</Button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
