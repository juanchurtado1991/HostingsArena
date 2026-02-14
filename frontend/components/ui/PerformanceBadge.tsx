"use client";

import { cn } from "@/lib/utils";

interface PerformanceBadgeProps {
    grade: string;
    className?: string;
    size?: "sm" | "md" | "lg";
}

export function PerformanceBadge({ grade, className, size = "md" }: PerformanceBadgeProps) {
    const normalizedGrade = grade.toUpperCase();

    const getGradeStyles = () => {
        if (normalizedGrade.startsWith("A")) return "from-green-500/20 to-emerald-500/20 text-green-500 border-green-500/20 shadow-green-500/10";
        if (normalizedGrade.startsWith("B")) return "from-blue-500/20 to-indigo-500/20 text-blue-500 border-blue-500/20 shadow-blue-500/10";
        if (normalizedGrade.startsWith("C")) return "from-yellow-500/20 to-orange-500/20 text-yellow-500 border-yellow-500/20 shadow-yellow-500/10";
        return "from-red-500/20 to-rose-500/20 text-red-500 border-red-500/20 shadow-red-500/10";
    };

    const sizes = {
        sm: "w-8 h-8 text-xs",
        md: "w-12 h-12 text-lg",
        lg: "w-20 h-20 text-3xl"
    };

    return (
        <div className={cn(
            "relative flex items-center justify-center rounded-2xl border backdrop-blur-md bg-gradient-to-br font-bold shadow-lg",
            getGradeStyles(),
            sizes[size],
            className
        )}>
            {/* Decorative Glow */}
            <div className="absolute inset-0 rounded-2xl bg-current opacity-5 blur-xl -z-10" />
            {normalizedGrade}
        </div>
    );
}
