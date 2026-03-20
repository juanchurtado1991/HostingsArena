import { memo } from 'react';
import { cn } from '../../../lib/utils';
import { LucideIcon } from 'lucide-react';

interface TrackLayerProps {
    title?: string;
    icon?: LucideIcon;
    colorClass?: string;
    className?: string;
    onAddClick?: () => void;
    children?: React.ReactNode;
}

export const TrackLayer = memo(({ 
    title, 
    icon: Icon, 
    colorClass = "text-muted-foreground bg-muted/10", 
    className, 
    onAddClick,
    children 
}: TrackLayerProps) => {
    return (
        <div className={cn("relative w-full h-16 border-b border-border/10 bg-muted/5 group-hover:bg-muted/10 transition-colors flex items-center", className)}>
            <div className="flex-1 h-full relative">
                {children}
            </div>
        </div>
    );
});
TrackLayer.displayName = 'TrackLayer';
