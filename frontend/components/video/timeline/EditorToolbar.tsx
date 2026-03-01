import { memo } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Scissors, Split, Trash, Image as ImageIcon, Sparkles, Layers, ListFilter, ArrowLeft, ArrowRight, Undo2, Redo2 } from 'lucide-react';

interface EditorToolbarProps {
    selectedBlockId?: string | null;
    onSplit?: () => void;
    onDelete?: () => void;
    onReplaceMedia?: () => void;
    onEditProperties?: () => void;
    onMoveLeft?: () => void;
    onMoveRight?: () => void;
    onUndo?: () => void;
    onRedo?: () => void;
    canUndo?: boolean;
    canRedo?: boolean;
    className?: string;
}

export const EditorToolbar = memo(({
    selectedBlockId,
    onSplit,
    onDelete,
    onReplaceMedia,
    onEditProperties,
    onMoveLeft,
    onMoveRight,
    onUndo,
    onRedo,
    canUndo,
    canRedo,
    className
}: EditorToolbarProps) => {

    const disabled = !selectedBlockId;

    return (
        <div className={cn("flex items-center gap-1.5 p-1.5 bg-background/95 backdrop-blur-md rounded-xl border border-border/50 shadow-xl", className)}>
            <div className="flex items-center gap-1 pl-1 pr-2 border-r border-border/50">
                <Button 
                    variant="ghost" size="sm" 
                    className="h-8 w-8 p-0 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors" 
                    disabled={!canUndo} 
                    onClick={onUndo}
                >
                    <Undo2 className="w-4 h-4" />
                </Button>
                <Button 
                    variant="ghost" size="sm" 
                    className="h-8 w-8 p-0 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors" 
                    disabled={!canRedo} 
                    onClick={onRedo}
                >
                    <Redo2 className="w-4 h-4" />
                </Button>
            </div>

            <div className="flex items-center gap-1 pl-1 pr-2 border-r border-border/50">
                <Button variant="ghost" size="sm" className="h-8 pr-3 rounded-lg text-[9px] font-bold uppercase tracking-tight text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors gap-1.5" disabled={disabled} onClick={onMoveLeft}>
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Mover Atrás
                </Button>
                <Button variant="ghost" size="sm" className="h-8 pl-3 rounded-lg text-[9px] font-bold uppercase tracking-tight text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors gap-1.5" disabled={disabled} onClick={onMoveRight}>
                    Mover Adelante
                    <ArrowRight className="w-3.5 h-3.5" />
                </Button>
            </div>

            <div className="flex items-center gap-1 pl-1 pr-2 border-r border-border/50">
                <Button variant="ghost" size="sm" className="h-8 px-3 rounded-lg text-[9px] font-bold uppercase tracking-tight text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors gap-1.5" disabled={disabled} onClick={onSplit}>
                    <Split className="w-3.5 h-3.5" />
                    Dividir
                </Button>
                <Button variant="ghost" size="sm" className="h-8 px-3 rounded-lg text-[9px] font-bold uppercase tracking-tight text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors gap-1.5" disabled={disabled} onClick={onDelete}>
                    <Trash className="w-3.5 h-3.5" />
                    Eliminar
                </Button>
            </div>

            <div className="flex items-center gap-1 pl-1">
                <Button variant="ghost" size="sm" className="h-8 px-3 rounded-lg text-[9px] font-bold uppercase tracking-tight text-muted-foreground hover:text-blue-400 hover:bg-blue-400/10 transition-colors gap-1.5" disabled={disabled} onClick={onReplaceMedia}>
                    <ImageIcon className="w-3.5 h-3.5" />
                    Cambiar Media
                </Button>
                
                <Button variant="ghost" size="sm" className="h-8 px-3 rounded-lg text-[9px] font-bold uppercase tracking-tight text-muted-foreground hover:text-amber-400 hover:bg-amber-400/10 transition-colors gap-1.5" disabled={disabled} onClick={onEditProperties}>
                    <Sparkles className="w-3.5 h-3.5" />
                    Ajustes FX
                </Button>
            </div>
            
            <div className="flex-1 flex justify-end px-3">
                <div className="flex flex-col items-end">
                    <span className="text-[8px] font-black text-primary/40 uppercase tracking-[0.2em]">
                        {selectedBlockId ? 'Clip Seleccionado' : 'Sin Selección'}
                    </span>
                    <span className="text-[10px] font-bold text-muted-foreground max-w-[120px] truncate">
                        {selectedBlockId || 'Selecciona un clip'}
                    </span>
                </div>
            </div>
        </div>
    );
});
EditorToolbar.displayName = 'EditorToolbar';
