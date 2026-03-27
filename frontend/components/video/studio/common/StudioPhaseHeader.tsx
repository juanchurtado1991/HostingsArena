import React, { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StudioPhaseHeaderProps {
    icon: LucideIcon;
    title: string;
    subtitle: string;
    action?: ReactNode;
    className?: string;
}

export function StudioPhaseHeader({ 
    icon: Icon, 
    title, 
    subtitle, 
    action,
    className 
}: StudioPhaseHeaderProps) {
    return (
        <div className={cn("flex items-center justify-between border-b border-black/5 pb-8 relative z-10", className)}>
            <div className="flex items-center gap-4">
                <div className="p-3 bg-studio-accent/10 rounded-2xl text-studio-accent border border-studio-accent/20 shadow-[0_0_15px_rgba(0,122,255,0.1)]">
                    <Icon className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="text-2xl font-bold tracking-tight text-zinc-900">{title}</h3>
                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-1">{subtitle}</p>
                </div>
            </div>
            {action && (
                <div>
                    {action}
                </div>
            )}
        </div>
    );
}
