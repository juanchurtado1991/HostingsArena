import { memo } from 'react';
import { cn } from '../../../lib/utils';
import { LucideIcon, Trash, Video, Music } from 'lucide-react';

interface TrackHeaderProps {
    title: string;
    icon?: LucideIcon;
    colorClass?: string;
    onAddMedia?: () => void;
    onAddAudio?: () => void;
    onDeleteClick?: () => void;
    className?: string;
}

export const TrackHeader = memo(({ 
    title, 
    icon: Icon, 
    colorClass = "text-muted-foreground bg-muted/10", 
    onAddMedia,
    onAddAudio,
    onDeleteClick,
    className 
}: TrackHeaderProps) => {
    return (
        <div className={cn(
            "w-28 h-16 shrink-0 bg-white border-r border-b border-black/5 flex flex-col items-center justify-center gap-1 shadow-[2px_0_8px_rgba(0,0,0,0.02)] z-40 transition-colors",
            className
        )}>
            {Icon && <Icon className={cn("w-4 h-4 mt-1", colorClass)} />}
            <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest text-center px-1">
                {title}
            </span>
            <div className="flex gap-1 mt-0.5 mb-1.5">
                {onAddMedia && (
                    <button 
                        onClick={(e) => { e.stopPropagation(); onAddMedia(); }}
                        className="w-6 h-6 rounded-lg bg-black/5 hover:bg-studio-accent/10 flex items-center justify-center text-zinc-400 hover:text-studio-accent transition-all border border-black/5 hover:border-studio-accent/10 group"
                        title="Agregar Media"
                    >
                        <Video className="w-3 h-3" />
                    </button>
                )}
                {onAddAudio && (
                    <button 
                        onClick={(e) => { e.stopPropagation(); onAddAudio(); }}
                        className="w-6 h-6 rounded-lg bg-black/5 hover:bg-indigo-50 flex items-center justify-center text-zinc-400 hover:text-indigo-600 transition-all border border-black/5 hover:border-indigo-100 group"
                        title="Agregar Audio"
                    >
                        <Music className="w-3 h-3" />
                    </button>
                )}
                {onDeleteClick && (
                    <button 
                        onClick={(e) => { e.stopPropagation(); onDeleteClick(); }}
                        className="w-6 h-6 rounded-lg bg-black/5 hover:bg-red-50 flex items-center justify-center text-zinc-400 hover:text-red-500 transition-all border border-black/5 hover:border-red-100 group"
                        title="Eliminar Capa"
                    >
                        <Trash className="w-3 h-3 opacity-80 group-hover:opacity-100" />
                    </button>
                )}
            </div>
        </div>
    );
});

TrackHeader.displayName = 'TrackHeader';
