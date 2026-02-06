import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hoverEffect?: boolean;
}

export function GlassCard({ children, className, hoverEffect = true }: GlassCardProps) {
  return (
    <div
      className={cn(
        "glass-card p-6 md:p-8 border border-black/5 dark:border-white/10",
        hoverEffect && "hover:border-primary/30 dark:hover:border-primary/30",
        className
      )}
    >
      {children}
    </div>
  );
}
