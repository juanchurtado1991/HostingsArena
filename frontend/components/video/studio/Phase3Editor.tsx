import React, { useState, useMemo, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useStudioStore } from '@/store/useStudioStore';
import { useVideoStudio } from '@/contexts/VideoStudioContext';
import { Clip, Layer } from '@/types/studio';
import { TimelineContainer } from '@/components/video/timeline/TimelineContainer';
import { TrackLayer } from '@/components/video/timeline/TrackLayer';
import { MediaBlock } from '@/components/video/timeline/MediaBlock';
import { GlassCard } from '@/components/ui/GlassCard';
import { MediaPicker } from '@/components/video/MediaPicker';
import { AudioPicker } from '@/components/video/AudioPicker';
import { Button } from '@/components/ui/button';
import { Sliders, Clock, Sparkles, Image as ImageIcon, Trash, ChevronRight, Maximize2, Layers, Music, Mic, Film, Play, Pause, SkipBack, SkipForward } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TrackHeader } from '@/components/video/timeline/TrackHeader';
import { CanvasEditor } from '@/components/video/studio/CanvasEditor';
import { SyncEngine } from '@/lib/video-sync/SyncEngine';

const VideoPlayer = dynamic(() => import('@/components/video/VideoPlayer').then(mod => mod.VideoPlayer), { ssr: false });

const STORAGE_KEY = 'hostingarena_editor_draft';

