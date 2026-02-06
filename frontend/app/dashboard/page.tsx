"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { formatCurrency } from "@/lib/utils";
import { Activity, Server, DollarSign, Users, AlertCircle, CheckCircle, Link as LinkIcon, Plus } from "lucide-react";
import { useState } from "react";
import { AFFILIATE_LINKS } from "@/lib/affiliates";

export default function DashboardPage() {
    const [activeTab, setActiveTab] = useState("overview");

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
                    </div>
                </div>

                {activeTab === "overview" ? (
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
            ) : (
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
            </div>
        </div>
    );
}
