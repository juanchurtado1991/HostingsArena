import React from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Github, CheckCircle, AlertCircle, Clock, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WorkflowsTabProps {
    dict: any;
    lang: string;
    workflowRuns: any[];
    loadingWorkflows: boolean;
    triggering: boolean;
    triggerWorkflow: () => void;
}

export function WorkflowsTab({ dict, lang, workflowRuns, loadingWorkflows, triggering, triggerWorkflow }: WorkflowsTabProps) {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                <div>
                    <h2 className="text-xl md:text-2xl font-bold">{dict.dashboard.tabs.workflows}</h2>
                    <p className="text-muted-foreground text-sm">{lang === 'es' ? 'Monitorea y dispara flujos de scraping directamente.' : 'Monitor and trigger scraping pipelines directly.'}</p>
                </div>
                <Button onClick={triggerWorkflow} disabled={triggering} className="flex items-center gap-2 bg-foreground text-background w-full sm:w-auto justify-center" size="sm">
                    {triggering ? <Clock className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                    {triggering ? (lang === 'es' ? 'Iniciando...' : 'Starting...') : (lang === 'es' ? 'Ejecutar Actualización Manual' : 'Run Manual Update')}
                </Button>
            </div>

            <GlassCard className="p-4 md:p-8">
                <div className="flex items-center gap-2 mb-4 md:mb-6">
                    <Github className="w-5 h-5" />
                    <h3 className="text-base md:text-lg font-bold">Recent Workflow Runs (daily_update.yml)</h3>
                </div>
                {loadingWorkflows ? <div className="py-12 flex justify-center text-muted-foreground">Loading runs...</div> : (
                    <>
                        {/* Mobile */}
                        <div className="block md:hidden space-y-2">
                            {workflowRuns.length === 0 ? <p className="py-8 text-center text-muted-foreground text-sm">No recent runs found.</p>
                                : workflowRuns.map(run => (
                                    <div key={run.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                                        <div className="min-w-0">
                                            <div className="font-mono text-[10px] text-muted-foreground truncate">#{run.id}</div>
                                            <div className="text-xs font-medium mt-0.5">
                                                {run.conclusion === 'success' && <span className="text-green-500">✓ Success</span>}
                                                {run.conclusion === 'failure' && <span className="text-red-500">✗ Failed</span>}
                                                {!run.conclusion && <span className="text-blue-400 animate-pulse">{run.status}</span>}
                                            </div>
                                            <div className="text-[10px] text-muted-foreground">{run.created_at ? new Date(run.created_at).toLocaleString() : ''}</div>
                                        </div>
                                        {run.html_url && <a href={run.html_url} target="_blank" rel="noopener noreferrer" className="ml-3 shrink-0 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"><Github className="w-4 h-4" /></a>}
                                    </div>
                                ))}
                        </div>
                        {/* Desktop */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="text-xs uppercase text-muted-foreground border-b border-border/10">
                                    <tr><th className="pb-4 pl-4">ID</th><th className="pb-4">Status</th><th className="pb-4">Conclusion</th><th className="pb-4">Started At</th><th className="pb-4 text-right pr-4">Link</th></tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {workflowRuns.length === 0 ? <tr><td colSpan={5} className="py-8 text-center text-muted-foreground">No recent runs found.</td></tr>
                                        : workflowRuns.map(run => (
                                            <tr key={run.id} className="hover:bg-muted/5 transition-colors">
                                                <td className="py-4 pl-4 font-mono text-xs">{run.id}</td>
                                                <td className="py-4"><span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${run.status === 'completed' ? 'bg-muted text-muted-foreground' : 'bg-blue-500/10 text-blue-500 animate-pulse'}`}>{run.status}</span></td>
                                                <td className="py-4">
                                                    {run.conclusion === 'success' && <span className="text-green-500 flex items-center gap-1"><CheckCircle className="w-3 h-3" />Success</span>}
                                                    {run.conclusion === 'failure' && <span className="text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />Failed</span>}
                                                    {!run.conclusion && <span className="text-muted-foreground">-</span>}
                                                </td>
                                                <td className="py-4 text-sm text-muted-foreground">{new Date(run.created_at).toLocaleString()}</td>
                                                <td className="py-4 text-right pr-4"><a href={run.html_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm">View Logs</a></td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </GlassCard>
        </div>
    );
}
