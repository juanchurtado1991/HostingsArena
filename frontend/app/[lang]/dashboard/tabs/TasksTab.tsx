import React from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { cn } from '@/lib/utils';
import { Activity, Server, Zap, CheckCircle, AlertCircle, AlertTriangle, RefreshCw, Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TaskCard, AffiliateResolveModal } from '@/components/dashboard';
import type { AdminTask, TaskType, TaskPriority } from '@/lib/tasks/types';

const TASKS_PER_PAGE = 15;

interface TasksTabProps {
    dict: any;
    tasks: AdminTask[];
    loadingTasks: boolean;
    generatingTasks: boolean;
    deletingAll: boolean;
    taskFilter: 'all' | TaskType | TaskPriority;
    setTaskFilter: (v: 'all' | TaskType | TaskPriority) => void;
    searchQuery: string;
    setSearchQuery: (v: string) => void;
    taskPage: number;
    setTaskPage: (fn: (p: number) => number) => void;
    selectedTask: AdminTask | null;
    setSelectedTask: (t: AdminTask | null) => void;
    fetchTasks: () => void;
    generateTasks: () => void;
    deleteAllTasks: () => void;
    dismissTask: (id: string) => void;
}

export function TasksTab({
    dict, tasks, loadingTasks, generatingTasks, deletingAll,
    taskFilter, setTaskFilter, searchQuery, setSearchQuery,
    taskPage, setTaskPage, selectedTask, setSelectedTask,
    fetchTasks, generateTasks, deleteAllTasks, dismissTask,
}: TasksTabProps) {
    const criticalTasks = tasks.filter(t => t.priority === 'critical');
    const highTasks = tasks.filter(t => t.priority === 'high');
    const normalTasks = tasks.filter(t => t.priority === 'normal' || t.priority === 'low');

    const filteredTasks = tasks.filter(task => {
        let matchesFilter = true;
        if (taskFilter !== 'all') {
            if (['critical', 'high', 'normal', 'low'].includes(taskFilter as string)) matchesFilter = task.priority === taskFilter;
            else matchesFilter = task.task_type === taskFilter;
        }
        const matchesSearch = !searchQuery ||
            task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (task.description?.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesFilter && matchesSearch;
    });

    const paginatedTasks: AdminTask[] = filteredTasks.slice((taskPage - 1) * TASKS_PER_PAGE, taskPage * TASKS_PER_PAGE);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold">{dict.dashboard.tasks.title}</h2>
                    <p className="text-muted-foreground">
                        {dict.dashboard.tasks.pending_count.replace('{count}', tasks.length.toString())} • {dict.dashboard.tasks.page_x_of_y.replace('{current}', taskPage.toString()).replace('{total}', (Math.ceil(filteredTasks.length / TASKS_PER_PAGE) || 1).toString())}
                    </p>
                </div>
                <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                    <div className="relative">
                        <input type="text" placeholder={dict.dashboard.tasks.search_placeholder} value={searchQuery}
                            onChange={e => { setSearchQuery(e.target.value); setTaskPage(() => 1); }}
                            className="bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary w-full md:w-64 pl-10" />
                        <Activity className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
                    </div>
                    <Button variant="outline" size="sm" onClick={fetchTasks} disabled={loadingTasks}>
                        <RefreshCw className={`w-4 h-4 mr-2 ${loadingTasks ? 'animate-spin' : ''}`} />{dict.dashboard.tasks.btn_refresh}
                    </Button>
                    <Button onClick={generateTasks} disabled={generatingTasks} size="sm">
                        {generatingTasks ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Zap className="w-4 h-4 mr-2" />}{dict.dashboard.tasks.btn_scan}
                    </Button>
                    <Button variant="destructive" size="sm" onClick={deleteAllTasks} disabled={deletingAll || tasks.length === 0}>
                        {deletingAll ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <AlertTriangle className="w-4 h-4 mr-2" />}{dict.dashboard.tasks.btn_clear_all}
                    </Button>
                </div>
            </div>

            {/* Priority Summary */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { filter: 'critical', count: criticalTasks.length, color: 'red', label: dict.dashboard.tasks.priority_critical, sub: 'Links de afiliado faltantes', dot: true },
                    { filter: 'high', count: highTasks.length, color: 'orange', label: dict.dashboard.tasks.priority_high, sub: 'Scrapers con errores' },
                    { filter: 'normal', count: normalTasks.length, color: 'blue', label: dict.dashboard.tasks.priority_normal, sub: 'Scrapers desactualizados' },
                ].map(({ filter, count, color, label, sub, dot }) => (
                    <button key={filter} onClick={() => setTaskFilter(filter as any)}
                        className={`p-4 rounded-xl border transition-all text-left ${taskFilter === filter ? `bg-${color}-500/20 border-${color}-500` : `bg-${color}-500/5 border-transparent hover:border-${color}-500/50`}`}>
                        <div className="flex items-center justify-between">
                            <span className={`text-2xl font-bold text-${color}-500`}>{count}</span>
                            <div className={`w-3 h-3 bg-${color}-500 rounded-full ${dot ? 'animate-pulse' : ''}`} />
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{label}</p>
                        <p className={`text-xs text-${color}-500/70 mt-1`}>{sub}</p>
                    </button>
                ))}
            </div>

            {/* Filter tabs */}
            <div className="flex gap-2 flex-wrap">
                <Button variant={taskFilter === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setTaskFilter('all')}>{dict.dashboard.tasks.filter_all} ({tasks.length})</Button>
                <Button variant={taskFilter === 'affiliate_audit' ? 'default' : 'outline'} size="sm" onClick={() => setTaskFilter('affiliate_audit')}><LinkIcon className="w-3 h-3 mr-1" />{dict.dashboard.tasks.type_links} ({tasks.filter(t => t.task_type === 'affiliate_audit').length})</Button>
                <Button variant={taskFilter === 'scraper_fix' ? 'default' : 'outline'} size="sm" onClick={() => setTaskFilter('scraper_fix')}><Server className="w-3 h-3 mr-1" />{dict.dashboard.tasks.type_scrapers} ({tasks.filter(t => t.task_type === 'scraper_fix').length})</Button>
            </div>

            {loadingTasks ? (
                <div className="text-center py-12 text-muted-foreground">Cargando tareas...</div>
            ) : tasks.length === 0 ? (
                <GlassCard className="p-12 text-center">
                    <div className="flex flex-col items-center gap-4">
                        <div className="p-4 bg-green-500/10 rounded-full"><CheckCircle className="w-8 h-8 text-green-500" /></div>
                        <h3 className="text-xl font-bold">{dict.dashboard.tasks.empty_title}</h3>
                        <p className="text-muted-foreground max-w-md">{dict.dashboard.tasks.empty_desc}</p>
                    </div>
                </GlassCard>
            ) : (
                <GlassCard className="overflow-hidden">
                    {/* Mobile */}
                    <div className="block md:hidden divide-y divide-white/5">
                        {paginatedTasks.map(task => (
                            <div key={task.id} className="flex items-start justify-between p-4 hover:bg-white/5 transition-colors gap-3">
                                <div className="flex items-start gap-3 min-w-0">
                                    <span className={`mt-0.5 inline-flex items-center justify-center w-6 h-6 shrink-0 rounded-full text-sm ${task.priority === 'critical' ? 'bg-red-500/10' : task.priority === 'high' ? 'bg-orange-500/10' : 'bg-blue-500/10'}`}>
                                        {task.priority === 'critical' && '🔥'}{task.priority === 'high' && '⚠️'}{task.priority === 'normal' && '📝'}
                                    </span>
                                    <div className="min-w-0">
                                        <div className="font-medium text-sm leading-tight line-clamp-2">{task.title}</div>
                                        {task.description && <div className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">{task.description}</div>}
                                    </div>
                                </div>
                                <div className="flex gap-1 shrink-0">
                                    <Button size="sm" variant="default" onClick={() => setSelectedTask(task)} className="h-7 text-xs px-2">{dict.dashboard.tasks.btn_resolve}</Button>
                                    <Button size="sm" variant="ghost" onClick={() => dismissTask(task.id!)} className="h-7 text-xs text-muted-foreground px-2">✕</Button>
                                </div>
                            </div>
                        ))}
                    </div>
                    {/* Desktop */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="text-xs uppercase text-muted-foreground border-b border-white/10 bg-white/5">
                                <tr>
                                    <th className="py-3 px-4 w-16">P</th>
                                    <th className="py-3 px-4">Task</th>
                                    <th className="py-3 px-4 w-32">Type</th>
                                    <th className="py-3 px-4 w-32 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {paginatedTasks.map(task => (
                                    <tr key={task.id} className="hover:bg-white/5 transition-colors">
                                        <td className="py-3 px-4">
                                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${task.priority === 'critical' ? 'bg-red-500/10 text-red-500' : task.priority === 'high' ? 'bg-orange-500/10 text-orange-500' : 'bg-blue-500/10 text-blue-500'}`}>
                                                {task.priority === 'critical' && '🔥'}{task.priority === 'high' && '⚠️'}{task.priority === 'normal' && '📝'}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="font-medium text-sm">{task.title}</div>
                                            {task.description && <div className="text-xs text-muted-foreground line-clamp-1 max-w-md">{task.description}</div>}
                                        </td>
                                        <td className="py-3 px-4 text-xs text-muted-foreground">
                                            {task.task_type === 'affiliate_audit' && <><LinkIcon className="w-3 h-3 inline mr-1" />Link</>}
                                            {task.task_type === 'scraper_fix' && <><Server className="w-3 h-3 inline mr-1" />Scraper</>}
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <div className="flex gap-2 justify-end">
                                                <Button size="sm" variant="default" onClick={() => setSelectedTask(task)} className="h-7 text-xs">{dict.dashboard.tasks.btn_resolve}</Button>
                                                <Button size="sm" variant="ghost" onClick={() => dismissTask(task.id!)} className="h-7 text-xs text-muted-foreground">✕</Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {filteredTasks.length > TASKS_PER_PAGE && (
                        <div className="flex items-center justify-between px-4 py-3 border-t border-white/10">
                            <p className="text-sm text-muted-foreground">Mostrando {((taskPage - 1) * TASKS_PER_PAGE) + 1}–{Math.min(taskPage * TASKS_PER_PAGE, filteredTasks.length)} de {filteredTasks.length}</p>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => setTaskPage(p => Math.max(1, p - 1))} disabled={taskPage === 1}>← {dict.dashboard.tasks.prev}</Button>
                                <Button variant="outline" size="sm" onClick={() => setTaskPage(p => p + 1)} disabled={taskPage >= Math.ceil(filteredTasks.length / TASKS_PER_PAGE)}>{dict.dashboard.tasks.next} →</Button>
                            </div>
                        </div>
                    )}
                </GlassCard>
            )}

            {selectedTask?.task_type === 'affiliate_audit' && (
                <AffiliateResolveModal task={selectedTask} onClose={() => setSelectedTask(null)} onResolved={() => { setSelectedTask(null); fetchTasks(); }} />
            )}
        </div>
    );
}
