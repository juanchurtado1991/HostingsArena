"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { formatCurrency } from "@/lib/utils";
import { Activity, Server, DollarSign, Users, AlertCircle, CheckCircle, Link as LinkIcon, Plus, Play, Clock, Github } from "lucide-react";
import { useState, useEffect } from "react";
import { AFFILIATE_LINKS } from "@/lib/affiliates";
import { Button } from "@/components/ui/button";
import { toast } from "sonner"; // Assuming sonner or toast is available, or use alert

export default function DashboardPage() {
    const [activeTab, setActiveTab] = useState("overview");
    const [workflowRuns, setWorkflowRuns] = useState<any[]>([]);
    const [loadingWorkflows, setLoadingWorkflows] = useState(false);
    const [triggering, setTriggering] = useState(false);

    useEffect(() => {
        if (activeTab === "workflows") {
            fetchWorkflows();
        }
    }, [activeTab]);

    const fetchWorkflows = async () => {
        setLoadingWorkflows(true);
        try {
            const res = await fetch('/api/github/workflow');
            const data = await res.json();
            if (data.runs) setWorkflowRuns(data.runs);
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingWorkflows(false);
        }
    };

    const triggerWorkflow = async () => {
        setTriggering(true);
        try {
            const res = await fetch('/api/github/workflow', { method: 'POST' });
            if (res.ok) {
                alert("Workflow triggered! It may take a few seconds to appear in the list.");
                setTimeout(fetchWorkflows, 3000); // Refresh after 3s
            } else {
                const err = await res.json();
                alert("Error triggering workflow: " + err.error);
            }
        } catch (e) {
            alert("Failed to trigger workflow");
        } finally {
            setTriggering(false);
        }
    };

    return (
        <div className="min-h-screen pt-24 pb-12 px-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-12">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight">System Status</h1>
                        <p className="text-muted-foreground mt-2">Live monitoring of the HostingArena ecosystem.</p>
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={() => setActiveTab("overview")}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeTab === "overview" ? "bg-primary text-white" : "bg-white/5 hover:bg-white/10"}`}
                        >
                            Overview
                        </button>
                        <button
                            onClick={() => setActiveTab("affiliates")}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeTab === "affiliates" ? "bg-primary text-white" : "bg-white/5 hover:bg-white/10"}`}
                        >
                            Affiliate Manager
                        </button>
                        <button
                            onClick={() => setActiveTab("workflows")}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeTab === "workflows" ? "bg-primary text-white" : "bg-white/5 hover:bg-white/10"}`}
                        >
                            Scraper Workflows
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
                                    <span className="text-xs font-medium text-green-500">+12%</span>
                                </div>
                                <div className="text-3xl font-bold mb-1">120</div>
                                <div className="text-sm text-muted-foreground">Active Providers</div>
                            </GlassCard>

                            <GlassCard className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-purple-500/10 rounded-xl text-purple-500">
                                        <Activity className="w-6 h-6" />
                                    </div>
                                    <span className="text-xs font-medium text-green-500">99.8%</span>
                                </div>
                                <div className="text-3xl font-bold mb-1">2.4s</div>
                                <div className="text-sm text-muted-foreground">Avg. Scrape Time</div>
                            </GlassCard>

                            <GlassCard className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-green-500/10 rounded-xl text-green-500">
                                        <DollarSign className="w-6 h-6" />
                                    </div>
                                    <span className="text-xs font-medium text-green-500">+5%</span>
                                </div>
                                <div className="text-3xl font-bold mb-1">$4,250</div>
                                <div className="text-sm text-muted-foreground">Proj. Revenue</div>
                            </GlassCard>
                        </div>

                        {/* Status Table */}
                        <GlassCard className="p-8">
                            <h3 className="text-xl font-bold mb-6">Recent Scraper Activity</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="text-xs uppercase text-muted-foreground border-b border-white/10">
                                        <tr>
                                            <th className="pb-4 pl-4">Provider</th>
                                            <th className="pb-4">Type</th>
                                            <th className="pb-4">Status</th>
                                            <th className="pb-4">Last Price</th>
                                            <th className="pb-4">Last Update</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {[
                                            { name: "NordVPN", type: "VPN", status: "success", price: 3.09, time: "2 mins ago" },
                                            { name: "Bluehost", type: "Hosting", status: "success", price: 2.95, time: "5 mins ago" },
                                            { name: "ExpressVPN", type: "VPN", status: "success", price: 6.67, time: "12 mins ago" },
                                            { name: "SiteGround", type: "Hosting", status: "warning", price: 2.99, time: "1 hour ago" },
                                            { name: "Surfshark", type: "VPN", status: "success", price: 2.19, time: "2 hours ago" },
                                        ].map((item) => (
                                            <tr key={item.name} className="hover:bg-white/5 transition-colors">
                                                <td className="py-4 pl-4 font-medium">{item.name}</td>
                                                <td className="py-4 text-muted-foreground">{item.type}</td>
                                                <td className="py-4">
                                                    {item.status === "success" ? (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-500">
                                                            <CheckCircle className="w-3 h-3" /> Online
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-500">
                                                            <AlertCircle className="w-3 h-3" /> Retrying
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-4 font-mono">{formatCurrency(item.price)}</td>
                                                <td className="py-4 text-muted-foreground text-sm">{item.time}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </GlassCard>
                    </>
                )}

                {activeTab === "affiliates" && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold">Affiliate Links Registry</h2>
                            <button className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-full font-medium hover:bg-primary/90">
                                <Plus className="w-4 h-4" /> Add New Link
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {Object.entries(AFFILIATE_LINKS).map(([name, link]) => (
                                <GlassCard key={name} className="p-6 flex flex-col justify-between group">
                                    <div>
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="text-lg font-bold">{name}</h3>
                                            <div className="p-2 bg-white/5 rounded-full group-hover:bg-primary/20 transition-colors">
                                                <LinkIcon className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                                            </div>
                                        </div>
                                        <div className="bg-black/20 rounded-md p-3 mb-4">
                                            <code className="text-xs text-muted-foreground break-all font-mono">{link}</code>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="flex-1 py-2 rounded-lg bg-white/5 text-xs font-medium hover:bg-white/10">Edit</button>
                                        <button className="flex-1 py-2 rounded-lg bg-white/5 text-xs font-medium hover:bg-white/10">Test Link</button>
                                    </div>
                                </GlassCard>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === "workflows" && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-bold">GitHub Actions Workflows</h2>
                                <p className="text-muted-foreground">Monitor and trigger scraping pipelines directly.</p>
                            </div>

                            <Button
                                onClick={triggerWorkflow}
                                disabled={triggering}
                                className="flex items-center gap-2 bg-foreground text-background"
                            >
                                {triggering ? <Clock className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                                {triggering ? "Starting..." : "Run Manual Update"}
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

            </div>
        </div>
    );
}
