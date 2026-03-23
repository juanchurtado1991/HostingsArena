import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { HardDrive, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface HostingPlansProps {
    allPlans: any[];
    provider: any;
}

export function HostingPlans({ allPlans, provider }: HostingPlansProps) {
    if (!allPlans || allPlans.length <= 1) return null;

    return (
        <section className="space-y-6">
            <h3 className="text-2xl font-bold tracking-tight">Available Tiers</h3>
            <div className="grid grid-cols-1 gap-4">
                {allPlans.map((plan: any) => (
                    <div key={plan.id} className={cn(
                        "p-6 rounded-3xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-6",
                        plan.id === provider.id
                            ? "bg-primary/5 border-primary/30 shadow-lg shadow-primary/5 ring-1 ring-primary/20"
                            : "bg-card border-border/50 hover:bg-secondary/10"
                    )}>
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2 mb-1">
                                <h4 className="text-xl font-black tracking-tight">{plan.plan_name}</h4>
                                {plan.id === provider.id && <Badge className="bg-primary text-primary-foreground text-[10px] uppercase font-black px-2">Current Selection</Badge>}
                            </div>
                            <div className="text-sm text-muted-foreground flex items-center gap-4">
                                <span className="flex items-center gap-1"><HardDrive className="w-3.5 h-3.5" /> {plan.storage_gb}GB</span>
                                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> 99.9% Uptime</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-8 justify-between md:justify-end">
                            <div className="text-right">
                                <div className="text-2xl font-black text-foreground">${plan.pricing_monthly}</div>
                                <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest italic">Renews at ${plan.renewal_price || plan.pricing_monthly}</div>
                            </div>
                            <Button
                                variant={plan.id === provider.id ? "default" : "outline"}
                                className="rounded-full font-bold px-8"
                                asChild
                            >
                                <Link href={`?plan=${plan.id}`} scroll={false}>
                                    {plan.id === provider.id ? "Selected" : "Select"}
                                </Link>
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
