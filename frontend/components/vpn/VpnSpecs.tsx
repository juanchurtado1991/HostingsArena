import { Zap, Database, Monitor, Smartphone, CheckCircle2 } from "lucide-react";

interface VpnSpecsProps {
    provider: any;
}

export function VpnSpecs({ provider }: VpnSpecsProps) {
    return (
        <section className="space-y-6">
            <h3 className="text-2xl font-bold tracking-tight">Performance Benchmarks</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-6 rounded-2xl bg-secondary/30 border border-border/50 flex justify-between items-center group hover:border-blue-500/30 transition-colors">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                            <Zap size={20} />
                        </div>
                        <span className="font-medium">Avg. Speed</span>
                    </div>
                    <span className="font-bold text-lg">
                        {provider.avg_speed_mbps && provider.avg_speed_mbps > 0 ? `${provider.avg_speed_mbps} Mbps` : 'High Traffic'}
                    </span>
                </div>
                <div className="p-6 rounded-2xl bg-secondary/30 border border-border/50 flex justify-between items-center group hover:border-blue-500/30 transition-colors">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-500 group-hover:scale-110 transition-transform">
                            <Database size={20} />
                        </div>
                        <span className="font-medium">Server Network</span>
                    </div>
                    <span className="font-bold text-lg">
                        {provider.server_count && provider.server_count > 0 ? `${provider.server_count.toLocaleString()} Nodes` : 'Global Grid'}
                    </span>
                </div>
                <div className="p-6 rounded-2xl bg-secondary/30 border border-border/50 flex justify-between items-center group hover:border-blue-500/30 transition-colors">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform">
                            <Monitor size={20} />
                        </div>
                        <span className="font-medium">Streaming</span>
                    </div>
                    <span className="font-bold text-lg text-green-500 flex items-center gap-1.5">
                        <CheckCircle2 size={18} /> Optimized
                    </span>
                </div>
                <div className="p-6 rounded-2xl bg-secondary/30 border border-border/50 flex justify-between items-center group hover:border-blue-500/30 transition-colors">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                            <Smartphone size={20} />
                        </div>
                        <span className="font-medium">Device Limit</span>
                    </div>
                    <span className="font-bold text-lg">
                        {provider.simultaneous_connections && provider.simultaneous_connections > 0
                            ? (provider.simultaneous_connections === 999 ? 'Unlimited' : `${provider.simultaneous_connections} Devices`)
                            : 'Multiple Devices'}
                    </span>
                </div>
            </div>
        </section>
    );
}
