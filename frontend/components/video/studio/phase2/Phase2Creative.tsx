import React from 'react';
import { useVideoStudio } from '@/contexts/VideoStudioContext';
import { Sparkles } from 'lucide-react';
import { findBestMixedMediaBatch, type MediaItem, loadMediaData } from '@/components/video/mediaLibrary';
import { SceneScriptEditor } from './SceneScriptEditor';
import { ConfigCard } from './ConfigCard';

export function Phase2Creative() {
    const { scenes, setScenes } = useVideoStudio();

    const genSegId = () => Math.random().toString(36).substr(2, 9);

    const addExtraScene = async (index: number) => {
        const visual = "Technology news visualization, cinematic style";
        await loadMediaData();
        const batch = findBestMixedMediaBatch(visual, 2, 2, new Set());
        const segs = batch.map((media: MediaItem) => ({ id: genSegId(), source: 'library' as const, type: media.type, url: media.url, durationPct: Math.round(100 / batch.length), motionEffect: 'ken-burns' as const }));
        const newScenes = [...scenes];
        newScenes.splice(index + 1, 0, { speech: "Escribe la narración para este bloque aquí...", visual, transition: 'crossfade', duration: 5, mediaSegments: segs, assetUrl: batch[0]?.url, assetType: batch[0]?.type, titleCardEnabled: true });
        setScenes(newScenes);
    };

    const duplicateScene = (index: number) => {
        const source = scenes[index];
        const dup = { ...source, mediaSegments: source.mediaSegments?.map(s => ({ ...s, id: genSegId() })) };
        const newScenes = [...scenes]; newScenes.splice(index + 1, 0, dup); setScenes(newScenes);
    };

    const removeScene = (index: number) => {
        if (scenes.length <= 1) return;
        const newScenes = [...scenes]; newScenes.splice(index, 1); setScenes(newScenes);
    };

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 px-2 relative z-10">
                <div className="space-y-1">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-studio-accent/10 rounded-2xl text-studio-accent border border-studio-accent/20 shadow-[0_0_15px_rgba(0,122,255,0.1)]">
                            <Sparkles className="w-6 h-6" />
                        </div>
                        <h2 className="text-3xl font-bold tracking-tight text-zinc-900">Creative Engine</h2>
                    </div>
                    <p className="text-[11px] text-zinc-500 font-medium mt-1 uppercase tracking-widest">Master Studio Controller</p>
                </div>
            </div>

            {/* Unified Config & Presets Card */}
            <div className="px-2">
                <ConfigCard />
            </div>

            <SceneScriptEditor onAddScene={addExtraScene} onDuplicateScene={duplicateScene} onRemoveScene={removeScene} />

            <div className="px-2 text-center mt-12">
                <div className="inline-flex items-center gap-4 px-10 py-5 bg-studio-bg border border-studio-border rounded-3xl text-[10px] font-black uppercase tracking-[0.2em] text-studio-accent/80 shadow-2xl">
                    <Sparkles className="w-5 h-5 animate-pulse" /> Neural Assembly Engine: Visuals and layers mapped in the Next Step.
                </div>
            </div>
        </div>
    );
}