export function Phase3Editor() {
    // Atomic Store Selectors (Prevents re-renders for other state changes)
    const layers = useStudioStore(s => s.layers);
    const scenes = useStudioStore(s => s.scenes);
    const title = useStudioStore(s => s.title);
    const format = useStudioStore(s => s.format);
    const durationInFrames = useStudioStore(s => s.durationInFrames);
    const currentTime = useStudioStore(s => s.currentTime);
    const isPlayingPreview = useStudioStore(s => s.isPlayingPreview);
    const selectedClipId = useStudioStore(s => s.selectedClipId);
    const voiceSpeed = useStudioStore(s => s.voiceSpeed);

    // Actions
    const setLayers = useStudioStore(s => s.setLayers);
    const setScenes = useStudioStore(s => s.setScenes);
    const setTitle = useStudioStore(s => s.setTitle);
    const setFormat = useStudioStore(s => s.setFormat);
    const setDurationInFramesStore = useStudioStore(s => s.setDurationInFrames);
    const pushToHistory = useStudioStore(s => s.pushToHistory);

    const updateClip = useStudioStore(s => s.updateClip);
    const setSelectedClipId = useStudioStore(s => s.setSelectedClipId);
    const setCurrentTime = useStudioStore(s => s.setCurrentTime);
    const setIsPlayingPreview = useStudioStore(s => s.setIsPlayingPreview);
    
    const undo = useStudioStore(s => s.undo);
    const redo = useStudioStore(s => s.redo);
    const historyIndex = useStudioStore(s => s.historyIndex);
    const history = useStudioStore(s => s.history);

    const { 
        layers: ctxLayers, 
        scenes: ctxScenes, 
        title: ctxTitle, 
        format: ctxFormat, 
        durationInFrames: ctxDuration,
        setLayers: setCtxLayers,
        setScenes: setCtxScenes,
    } = useVideoStudio();

    // Auto-Save Status
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // 1. Initial Load from LocalStorage
    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                const data = JSON.parse(saved);
                if (data.layers?.length > 0) {
                    setLayers(data.layers);
                    setScenes(data.scenes || []);
                    setTitle(data.title || "");
                    setFormat(data.format || "9:16");
                    setDurationInFramesStore(data.durationInFrames || 1800);
                    setLastSaved(new Date(data.timestamp));
                }
            } catch (e) {
                console.error("Failed to load draft:", e);
            }
        }
    }, [setLayers, setScenes, setTitle, setFormat, setDurationInFramesStore]);

    // 2. Hydration Fallback from Context (if no localStorage layers)
    useEffect(() => {
        // Check if localStorage has any useful layers
        const saved = localStorage.getItem(STORAGE_KEY);
        let storedLayersCount = 0;
        if (saved) {
            try {
                const data = JSON.parse(saved);
                storedLayersCount = data.layers?.length ?? 0;
            } catch (_) {}
        }
        
        // Always hydrate from context if store is empty AND context has data,
        // regardless of whether a stale localStorage draft exists.
        if (layers.length === 0 && ctxLayers.length > 0) {
            setLayers(ctxLayers);
            setScenes(ctxScenes);
            setTitle(ctxTitle);
            setFormat(ctxFormat);
            setDurationInFramesStore(ctxDuration);
            pushToHistory();
        }
    }, [layers.length, ctxLayers, ctxScenes, ctxTitle, ctxFormat, ctxDuration, setLayers, setScenes, setTitle, setFormat, setDurationInFramesStore, pushToHistory]);

    // 2b. Always sync durationInFrames from context when it has a real value
    // This fixes the 60s cutoff: context restores the real duration from its own localStorage,
    // but Phase3Editor's localStorage may have loaded the stale default (1800).
    useEffect(() => {
        if (ctxDuration && ctxDuration !== 1800 && ctxDuration !== durationInFrames) {
            setDurationInFramesStore(ctxDuration);
        }
    }, [ctxDuration, durationInFrames, setDurationInFramesStore]);

    // 2c. Sync Zustand layers → Context (fixes SFX persistence across both save paths)
    // When Phase3Editor edits clips (e.g. SFX attach), updateClip only touches Zustand.
    // This effect keeps Context's layers in sync so its auto-save also captures SFX data.
    useEffect(() => {
        if (layers.length > 0) {
            setCtxLayers(layers);
        }
    }, [layers, setCtxLayers]);

    useEffect(() => {
        if (scenes.length > 0) {
            setCtxScenes(scenes as any);
        }
    }, [scenes, setCtxScenes]);

    // 2d. Auto-expand duration if clips exceed current limit
    useEffect(() => {
        if (layers.length === 0) return;
        
        const contentDuration = SyncEngine.getClipsDurationInFrames(layers);
        // Only expand or adjust if significantly different or content exceeds current
        if (contentDuration > durationInFrames) {
            console.log(`[TimelineSync] Expanding duration to match content: ${contentDuration} frames`);
            setDurationInFramesStore(contentDuration);
        }
    }, [layers, durationInFrames, setDurationInFramesStore]);

    // 3. Auto-Save Effect (Debounced + beforeunload support)
    useEffect(() => {
        if (layers.length === 0) return;

        const dataToSave = {
            layers,
            scenes,
            title,
            format,
            durationInFrames,
            timestamp: Date.now()
        };

        const executeSave = () => {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
            setLastSaved(new Date());
            setIsSaving(false);
        };

        const timer = setTimeout(() => {
            setIsSaving(true);
            executeSave();
        }, 1500); // 1.5 second debounce

        const handleBeforeUnload = () => {
             // Synchronous save before page unloads to prevent losing quick edits like slider drags
             localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            clearTimeout(timer);
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [layers, scenes, title, format, durationInFrames]);

    const canUndo = historyIndex > 0;
    const canRedo = historyIndex < history.length - 1;

    // Local UI State
    const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
    const [isAudioPickerOpen, setIsAudioPickerOpen] = useState(false);
    const [addingToTrack, setAddingToTrack] = useState<string | null>(null);
    const [addingToTrackType, setAddingToTrackType] = useState<'media' | 'audio' | null>(null);
    const [showSafeAreas, setShowSafeAreas] = useState(false);

    const [dragState, setDragState] = useState<{
        clipId: string;
        mode: 'move' | 'resize-left' | 'resize-right';
        initialFrame: number;
        initialDur: number;
        initialX: number;
    } | null>(null);

    const pxPerSec = 100;
    const fps = SyncEngine.FPS;

    // Snap Points
    const snapPoints = useMemo(() => {
        const points = new Set<number>();
        points.add(0);
        points.add(durationInFrames);
        layers.forEach(layer => {
            layer.clips.forEach(c => {
                points.add(c.startFrame);
                points.add(c.startFrame + c.durationInFrames);
            });
        });
        return Array.from(points).sort((a, b) => a - b);
    }, [layers, durationInFrames]);

    // Hotkeys
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
                if (e.shiftKey) { if (canRedo) redo(); }
                else { if (canUndo) undo(); }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [undo, redo, canUndo, canRedo]);

    // Drag and Resize Handlers
    useEffect(() => {
        if (!dragState) return;

        const handleMouseMove = (e: MouseEvent) => {
            const deltaX = e.clientX - dragState.initialX;
            const deltaFrames = Math.round((deltaX / pxPerSec) * fps);
            
            if (dragState.mode === 'move') {
                const newStart = Math.max(0, dragState.initialFrame + deltaFrames);
                updateClip(dragState.clipId, { startFrame: newStart });
            } else if (dragState.mode === 'resize-right') {
                const newDur = Math.max(1, dragState.initialDur + deltaFrames);
                updateClip(dragState.clipId, { durationInFrames: newDur });
            } else if (dragState.mode === 'resize-left') {
                const newStart = Math.max(0, dragState.initialFrame + deltaFrames);
                const frameDiff = newStart - dragState.initialFrame;
                const newDur = Math.max(1, dragState.initialDur - frameDiff);
                if (newDur > 1) {
                    updateClip(dragState.clipId, { startFrame: newStart, durationInFrames: newDur });
                }
            }
        };

        const handleMouseUp = () => {
            setDragState(null);
            pushToHistory(); // Finish interaction
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [dragState, updateClip, pushToHistory]);

    const startDrag = (clipId: string, mode: 'move' | 'resize-left' | 'resize-right', e: React.MouseEvent) => {
        const allClips = layers.flatMap(l => l.clips);
        const clip = allClips.find(c => c.id === clipId);
        if (!clip) return;
        
        setDragState({
            clipId,
            mode,
            initialFrame: clip.startFrame,
            initialDur: clip.durationInFrames,
            initialX: e.clientX
        });
        setSelectedClipId(clipId);
    };

    const selectedClip = useMemo(() => {
        if (!selectedClipId) return null;
        const allClips = layers.flatMap(l => l.clips);
        return allClips.find(c => c.id === selectedClipId);
    }, [selectedClipId, layers]);

    const handleDelete = () => {
        if (!selectedClipId) return;
        setLayers(layers.map(l => ({
            ...l,
            clips: l.clips.filter(c => c.id !== selectedClipId)
        })));
        setSelectedClipId(null);
        pushToHistory();
    };

    const handleSplit = () => {
        if (!selectedClipId) return;
        const frame = Math.round(currentTime * fps);
        // ... implementation of split logic moved to actions or handled here
        pushToHistory();
    };

    const handleReplaceAsset = () => {
        if (!selectedClip) return;
        setAddingToTrack(selectedClipId); // Reuse this to indicate we are replacing
        if (selectedClip.type === 'audio' || selectedClip.type === 'music') {
            setAddingToTrackType('audio');
            setIsAudioPickerOpen(true);
        } else {
            setAddingToTrackType('media');
            setIsMediaPickerOpen(true);
        }
    };

    const renderClips = (clips: Clip[], type: 'image' | 'video' | 'audio' | 'music' | 'overlay', layerId: string) => {
        return clips.map(clip => (
            <MediaBlock
                key={clip.id}
                id={clip.id}
                type={type === 'overlay' ? 'overlay' : type === 'image' || type === 'video' ? (clip.type as 'image'|'video') : type}
                url={clip.src}
                label={clip.title || clip.id.split('-').pop()}
                startFrame={clip.startFrame}
                durationInFrames={clip.durationInFrames}
                fps={fps}
                pxPerSec={pxPerSec}
                isSelected={selectedClipId === clip.id}
                onClick={() => setSelectedClipId(clip.id)}
                onMouseDown={(e) => startDrag(clip.id, 'move', e)}
                onResizeStartLeft={(e) => startDrag(clip.id, 'resize-left', e)}
                onResizeStartRight={(e) => startDrag(clip.id, 'resize-right', e)}
            />
        ));
    };

    return (
        <div className="flex flex-col gap-3 h-[calc(100vh-84px)] select-none animate-in fade-in slide-in-from-bottom-8 duration-1000">
            {/* Player + Inspector: flex-1 absorbs all available vertical space */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch flex-1 min-h-0 overflow-hidden">
                {/* Left: Player Area */}
                <div className="lg:col-span-8 flex flex-col min-h-0">
                    <div className="bg-transparent rounded-3xl overflow-hidden border border-black/5 shadow-2xl flex-1 relative group ring-1 ring-black/5 min-h-0">
                        <VideoPlayer 
                            title={title}
                            scenes={scenes}
                            layers={layers}
                            format={format}
                            durationInFrames={durationInFrames}
                            playing={isPlayingPreview}
                            voiceSpeed={voiceSpeed}
                            showSafeAreas={showSafeAreas}
                        />
                        {/* Canvas Editor is above the player but below the controls */}
                        <CanvasEditor />
                        
                        <div className="absolute top-6 right-6 flex gap-3 opacity-0 group-hover:opacity-100 transition-all duration-500 z-[80]">
                            <Button 
                                variant="secondary" 
                                size="sm" 
                                className={cn(
                                    "h-10 px-5 rounded-full text-xs font-bold tracking-tight backdrop-blur-xl transition-all",
                                    showSafeAreas 
                                        ? "bg-studio-accent text-white border-transparent shadow-lg shadow-studio-accent/20" 
                                        : "bg-black/5 text-zinc-500 border border-black/5 hover:bg-black/10 hover:text-zinc-900"
                                )}
                                onClick={() => setShowSafeAreas(!showSafeAreas)}
                            >
                                <Layers className="w-4 h-4 mr-2" />
                                Safe Guides
                            </Button>
                        </div>

                        {/* Playback Controls - HIGH LUXURY DESIGN */}
                        <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-white/95 via-white/60 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none z-[80] transform translate-y-[10px] group-hover:translate-y-0">
                            <div className="flex items-center gap-6 pointer-events-auto">
                                <div className="flex items-center gap-3">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="w-12 h-12 rounded-full bg-black/5 text-zinc-400 border border-black/5 hover:bg-black/10 hover:text-zinc-900 transition-all active:scale-90"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setCurrentTime(0);
                                        }}
                                    >
                                        <SkipBack className="w-5 h-5 fill-current" />
                                    </Button>

                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="w-16 h-16 rounded-full bg-studio-accent text-white hover:opacity-90 shadow-lg shadow-studio-accent/20 transition-all active:scale-90 border-0"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setIsPlayingPreview(!isPlayingPreview);
                                        }}
                                    >
                                        {isPlayingPreview ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
                                    </Button>

                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="w-12 h-12 rounded-full bg-black/5 text-zinc-400 border border-black/5 hover:bg-black/10 hover:text-zinc-900 transition-all active:scale-90"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setCurrentTime(durationInFrames / fps);
                                        }}
                                    >
                                        <SkipForward className="w-5 h-5 fill-current" />
                                    </Button>
                                </div>
                                
                                <div className="flex-1 px-4 pointer-events-auto group/seeker relative h-10 flex items-center">
                                    <div className="absolute inset-x-4 h-1.5 bg-black/10 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-studio-accent shadow-lg shadow-studio-accent/50 transition-all duration-100"
                                            style={{ width: `${(currentTime / (durationInFrames/fps)) * 100}%` }}
                                        />
                                    </div>
                                    <input 
                                        type="range"
                                        min="0"
                                        max={durationInFrames / fps}
                                        step={1/fps}
                                        value={currentTime}
                                        onChange={(e) => setCurrentTime(parseFloat(e.target.value))}
                                        className="absolute inset-x-4 w-[calc(100%-32px)] h-1.5 opacity-0 cursor-pointer z-10"
                                    />
                                    {/* System thumb indicator */}
                                    <div 
                                        className="absolute w-4 h-4 rounded-full bg-white shadow-xl pointer-events-none transition-all duration-100"
                                        style={{ left: `calc(${ (currentTime / (durationInFrames/fps)) * 100 }% - 8px)` }}
                                    />
                                </div>

                                <PlaybackTimeDisplay 
                                    durationInFrames={durationInFrames} 
                                    fps={fps} 
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Inspector */}
                <div className="lg:col-span-4 flex flex-col h-full ring-1 ring-black/5 rounded-3xl overflow-hidden bg-transparent backdrop-blur-md border border-black/5 min-h-0">
                    <div className="glass-card flex flex-col h-full overflow-hidden border-none rounded-none p-5 pb-0">
                        <div className="flex items-center justify-between mb-4 border-b border-studio-border pb-3">
                            <div className="flex items-center gap-4">
                                <div className="p-2.5 bg-studio-accent/10 rounded-xl text-studio-accent border border-studio-accent/20">
                                    <Sliders className="w-5 h-5" />
                                </div>
                                <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest">Clip Inspector</p>
                            </div>
                        </div>

                        {!selectedClip ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-center relative">
                                <div className="w-16 h-16 rounded-full bg-black/5 border border-black/5 flex items-center justify-center mb-6 shadow-inner transition-transform duration-500">
                                    <Maximize2 className="w-8 h-8 text-studio-accent/40" />
                                </div>
                                <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest leading-relaxed">
                                    Neural Intelligence <br/>
                                    <span className="text-[9px] font-medium opacity-40 lowercase italic mt-2 block">select an asset to modify</span>
                                </p>
                            </div>
                        ) : (
                            <div className="flex-1 space-y-8 overflow-y-auto pr-2 custom-scrollbar p-5 bg-white/[0.02] rounded-none">
                                <div 
                                    className="relative aspect-video rounded-none overflow-hidden border border-studio-border bg-zinc-100 shadow-inner flex-shrink-0 group/preview cursor-pointer"
                                    onClick={handleReplaceAsset}
                                >
                                    {selectedClip.type === 'image' || selectedClip.type === 'video' ? (
                                        selectedClip.type === 'video' 
                                            ? <video src={selectedClip.src} className="w-full h-full object-cover opacity-90 group-hover/preview:opacity-100 transition-opacity" muted /> 
                                            : <img src={selectedClip.src} className="w-full h-full object-cover opacity-90 group-hover/preview:opacity-100 transition-opacity" />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-black/5">
                                            <Sparkles className="w-10 h-10 text-studio-accent/40 animate-pulse" />
                                            <span className="text-[9px] font-black text-studio-accent/60 uppercase tracking-widest">{selectedClip.type} Stream</span>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent pointer-events-none" />
                                    
                                    {/* Replace Overlay */}
                                    <div className="absolute inset-0 bg-studio-accent/10 opacity-0 group-hover/preview:opacity-100 flex flex-col items-center justify-center transition-all duration-300">
                                        <div className="bg-white/80 backdrop-blur-md p-4 rounded-full border border-studio-accent/30 scale-90 group-hover/preview:scale-100 transition-transform">
                                            <Sparkles className="w-6 h-6 text-studio-accent" />
                                        </div>
                                        <span className="mt-4 text-[10px] font-black uppercase text-zinc-900 tracking-[0.3em]">Swap Asset</span>
                                    </div>
                                </div>

                                {/* Properties */}
                                <div className="space-y-6">
                                    <div className="flex gap-4">
                                        <Button 
                                            variant="ghost" 
                                            className="flex-1 h-14 rounded-none bg-red-50 text-red-500 border border-red-100 hover:bg-red-500 hover:text-white hover:border-red-500 shadow-sm transition-all font-black uppercase tracking-widest text-[10px]" 
                                            onClick={handleDelete}
                                        >
                                            <Trash className="w-4 h-4 mr-3" /> Purge Asset
                                        </Button>
                                    </div>
                                    
                                    <div className="p-6 bg-transparent rounded-none border border-studio-border space-y-8 shadow-sm">
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center px-1">
                                                <span className="text-[9px] font-black uppercase text-zinc-400 tracking-widest">Global Opacity</span>
                                                <span className="text-[10px] font-mono font-bold text-studio-accent bg-studio-accent/5 px-2 py-0.5 rounded-md border border-studio-accent/20">
                                                    {Math.round((selectedClip.opacity ?? 1) * 100)}%
                                                </span>
                                            </div>
                                             <div className="relative h-6 flex items-center px-1">
                                                <input 
                                                    type="range" min="0" max="1" step="0.01" 
                                                    value={selectedClip.opacity ?? 1} 
                                                    onChange={(e) => updateClip(selectedClip.id, { opacity: parseFloat(e.target.value) })}
                                                    className="w-full h-1 bg-black/5 rounded-full appearance-none accent-studio-accent cursor-pointer"
                                                />
                                            </div>
                                        </div>

                                        {selectedClip.type === 'overlay' && (
                                            <div className="space-y-4 pt-4 border-t border-black/5 mt-4">
                                                <div className="space-y-2">
                                                    <span className="text-[9px] font-black uppercase text-zinc-400 tracking-widest px-1">Primary Header</span>
                                                    <input 
                                                        type="text"
                                                        value={selectedClip.title || ''}
                                                        onChange={(e) => updateClip(selectedClip.id, { title: e.target.value })}
                                                        placeholder="Enter headline..."
                                                        className="w-full bg-black/[0.02] border border-studio-border rounded-none px-4 py-4 text-[11px] font-bold text-zinc-900 outline-none focus:border-studio-accent/50 transition-all placeholder:text-zinc-300"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <span className="text-[9px] font-black uppercase text-zinc-400 tracking-widest px-1">Sub-Headline</span>
                                                    <textarea 
                                                        value={selectedClip.subtitle || ''}
                                                        onChange={(e) => updateClip(selectedClip.id, { subtitle: e.target.value })}
                                                        placeholder="Enter description..."
                                                        rows={3}
                                                        className="w-full bg-black/[0.02] border border-studio-border rounded-none px-4 py-4 text-[11px] font-bold text-zinc-900 outline-none focus:border-studio-accent/50 transition-all resize-none placeholder:text-zinc-300"
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        <div className="space-y-3">
                                            <span className="text-[9px] font-black uppercase text-zinc-400 tracking-widest px-1">Neural Transitions</span>
                                            <div className="relative group/select">
                                                <select 
                                                    value={selectedClip.motionEffect || 'none'}
                                                    onChange={(e) => updateClip(selectedClip.id, { motionEffect: e.target.value })}
                                                    className="w-full bg-black/[0.02] border border-studio-border rounded-none px-5 py-4 text-[11px] font-bold uppercase text-zinc-500 outline-none focus:ring-2 focus:ring-studio-accent/5 focus:border-studio-accent/30 transition-all appearance-none"
                                                >
                                                    <option value="none">STATIC ENGINE</option>
                                                    <option value="fade-in">SMOOTH DISSOLVE</option>
                                                    <option value="zoom-in">HYPER ZOOM IN</option>
                                                    <option value="zoom-out">SPACE ZOOM OUT</option>
                                                    <option value="slide-up">KINETIC UP</option>
                                                    <option value="slide-down">KINETIC DOWN</option>
                                                    <option value="slide-left">SWIPE LEFT</option>
                                                    <option value="slide-right">SWIPE RIGHT</option>
                                                    <option value="glitch">NEURAL GLITCH</option>
                                                    <option value="bounce">KINETIC BOUNCE</option>
                                                    <option value="whip-pan">CINEMATIC WHIP</option>
                                                </select>
                                                <ChevronRight className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 pointer-events-none rotate-90" />
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <span className="text-[9px] font-black uppercase text-zinc-400 tracking-widest px-1">Linked Audio (SFX)</span>
                                            <div className="flex gap-3">
                                                <Button 
                                                    variant="ghost" 
                                                    className="flex-1 h-12 rounded-none text-[10px] font-black uppercase tracking-widest border border-studio-border bg-black/[0.02] text-zinc-400 hover:text-zinc-900 hover:border-studio-accent/30 transition-all truncate px-5"
                                                    onClick={() => {
                                                        setAddingToTrack(selectedClip.id);
                                                        setAddingToTrackType('audio');
                                                        setIsAudioPickerOpen(true);
                                                    }}
                                                >
                                                    <Music className="w-3.5 h-3.5 mr-2 text-studio-accent/60" />
                                                    {selectedClip.sfxUrl ? (selectedClip.sfxUrl.split('/').pop()?.split('?')[0] || 'SFX Attached') : "ATTACH SFX"}
                                                </Button>
                                                {selectedClip.sfxUrl && (
                                                     <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        className="h-12 w-12 rounded-none bg-red-50 text-red-400 hover:bg-red-500 hover:text-white border border-red-100"
                                                        onClick={() => {
                                            updateClip(selectedClip.id, { sfxUrl: undefined, sfxDurationFrames: undefined, sfxVolume: undefined });
                                            pushToHistory();
                                        }}
                                                    >
                                                        <Trash className="w-4 h-4" />
                                                    </Button>
                                                )}
                                            </div>
                                            {selectedClip.sfxUrl && (
                                                <div className="space-y-2 pt-2">
                                                    <div className="flex justify-between items-center px-1">
                                                        <span className="text-[9px] font-black uppercase text-zinc-400 tracking-widest">SFX Duration</span>
                                                        <span className="text-[10px] font-mono font-bold text-studio-accent bg-studio-accent/5 px-2 py-0.5 rounded-md border border-studio-accent/20">
                                                            {((selectedClip.sfxDurationFrames || 30) / fps).toFixed(1)}s
                                                        </span>
                                                    </div>
                                                    <div className="relative h-6 flex items-center px-1">
                                                        <input 
                                                            type="range" 
                                                            min={Math.round(fps * 0.5)}
                                                            max={Math.round(fps * 5)}
                                                            step="1" 
                                                            value={selectedClip.sfxDurationFrames || 30} 
                                                            onChange={(e) => updateClip(selectedClip.id, { sfxDurationFrames: parseInt(e.target.value) })}
                                                            className="w-full h-1 bg-black/5 rounded-full appearance-none accent-studio-accent cursor-pointer"
                                                        />
                                                    </div>
                                                    <div className="flex justify-between items-center px-1 pt-1">
                                                        <span className="text-[9px] font-black uppercase text-zinc-400 tracking-widest">SFX Volume</span>
                                                        <span className="text-[10px] font-mono font-bold text-studio-accent bg-studio-accent/5 px-2 py-0.5 rounded-md border border-studio-accent/20">
                                                            {Math.round((selectedClip.sfxVolume ?? 0.8) * 100)}%
                                                        </span>
                                                    </div>
                                                    <div className="relative h-6 flex items-center px-1">
                                                        <input 
                                                            type="range" 
                                                            min={0}
                                                            max={100}
                                                            step="1" 
                                                            value={Math.round((selectedClip.sfxVolume ?? 0.8) * 100)} 
                                                            onChange={(e) => updateClip(selectedClip.id, { sfxVolume: parseInt(e.target.value) / 100 })}
                                                            className="w-full h-1 bg-black/5 rounded-full appearance-none accent-studio-accent cursor-pointer"
                                                        />
                                                    </div>
                                                    {/* SFX Fade Controls */}
                                                    <div className="flex justify-between items-center px-1 pt-2">
                                                        <span className="text-[9px] font-black uppercase text-zinc-400 tracking-widest">Fade In</span>
                                                        <span className="text-[10px] font-mono font-bold text-studio-accent bg-studio-accent/5 px-2 py-0.5 rounded-md border border-studio-accent/20">
                                                            {((selectedClip.sfxFadeInFrames ?? 0) / fps).toFixed(1)}s
                                                        </span>
                                                    </div>
                                                    <div className="relative h-6 flex items-center px-1">
                                                        <input 
                                                            type="range" 
                                                            min={0}
                                                            max={selectedClip.sfxDurationFrames || 30}
                                                            step="1" 
                                                            value={selectedClip.sfxFadeInFrames ?? 0} 
                                                            onChange={(e) => updateClip(selectedClip.id, { sfxFadeInFrames: parseInt(e.target.value) })}
                                                            className="w-full h-1 bg-black/5 rounded-full appearance-none accent-studio-accent cursor-pointer"
                                                        />
                                                    </div>
                                                    <div className="flex justify-between items-center px-1 pt-1">
                                                        <span className="text-[9px] font-black uppercase text-zinc-400 tracking-widest">Fade Out</span>
                                                        <span className="text-[10px] font-mono font-bold text-studio-accent bg-studio-accent/5 px-2 py-0.5 rounded-md border border-studio-accent/20">
                                                            {((selectedClip.sfxFadeOutFrames ?? 8) / fps).toFixed(1)}s
                                                        </span>
                                                    </div>
                                                    <div className="relative h-6 flex items-center px-1">
                                                        <input 
                                                            type="range" 
                                                            min={0}
                                                            max={selectedClip.sfxDurationFrames || 30}
                                                            step="1" 
                                                            value={selectedClip.sfxFadeOutFrames ?? 8} 
                                                            onChange={(e) => updateClip(selectedClip.id, { sfxFadeOutFrames: parseInt(e.target.value) })}
                                                            className="w-full h-1 bg-black/5 rounded-full appearance-none accent-studio-accent cursor-pointer"
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Timeline: flex-none — takes only what its tracks need, no dead space */}
            <div className="flex-none">
                <TimelineContainer 
                    durationInFrames={durationInFrames} 
                    fps={fps} 
                    currentFrame={Math.round(currentTime * SyncEngine.FPS)}
                    onFrameChange={setCurrentTime}
                    zoomLevel={10}
                    snapPoints={snapPoints}
                    onAddLayer={() => {
                        const newId = `l-${Date.now()}`;
                        setLayers([...layers, { id: newId, name: `Nueva Capa ${layers.length + 1}`, clips: [] } as Layer]);
                        pushToHistory();
                    }}
                    sidebar={
                        <div className="flex flex-col w-full">
                            {layers.map((layer, idx) => (
                                <TrackHeader
                                    key={`th-${layer.id}`}
                                    title={layer.name || `Capa ${idx + 1}`}
                                    icon={layer.name.toLowerCase().includes('narración') || layer.name.toLowerCase().includes('voz') ? Mic : (layer.name.toLowerCase().includes('música') || layer.name.toLowerCase().includes('audio') ? Music : Film)}
                                    colorClass={layer.name.toLowerCase().includes('narración') || layer.name.toLowerCase().includes('voz') ? "text-indigo-400 bg-indigo-500/10" : (layer.name.toLowerCase().includes('música') || layer.name.toLowerCase().includes('audio') ? "text-blue-400 bg-blue-500/10" : "text-emerald-400 bg-emerald-500/10")}
                                    onAddMedia={() => {
                                        setAddingToTrack(layer.id);
                                        setAddingToTrackType('media');
                                        setIsMediaPickerOpen(true);
                                    }}
                                    onAddAudio={() => {
                                        setAddingToTrack(layer.id);
                                        setAddingToTrackType('audio');
                                        setIsAudioPickerOpen(true);
                                    }}
                                    onDeleteClick={() => {
                                        if (layers.length <= 1) return;
                                        setLayers(layers.filter(l => l.id !== layer.id));
                                        pushToHistory();
                                    }}
                                />
                            ))}
                        </div>
                    }
                >
                    {layers.map(layer => (
                        <TrackLayer key={`tl-${layer.id}`}>
                            {renderClips(layer.clips, 'video', layer.id)}
                        </TrackLayer>
                    ))}
                </TimelineContainer>
            </div>

            {/* Pickers */}
            <MediaPicker 
                isOpen={isMediaPickerOpen}
                onClose={() => { setIsMediaPickerOpen(false); setAddingToTrack(null); setAddingToTrackType(null); }}
                currentFormat={format}
                activeSegmentId={selectedClipId || ""}
                onTriggerUpload={() => {}}
                onConfirm={(item) => {
                    const url = typeof item === 'string' ? item : item.url;
                    const type = (typeof item !== 'string' && item.type) ? item.type : (url.match(/\.(mp4|webm|mov)(\?.*)?$/i) ? 'video' : 'image');
                    
                    if (selectedClip && addingToTrack === selectedClip.id) {
                        // Replacement logic
                        updateClip(selectedClip.id, { src: url, type: type as Clip['type'] });
                        setAddingToTrack(null);
                        setAddingToTrackType(null);
                        setIsMediaPickerOpen(false);
                    } else if (addingToTrack) {
                        // Addition logic
                        const newClip: Clip = {
                            id: `${type}-${Date.now()}`,
                            type: type as Clip['type'],
                            src: url,
                            startFrame: Math.round(currentTime * SyncEngine.FPS),
                            durationInFrames: 150,
                            x: 50, y: 50, scale: 1, opacity: 1
                        };
                        setLayers(layers.map(l => l.id === addingToTrack ? { ...l, clips: [...l.clips, newClip] } : l));
                        pushToHistory();
                        setAddingToTrack(null);
                        setAddingToTrackType(null);
                        setIsMediaPickerOpen(false);
                    } else {
                        setIsMediaPickerOpen(false);
                    }
                }}
            />

            <AudioPicker
                isOpen={isAudioPickerOpen}
                onClose={() => { setIsAudioPickerOpen(false); setAddingToTrack(null); setAddingToTrackType(null); }}
                title="Librería de Audio y SFX"
                onConfirm={(url: string, label: string) => {
                    // Logic: If addingToTrack matches the selectedClipId, it's a replacement or an SFX
                    if (selectedClip && addingToTrack === selectedClip.id) {
                        if (selectedClip.type === 'audio' || selectedClip.type === 'music') {
                            // Replacement of an audio/music clip
                            updateClip(selectedClip.id, { 
                                src: url,
                                title: label || url.split('/').pop()?.split('?')[0],
                            } as any);
                        } else {
                            // SFX Attachment to image/video clip
                            console.log('[SFX ATTACH DEBUG] clipId:', selectedClip.id, 'sfxUrl:', url, 'type:', selectedClip.type);
                            updateClip(selectedClip.id, { 
                                sfxUrl: url,
                                sfxDurationFrames: selectedClip.sfxDurationFrames || 30,
                            } as any);
                            pushToHistory();
                        }
                    } else if (addingToTrack) {
                        const newClip: Clip = {
                            id: `audio-${Date.now()}`,
                            type: 'audio',
                            src: url,
                            startFrame: Math.round(currentTime * SyncEngine.FPS),
                            durationInFrames: 150,
                            volume: 1,
                            title: label
                        };
                        setLayers(layers.map(l => l.id === addingToTrack ? { ...l, clips: [...l.clips, newClip] } : l));
                        pushToHistory();
                    }
                    setAddingToTrack(null);
                    setAddingToTrackType(null);
                    setIsAudioPickerOpen(false);
                }}
            />
        </div>
    );
}

// Optimized Time Display to prevent Phase3Editor frame churning
function PlaybackTimeDisplay({ durationInFrames, fps }: { durationInFrames: number, fps: number }) {
    const currentTime = useStudioStore(s => s.currentTime);
    
    const fmt = (secs: number) => {
        const m = Math.floor(secs / 60);
        const s = Math.floor(secs % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    return (
        <div className="flex flex-col font-mono text-zinc-500">
            <div className="flex items-center gap-2 text-xs">
                <span className="font-bold text-zinc-900">{fmt(currentTime)}</span>
                <span className="text-zinc-200">/</span>
                <span className="text-zinc-400">{fmt(durationInFrames / fps)}</span>
            </div>
        </div>
    );
}
