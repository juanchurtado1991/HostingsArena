import React, { useState, useMemo, useEffect } from 'react';
import { useStudioStore } from '@/store/useStudioStore';
import { useVideoStudio } from '@/contexts/VideoStudioContext';
import { Clip, Layer } from '@/types/studio';
import { TimelineContainer } from '@/components/video/timeline/TimelineContainer';
import { TrackLayer } from '@/components/video/timeline/TrackLayer';
import { MediaBlock } from '@/components/video/timeline/MediaBlock';
import { MediaPicker } from '@/components/video/MediaPicker';
import { AudioPicker } from '@/components/video/AudioPicker';
import { Music, Mic, Film } from 'lucide-react';
import { TrackHeader } from '@/components/video/timeline/TrackHeader';
import { SyncEngine } from '@/lib/video-sync/SyncEngine';
import { PreviewPanel } from './PreviewPanel';
import { ClipInspector } from './ClipInspector';

const STORAGE_KEY = 'hostingarena_editor_draft';

export function Phase3Editor() {
    const layers = useStudioStore(s => s.layers);
    const scenes = useStudioStore(s => s.scenes);
    const title = useStudioStore(s => s.title);
    const format = useStudioStore(s => s.format);
    const durationInFrames = useStudioStore(s => s.durationInFrames);
    const currentTime = useStudioStore(s => s.currentTime);
    const selectedClipId = useStudioStore(s => s.selectedClipId);

    const setLayers = useStudioStore(s => s.setLayers);
    const setScenes = useStudioStore(s => s.setScenes);
    const setTitle = useStudioStore(s => s.setTitle);
    const setFormat = useStudioStore(s => s.setFormat);
    const setDurationInFramesStore = useStudioStore(s => s.setDurationInFrames);
    const pushToHistory = useStudioStore(s => s.pushToHistory);
    const updateClip = useStudioStore(s => s.updateClip);
    const setSelectedClipId = useStudioStore(s => s.setSelectedClipId);
    const setCurrentTime = useStudioStore(s => s.setCurrentTime);

    const undo = useStudioStore(s => s.undo);
    const redo = useStudioStore(s => s.redo);
    const historyIndex = useStudioStore(s => s.historyIndex);
    const history = useStudioStore(s => s.history);

    const { layers: ctxLayers, scenes: ctxScenes, title: ctxTitle, format: ctxFormat, durationInFrames: ctxDuration, setLayers: setCtxLayers, setScenes: setCtxScenes } = useVideoStudio();

    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
    const [isAudioPickerOpen, setIsAudioPickerOpen] = useState(false);
    const [addingToTrack, setAddingToTrack] = useState<string | null>(null);
    const [addingToTrackType, setAddingToTrackType] = useState<'media' | 'audio' | null>(null);
    const [showSafeAreas, setShowSafeAreas] = useState(false);
    const [dragState, setDragState] = useState<{ clipId: string; mode: 'move' | 'resize-left' | 'resize-right'; initialFrame: number; initialDur: number; initialX: number; } | null>(null);

    const pxPerSec = 100;
    const fps = SyncEngine.FPS;
    const canUndo = historyIndex > 0;
    const canRedo = historyIndex < history.length - 1;

    // --- Effects for draft persistence & context sync ---
    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try { const data = JSON.parse(saved); if (data.layers?.length > 0) { setLayers(data.layers); setScenes(data.scenes || []); setTitle(data.title || ""); setFormat(data.format || "9:16"); setDurationInFramesStore(data.durationInFrames || 1800); setLastSaved(new Date(data.timestamp)); } } catch (e) { console.error("Failed to load draft:", e); }
        }
    }, [setLayers, setScenes, setTitle, setFormat, setDurationInFramesStore]);

    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY); let storedLayersCount = 0;
        if (saved) { try { const data = JSON.parse(saved); storedLayersCount = data.layers?.length ?? 0; } catch (_) {} }
        if (layers.length === 0 && ctxLayers.length > 0) { setLayers(ctxLayers); setScenes(ctxScenes); setTitle(ctxTitle); setFormat(ctxFormat); setDurationInFramesStore(ctxDuration); pushToHistory(); }
    }, [layers.length, ctxLayers, ctxScenes, ctxTitle, ctxFormat, ctxDuration, setLayers, setScenes, setTitle, setFormat, setDurationInFramesStore, pushToHistory]);

    useEffect(() => { if (ctxDuration && ctxDuration !== 1800 && ctxDuration !== durationInFrames) setDurationInFramesStore(ctxDuration); }, [ctxDuration, durationInFrames, setDurationInFramesStore]);
    useEffect(() => { if (layers.length > 0) setCtxLayers(layers); }, [layers, setCtxLayers]);
    useEffect(() => { if (scenes.length > 0) setCtxScenes(scenes as any); }, [scenes, setCtxScenes]);

    useEffect(() => {
        if (layers.length === 0) return;
        const contentDuration = SyncEngine.getClipsDurationInFrames(layers);
        if (contentDuration > durationInFrames) { setDurationInFramesStore(contentDuration); }
    }, [layers, durationInFrames, setDurationInFramesStore]);

    useEffect(() => {
        if (layers.length === 0) return;
        const dataToSave = { layers, scenes, title, format, durationInFrames, timestamp: Date.now() };
        const timer = setTimeout(() => { setIsSaving(true); localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave)); setLastSaved(new Date()); setIsSaving(false); }, 1500);
        const handleBeforeUnload = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => { clearTimeout(timer); window.removeEventListener('beforeunload', handleBeforeUnload); };
    }, [layers, scenes, title, format, durationInFrames]);

    // --- Keyboard shortcuts ---
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => { if ((e.metaKey || e.ctrlKey) && e.key === 'z') { if (e.shiftKey) { if (canRedo) redo(); } else { if (canUndo) undo(); } } };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [undo, redo, canUndo, canRedo]);

    // --- Drag handling ---
    useEffect(() => {
        if (!dragState) return;
        const handleMouseMove = (e: MouseEvent) => {
            const deltaFrames = Math.round(((e.clientX - dragState.initialX) / pxPerSec) * fps);
            if (dragState.mode === 'move') { updateClip(dragState.clipId, { startFrame: Math.max(0, dragState.initialFrame + deltaFrames) }); }
            else if (dragState.mode === 'resize-right') { updateClip(dragState.clipId, { durationInFrames: Math.max(1, dragState.initialDur + deltaFrames) }); }
            else if (dragState.mode === 'resize-left') { const newStart = Math.max(0, dragState.initialFrame + deltaFrames); const newDur = Math.max(1, dragState.initialDur - (newStart - dragState.initialFrame)); if (newDur > 1) updateClip(dragState.clipId, { startFrame: newStart, durationInFrames: newDur }); }
        };
        const handleMouseUp = () => { setDragState(null); pushToHistory(); };
        window.addEventListener('mousemove', handleMouseMove); window.addEventListener('mouseup', handleMouseUp);
        return () => { window.removeEventListener('mousemove', handleMouseMove); window.removeEventListener('mouseup', handleMouseUp); };
    }, [dragState, updateClip, pushToHistory]);

    const startDrag = (clipId: string, mode: 'move' | 'resize-left' | 'resize-right', e: React.MouseEvent) => {
        const clip = layers.flatMap(l => l.clips).find(c => c.id === clipId);
        if (!clip) return;
        setDragState({ clipId, mode, initialFrame: clip.startFrame, initialDur: clip.durationInFrames, initialX: e.clientX });
        setSelectedClipId(clipId);
    };

    const selectedClip = useMemo(() => { if (!selectedClipId) return null; return layers.flatMap(l => l.clips).find(c => c.id === selectedClipId) || null; }, [selectedClipId, layers]);
    const snapPoints = useMemo(() => { const pts = new Set<number>(); pts.add(0); pts.add(durationInFrames); layers.forEach(l => l.clips.forEach(c => { pts.add(c.startFrame); pts.add(c.startFrame + c.durationInFrames); })); return Array.from(pts).sort((a, b) => a - b); }, [layers, durationInFrames]);

    const handleDelete = () => { if (!selectedClipId) return; setLayers(layers.map(l => ({ ...l, clips: l.clips.filter(c => c.id !== selectedClipId) }))); setSelectedClipId(null); pushToHistory(); };
    const handleReplaceAsset = () => { if (!selectedClip) return; setAddingToTrack(selectedClipId); if (selectedClip.type === 'audio' || selectedClip.type === 'music') { setAddingToTrackType('audio'); setIsAudioPickerOpen(true); } else { setAddingToTrackType('media'); setIsMediaPickerOpen(true); } };
    const handleAttachSfx = () => { if (!selectedClip) return; setAddingToTrack(selectedClip.id); setAddingToTrackType('audio'); setIsAudioPickerOpen(true); };

    const renderClips = (clips: Clip[], type: 'image' | 'video' | 'audio' | 'music' | 'overlay', layerId: string) => clips.map(clip => (
        <MediaBlock key={clip.id} id={clip.id} type={type === 'overlay' ? 'overlay' : type === 'image' || type === 'video' ? (clip.type as 'image' | 'video') : type} url={clip.src} label={clip.title || clip.id.split('-').pop()} startFrame={clip.startFrame} durationInFrames={clip.durationInFrames} fps={fps} pxPerSec={pxPerSec} isSelected={selectedClipId === clip.id} onClick={() => setSelectedClipId(clip.id)} onMouseDown={(e) => startDrag(clip.id, 'move', e)} onResizeStartLeft={(e) => startDrag(clip.id, 'resize-left', e)} onResizeStartRight={(e) => startDrag(clip.id, 'resize-right', e)} />
    ));

    return (
        <div className="flex flex-col gap-3 h-[calc(100vh-84px)] select-none animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch flex-1 min-h-0 overflow-hidden">
                <PreviewPanel showSafeAreas={showSafeAreas} setShowSafeAreas={setShowSafeAreas} />
                <ClipInspector selectedClip={selectedClip || null} onDelete={handleDelete} onReplaceAsset={handleReplaceAsset} onAttachSfx={handleAttachSfx} />
            </div>

            <div className="flex-none">
                <TimelineContainer durationInFrames={durationInFrames} fps={fps} currentFrame={Math.round(currentTime * SyncEngine.FPS)} onFrameChange={setCurrentTime} zoomLevel={10} snapPoints={snapPoints}
                    onAddLayer={() => { const newId = `l-${Date.now()}`; setLayers([...layers, { id: newId, name: `Nueva Capa ${layers.length + 1}`, clips: [] } as Layer]); pushToHistory(); }}
                    sidebar={<div className="flex flex-col w-full">{layers.map((layer, idx) => (
                        <TrackHeader key={`th-${layer.id}`} title={layer.name || `Capa ${idx + 1}`} icon={layer.name.toLowerCase().includes('narración') || layer.name.toLowerCase().includes('voz') ? Mic : (layer.name.toLowerCase().includes('música') || layer.name.toLowerCase().includes('audio') ? Music : Film)} colorClass={layer.name.toLowerCase().includes('narración') || layer.name.toLowerCase().includes('voz') ? "text-indigo-400 bg-indigo-500/10" : (layer.name.toLowerCase().includes('música') || layer.name.toLowerCase().includes('audio') ? "text-blue-400 bg-blue-500/10" : "text-emerald-400 bg-emerald-500/10")} onAddMedia={() => { setAddingToTrack(layer.id); setAddingToTrackType('media'); setIsMediaPickerOpen(true); }} onAddAudio={() => { setAddingToTrack(layer.id); setAddingToTrackType('audio'); setIsAudioPickerOpen(true); }} onDeleteClick={() => { if (layers.length <= 1) return; setLayers(layers.filter(l => l.id !== layer.id)); pushToHistory(); }} />
                    ))}</div>}
                >
                    {layers.map(layer => (<TrackLayer key={`tl-${layer.id}`}>{renderClips(layer.clips, 'video', layer.id)}</TrackLayer>))}
                </TimelineContainer>
            </div>

            <MediaPicker 
                isOpen={isMediaPickerOpen} 
                onClose={() => { setIsMediaPickerOpen(false); setAddingToTrack(null); setAddingToTrackType(null); }} 
                selectedUrl={selectedClip?.src}
                onConfirm={(url, type, label) => {
                    if (selectedClip && addingToTrack === selectedClip.id) { 
                        updateClip(selectedClip.id, { src: url, type: type as Clip['type'] }); 
                    } else if (addingToTrack) { 
                        const newClip: Clip = { 
                            id: `${type}-${Date.now()}`, 
                            type: type as Clip['type'], 
                            src: url, 
                            startFrame: Math.round(currentTime * SyncEngine.FPS), 
                            durationInFrames: 150, 
                            x: 50, 
                            y: 50, 
                            scale: 1, 
                            opacity: 1,
                            title: label
                        }; 
                        setLayers(layers.map(l => l.id === addingToTrack ? { ...l, clips: [...l.clips, newClip] } : l)); 
                        pushToHistory(); 
                    }
                    setAddingToTrack(null); 
                    setAddingToTrackType(null); 
                    setIsMediaPickerOpen(false);
                }}
            />

            <AudioPicker isOpen={isAudioPickerOpen} onClose={() => { setIsAudioPickerOpen(false); setAddingToTrack(null); setAddingToTrackType(null); }} title="Librería de Audio y SFX"
                onConfirm={(url: string, label: string) => {
                    if (selectedClip && addingToTrack === selectedClip.id) {
                        if (selectedClip.type === 'audio' || selectedClip.type === 'music') { updateClip(selectedClip.id, { src: url, title: label || url.split('/').pop()?.split('?')[0] } as any); }
                        else { updateClip(selectedClip.id, { sfxUrl: url, sfxDurationFrames: selectedClip.sfxDurationFrames || 30 } as any); pushToHistory(); }
                    } else if (addingToTrack) { const newClip: Clip = { id: `audio-${Date.now()}`, type: 'audio', src: url, startFrame: Math.round(currentTime * SyncEngine.FPS), durationInFrames: 150, volume: 1, title: label }; setLayers(layers.map(l => l.id === addingToTrack ? { ...l, clips: [...l.clips, newClip] } : l)); pushToHistory(); }
                    setAddingToTrack(null); setAddingToTrackType(null); setIsAudioPickerOpen(false);
                }}
            />
        </div>
    );
}
