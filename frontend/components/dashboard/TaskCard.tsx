"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/button";
import {
    AlertTriangle,
    Link as LinkIcon,
    Server,
    FileText,
    Bell,
    Clock,
    CheckCircle,
    ArrowRight
} from "lucide-react";
import { AdminTask, TaskPriority, TaskType } from "@/lib/tasks/types";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface TaskCardProps {
    task: AdminTask;
    onResolve: (task: AdminTask) => void;
    onDismiss: (taskId: string) => void;
}

const priorityConfig: Record<TaskPriority, { color: string; bg: string; label: string }> = {
    critical: { color: "text-red-500", bg: "bg-red-500/10", label: "🔥 Crítico" },
    high: { color: "text-orange-500", bg: "bg-orange-500/10", label: "⚠️ Alto" },
    normal: { color: "text-blue-500", bg: "bg-blue-500/10", label: "📝 Normal" },
    low: { color: "text-gray-500", bg: "bg-gray-500/10", label: "💤 Bajo" },
};

const typeConfig: Record<TaskType, { icon: React.ElementType; label: string }> = {
    affiliate_audit: { icon: LinkIcon, label: "Link Faltante" },
    scraper_fix: { icon: Server, label: "Scraper Error" },
    content_review: { icon: FileText, label: "Revisar Contenido" },
    system_alert: { icon: Bell, label: "Alerta Sistema" },
    seo_opportunity: { icon: ArrowRight, label: "Oportunidad SEO" },
    social_post: { icon: FileText, label: "Post Social" },
    content_update: { icon: FileText, label: "Actualizar Contenido" },
};

export function TaskCard({ task, onResolve, onDismiss }: TaskCardProps) {
    const priority = priorityConfig[task.priority];
    const type = typeConfig[task.task_type] || { icon: Bell, label: task.task_type };
    const Icon = type.icon;

    const timeAgo = task.created_at
        ? formatDistanceToNow(new Date(task.created_at), { addSuffix: true, locale: es })
        : "";

    return (
        <GlassCard className={`p-4 border-l-4 ${priority.bg} border-l-current ${priority.color}`}>
            <div className="flex items-start justify-between gap-4">
                {/* Icon & Content */}
                <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className={`p-2 rounded-lg ${priority.bg} flex-shrink-0`}>
                        <Icon className={`w-4 h-4 ${priority.color}`} />
                    </div>

                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${priority.bg} ${priority.color}`}>
                                {priority.label}
                            </span>
                            <span className="text-xs text-muted-foreground">{type.label}</span>
                        </div>

                        <h4 className="font-medium text-sm truncate mb-1">{task.title}</h4>

                        {task.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2">{task.description}</p>
                        )}

                        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            <span>{timeAgo}</span>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 flex-shrink-0">
                    <Button
                        size="sm"
                        onClick={() => onResolve(task)}
                        className="text-xs"
                    >
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Resolver
                    </Button>
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onDismiss(task.id!)}
                        className="text-xs text-muted-foreground"
                    >
                        Ignorar
                    </Button>
                </div>
            </div>
        </GlassCard>
    );
}
