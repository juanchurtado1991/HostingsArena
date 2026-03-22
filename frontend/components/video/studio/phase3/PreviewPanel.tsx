import React from 'react';
import dynamic from 'next/dynamic';
import { useStudioStore } from '@/store/useStudioStore';
import { Button } from '@/components/ui/button';
import { Layers, Play, Pause, SkipBack, SkipForward } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CanvasEditor } from '@/components/video/studio/CanvasEditor';
import { SyncEngine } from '@/lib/video-sync/SyncEngine';
import { PlaybackTimeDisplay } from './PlaybackTimeDisplay';
import { Layer } from '@/types/studio';

const VideoPlayer = dynamic(() => import('@/components/video/VideoPlayer').then(mod => mod.VideoPlayer), { ssr: false });

interface PreviewPanelProps {
    showSafeAreas: boolean;
    setShowSafeAreas: (v: boolean) => void;
}

export function PreviewPanel({ showSafeAreas, setShowSafeAreas }: PreviewPanelProps) {
    const title = useStudioStore(s => s.title);
    const scenes = useStudioStore(s => s.scenes);
    const layers = useStudioStore(s => s.layers);
    const format = useStudioStore(s => s.format);
    const durationInFrames = useStudioStore(s => s.durationInFrames);
    const currentTime = useStudioStore(s => s.currentTime);
    const isPlayingPreview = useStudioStore(s => s.isPlayingPreview);
    const voiceSpeed = useStudioStore(s => s.voiceSpeed);
    const outroSfxUrl = useStudioStore(s => s.outroSfxUrl);
    const bgMusicUrl = useStudioStore(s => s.bgMusicUrl);
    const bgMusicVolume = useStudioStore(s => s.bgMusicVolume);
    const setCurrentTime = useStudioStore(s => s.setCurrentTime);
    const setIsPlayingPreview = useStudioStore(s => s.setIsPlayingPreview);
    const fps = SyncEngine.FPS;

    return (
        <div className="lg:col-span-8 flex flex-col min-h-0">
            <div className="bg-transparent rounded-3xl overflow-hidden border border-black/5 shadow-2xl flex-1 relative group ring-1 ring-black/5 min-h-0">
                <VideoPlayer title={title} scenes={scenes} layers={layers} format={format} durationInFrames={durationInFrames} playing={isPlayingPreview} voiceSpeed={voiceSpeed} outroSfxUrl={outroSfxUrl} bgMusicUrl={bgMusicUrl} bgMusicVolume={bgMusicVolume} showSafeAreas={showSafeAreas} />
                <CanvasEditor />

                <div className="absolute top-6 right-6 flex gap-3 opacity-0 group-hover:opacity-100 transition-all duration-500 z-[80]">
                    <Button variant="secondary" size="sm" className={cn("h-10 px-5 rounded-full text-xs font-bold tracking-tight backdrop-blur-xl transition-all", showSafeAreas ? "bg-studio-accent text-white border-transparent shadow-lg shadow-studio-accent/20" : "bg-black/5 text-zinc-500 border border-black/5 hover:bg-black/10 hover:text-zinc-900")} onClick={() => setShowSafeAreas(!showSafeAreas)}>
                        <Layers className="w-4 h-4 mr-2" /> Safe Guides
                    </Button>
                </div>

                <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-white/95 via-white/60 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none z-[80] transform translate-y-[10px] group-hover:translate-y-0">
                    <div className="flex items-center gap-6 pointer-events-auto">
                        <div className="flex items-center gap-3">
                            <Button variant="ghost" size="icon" className="w-12 h-12 rounded-full bg-black/5 text-zinc-400 border border-black/5 hover:bg-black/10 hover:text-zinc-900 transition-all active:scale-90" onClick={(e) => { e.stopPropagation(); setCurrentTime(0); }}><SkipBack className="w-5 h-5 fill-current" /></Button>
                            <Button variant="ghost" size="icon" className="w-16 h-16 rounded-full bg-studio-accent text-white hover:opacity-90 shadow-lg shadow-studio-accent/20 transition-all active:scale-90 border-0" onClick={(e) => { e.stopPropagation(); setIsPlayingPreview(!isPlayingPreview); }}>{isPlayingPreview ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}</Button>
                            <Button variant="ghost" size="icon" className="w-12 h-12 rounded-full bg-black/5 text-zinc-400 border border-black/5 hover:bg-black/10 hover:text-zinc-900 transition-all active:scale-90" onClick={(e) => { e.stopPropagation(); setCurrentTime(durationInFrames / fps); }}><SkipForward className="w-5 h-5 fill-current" /></Button>
                        </div>

                        <div className="flex-1 px-4 pointer-events-auto group/seeker relative h-10 flex items-center">
                            <div className="absolute inset-x-4 h-1.5 bg-black/10 rounded-full overflow-hidden">
                                <div className="h-full bg-studio-accent shadow-lg shadow-studio-accent/50 transition-all duration-100" style={{ width: `${(currentTime / (durationInFrames / fps)) * 100}%` }} />
                            </div>
                            <input type="range" min="0" max={durationInFrames / fps} step={1 / fps} value={currentTime} onChange={(e) => setCurrentTime(parseFloat(e.target.value))} className="absolute inset-x-4 w-[calc(100%-32px)] h-1.5 opacity-0 cursor-pointer z-10" />
                            <div className="absolute w-4 h-4 rounded-full bg-white shadow-xl pointer-events-none transition-all duration-100" style={{ left: `calc(${(currentTime / (durationInFrames / fps)) * 100}% - 8px)` }} />
                        </div>

                        <PlaybackTimeDisplay durationInFrames={durationInFrames} fps={fps} />
                    </div>
                </div>
            </div>
        </div>
    );
}
