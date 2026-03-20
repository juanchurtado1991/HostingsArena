import { useCallback } from 'react';
import { logger } from '@/lib/logger';
import { useStudioStore } from '@/store/useStudioStore';
import type { Scene } from './types';

interface UseRenderArgs {
    scenes: Scene[];
    durationInFrames: number;
    title: string;
    bgMusicUrl?: string;
    bgMusicVolume: number;
    transitionSfxUrl?: string;
    selectedVoice: string;
    voiceSpeed: number;
    format: '9:16' | '16:9';
    exportSettings: any;
    setIsGeneratingVideo: (v: boolean) => void;
    setRenderProgress: (v: number) => void;
    setRenderFinished: (v: boolean) => void;
    setRenderStep: (v: string) => void;
    setRenderEta: (v: number) => void;
    setVideoUrl: (v: string | null) => void;
    setError: (v: string | null) => void;
    renderProgress: number;
}

export function useRender(args: UseRenderArgs) {
    const renderVideo = useCallback(async () => {
        const { scenes, durationInFrames, title, bgMusicUrl, bgMusicVolume, transitionSfxUrl, selectedVoice, voiceSpeed, format, exportSettings, setIsGeneratingVideo, setRenderProgress, setRenderFinished, setRenderStep, setRenderEta, setVideoUrl, setError } = args;

        if (scenes.length === 0) return;
        setIsGeneratingVideo(true);
        setRenderProgress(0);
        setRenderFinished(false);
        setRenderStep("Initializing news engine...");

        try {
            setRenderStep("Finalizing scene durations...");
            setRenderProgress(10);
            
            const finalDurationFrames = durationInFrames;
            console.log(`[StudioRender] Using duration from state: ${finalDurationFrames} frames`);
            setRenderStep("Compositing news frames...");
            setRenderProgress(25);

            const latestState = useStudioStore.getState();
            const currentScenes = latestState.scenes.length > 0 ? latestState.scenes : scenes;
            const currentLayers = latestState.layers;

            const fullScript = currentScenes.map(s => s.speech).join(" ");
            const cleanScript = fullScript.replace(/\s+/g, ' ').trim();
            const estimatedSeconds = Math.max(15, currentScenes.length * 3 + 10);
            const renderStartTime = Date.now();

            const renderResponse = await fetch("/api/admin/video/render", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: latestState.title || title, script: cleanScript, scenes: currentScenes, layers: currentLayers,
                    bgMusicUrl, bgMusicVolume, transitionSfxUrl, voice: selectedVoice, voiceSpeed,
                    format: latestState.format || format, durationInFrames: finalDurationFrames, exportSettings,
                })
            });

            if (!renderResponse.ok || !renderResponse.body) {
                let errorDetails = "Render engine failed";
                try { const errData = await renderResponse.json(); errorDetails = errData.details || errorDetails; } catch (e) {}
                throw new Error(errorDetails);
            }

            const reader = renderResponse.body.getReader();
            const decoder = new TextDecoder();
            let finalVideoUrl: string | null = null;
            let buffer = '';

            while (true) {
                const { value, done } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, { stream: true });
                
                let boundary = buffer.indexOf('\n\n');
                while (boundary !== -1) {
                    const chunk = buffer.slice(0, boundary);
                    buffer = buffer.slice(boundary + 2);
                    
                    const lines = chunk.split('\n');
                    for (const line of lines) {
                        const trimmedLine = line.trim();
                        if (!trimmedLine || !trimmedLine.startsWith('data: ')) continue;
                        
                        try {
                            const data = JSON.parse(trimmedLine.substring(6));
                            if (data.error) throw new Error(data.details || "Streaming render failed");

                            if (data.status === "initializing") {
                                setRenderStep(data.steps?.[0] || "Initializing Video News Engine...");
                                setRenderProgress(5);
                            }

                            if (data.status === "rendering" || data.status === "uploading") {
                                const raw = parseFloat(data.rawProgress);
                                if (!isNaN(raw)) {
                                    const realPct = 5 + (raw * 90); 
                                    setRenderProgress(Math.round(realPct));
                                    setRenderStep(data.message || (data.status === "uploading" ? "Uploading to Cloud..." : "Compositing News Scenes..."));
                                    const elapsedSec = (Date.now() - renderStartTime) / 1000;
                                    if (raw > 0.05) { 
                                        const totalEstimatedSec = elapsedSec / raw;
                                        setRenderEta(Math.ceil(totalEstimatedSec - elapsedSec));
                                    } else {
                                        setRenderEta(Math.ceil(estimatedSeconds - elapsedSec));
                                    }
                                } else if (data.status === "uploading") {
                                    setRenderStep("Uploading to secure storage...");
                                    setRenderProgress(95);
                                }
                            }

                            if (data.status === "complete") {
                                console.log("[SSE Client] Render Complete Event Received!", data.videoUrl);
                                finalVideoUrl = data.videoUrl;
                                setVideoUrl(data.videoUrl); 
                                setRenderStep("Finalizing MP4 container...");
                            }
                        } catch (e: any) {
                            if (e.message.includes("Streaming render failed")) throw e;
                            console.warn("[SSE Client] Failed to parse SSE line", trimmedLine, e);
                        }
                    }
                    boundary = buffer.indexOf('\n\n');
                }
            }

            if (!finalVideoUrl) throw new Error("Render stream ended without receiving a completion event or video URL.");

            setRenderStep("Finalizing master output...");
            for (let p = Math.round(args.renderProgress); p <= 100; p += 2) {
                setRenderProgress(p);
                await new Promise(r => setTimeout(r, 40));
            }
            setRenderProgress(100);
            setRenderEta(0);
            setRenderFinished(true);
            setRenderStep("Video Ready!");
        } catch (err: any) {
            logger.error("Failed to render video:", err);
            setError(`Render Error: ${err.message}`);
        } finally {
            setIsGeneratingVideo(false);
        }
    }, [args]);

    return { renderVideo };
}
