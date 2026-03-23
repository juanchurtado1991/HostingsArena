import { HardDrive, Globe, Layout, Zap, Clock, RefreshCw, Database, Cpu } from "lucide-react";

interface HostingSpecsProps {
    provider: any;
}

export function HostingSpecs({ provider }: HostingSpecsProps) {
    return (
        <section className="space-y-6">
            <h3 className="text-2xl font-bold tracking-tight">Technical Specifications</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-6 rounded-2xl bg-secondary/30 border border-border/50 flex justify-between items-center group hover:border-primary/30 transition-colors">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                            <HardDrive size={20} />
                        </div>
                        <span className="font-medium">Storage</span>
                    </div>
                    <span className="font-bold text-lg">{provider.storage_gb ? `${provider.storage_gb} GB SSD` : 'Unl. SSD'}</span>
                </div>
                <div className="p-6 rounded-2xl bg-secondary/30 border border-border/50 flex justify-between items-center group hover:border-primary/30 transition-colors">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                            <Globe size={20} />
                        </div>
                        <span className="font-medium">Bandwidth</span>
                    </div>
                    <span className="font-bold text-lg">{provider.bandwidth || 'Unmetered'}</span>
                </div>
                <div className="p-6 rounded-2xl bg-secondary/30 border border-border/50 flex justify-between items-center group hover:border-primary/30 transition-colors">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500 group-hover:scale-110 transition-transform">
                            <Layout size={20} />
                        </div>
                        <span className="font-medium">Control Panel</span>
                    </div>
                    <span className="font-bold text-lg">{provider.control_panel || 'Custom/cPanel'}</span>
                </div>
                <div className="p-6 rounded-2xl bg-secondary/30 border border-border/50 flex justify-between items-center group hover:border-primary/30 transition-colors">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform">
                            <Zap size={20} />
                        </div>
                        <span className="font-medium">Technology</span>
                    </div>
                    <span className="font-bold text-lg">{provider.web_server || 'Litespeed/NGINX'}</span>
                </div>
                <div className="p-6 rounded-2xl bg-secondary/30 border border-border/50 flex justify-between items-center group hover:border-primary/30 transition-colors">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500 group-hover:scale-110 transition-transform">
                            <Clock size={20} />
                        </div>
                        <span className="font-medium">Backups</span>
                    </div>
                    <span className="font-bold text-lg">{provider.backup_included ? 'Included' : 'Paid Add-on'}</span>
                </div>
                <div className="p-6 rounded-2xl bg-secondary/30 border border-border/50 flex justify-between items-center group hover:border-primary/30 transition-colors">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-500 group-hover:scale-110 transition-transform">
                            <RefreshCw size={20} />
                        </div>
                        <span className="font-medium">Migrations</span>
                    </div>
                    <span className="font-bold text-lg">{provider.free_migration ? 'Free' : 'Paid Service'}</span>
                </div>
                <div className="p-6 rounded-2xl bg-secondary/30 border border-border/50 flex justify-between items-center group hover:border-primary/30 transition-colors">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform">
                            <Database size={20} />
                        </div>
                        <span className="font-medium">Databases</span>
                    </div>
                    <span className="font-bold text-lg">{provider.databases_allowed || 'Unlimited'}</span>
                </div>
                <div className="p-6 rounded-2xl bg-secondary/30 border border-border/50 flex justify-between items-center group hover:border-primary/30 transition-colors">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-500 group-hover:scale-110 transition-transform">
                            <Cpu size={20} />
                        </div>
                        <span className="font-medium">Websites</span>
                    </div>
                    <span className="font-bold text-lg">{provider.websites_allowed || 'Unlimited'}</span>
                </div>
            </div>
        </section>
    );
}
