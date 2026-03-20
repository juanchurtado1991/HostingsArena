import { TOGGLE_CARD_CLASS } from "../constants";
import { TabProps } from "../types";
import { cn } from "@/lib/utils";

export function FeaturesTab({ formData, handleChange, type }: TabProps) {
    return (
        <div className="grid grid-cols-2 gap-4">
            {type === 'hosting' ? (
                <>
                    {[
                        { id: 'free_ssl', label: 'Free SSL Certificate' },
                        { id: 'free_domain', label: 'Free Domain Name' },
                        { id: 'backup_included', label: 'Backups Included' },
                        { id: 'wordpress_optimized', label: 'WordPress Optimized' },
                        { id: 'free_migration', label: 'Free Migration' },
                    ].map(f => (
                        <div 
                            key={f.id} 
                            className={cn(TOGGLE_CARD_CLASS, formData[f.id] && "bg-primary/5 border-primary/20")}
                            onClick={() => handleChange(f.id, !formData[f.id])}
                        >
                            <span className="text-sm font-bold">{f.label}</span>
                            <div className={cn(
                                "w-10 h-5 rounded-full transition-all relative",
                                formData[f.id] ? "bg-primary" : "bg-gray-200"
                            )}>
                                <div className={cn(
                                    "absolute top-1 w-3 h-3 rounded-full bg-white transition-all",
                                    formData[f.id] ? "left-6" : "left-1"
                                )} />
                            </div>
                        </div>
                    ))}
                </>
            ) : (
                <>
                    {[
                        { id: 'has_kill_switch', label: 'Automatic Kill Switch' },
                        { id: 'dns_leak_protection', label: 'DNS Leak Protection' },
                        { id: 'ipv6_leak_protection', label: 'IPv6 Leak Protection' },
                        { id: 'streaming_support', label: 'Streaming Support (Netflix/etc)' },
                    ].map(f => (
                        <div 
                            key={f.id} 
                            className={cn(TOGGLE_CARD_CLASS, formData[f.id] && "bg-blue-500/5 border-blue-500/20")}
                            onClick={() => handleChange(f.id, !formData[f.id])}
                        >
                            <span className="text-sm font-bold">{f.label}</span>
                            <div className={cn(
                                "w-10 h-5 rounded-full transition-all relative",
                                formData[f.id] ? "bg-blue-500" : "bg-gray-200"
                            )}>
                                <div className={cn(
                                    "absolute top-1 w-3 h-3 rounded-full bg-white transition-all",
                                    formData[f.id] ? "left-6" : "left-1"
                                )} />
                            </div>
                        </div>
                    ))}
                </>
            )}
        </div>
    );
}
