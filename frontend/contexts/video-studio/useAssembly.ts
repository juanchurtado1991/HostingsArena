import { useCallback, useRef } from 'react';
import { logger } from '@/lib/logger';
import { SyncEngine } from '@/lib/video-sync/SyncEngine';
import { findBestMixedMediaBatch } from '@/components/video/mediaLibrary';
import { useStudioStore } from '@/store/useStudioStore';
import type { Scene, Layer, Clip } from './types';

interface UseAssemblyArgs {
    scenes: Scene[];
    selectedVoice: string;
    customVoiceUrl?: string;
    bgMusicUrl?: string;
    bgMusicVolume: number;
    voiceSpeed: number;
    introSfxUrl?: string;
    outroSfxUrl?: string;
    newsCardSfxUrl?: string;
    scriptLang: string;
    title: string;
    format: '9:16' | '16:9';
    setScenes: React.Dispatch<React.SetStateAction<Scene[]>>;
    setLayers: React.Dispatch<React.SetStateAction<Layer[]>>;
    setDurationInFrames: (v: number) => void;
    setError: (v: string | null) => void;
    setIsPreparingAssembly: (v: boolean) => void;
    setSyncEta: (v: number) => void;
    pushToHistory: (scenes: Scene[], layers: Layer[]) => void;
}

export function useAssembly(args: UseAssemblyArgs) {
    const isPreparingRef = useRef(false);

    const prepareAssemblyData = useCallback(async () => {
        const { scenes, selectedVoice, customVoiceUrl, bgMusicUrl, bgMusicVolume, voiceSpeed, introSfxUrl, outroSfxUrl, newsCardSfxUrl, scriptLang, title, format, setScenes, setLayers, setDurationInFrames, setError, setIsPreparingAssembly, setSyncEta, pushToHistory } = args;

        if (scenes.length === 0 || isPreparingRef.current) return;
        isPreparingRef.current = true;
        setIsPreparingAssembly(true);
        setError(null);

        try {
            if (selectedVoice === "custom" && customVoiceUrl) {
                const audioObj = new Audio(customVoiceUrl);
                await new Promise<void>((resolve, reject) => {
                    audioObj.onloadedmetadata = () => {
                        const audioFrames = Math.ceil(audioObj.duration * SyncEngine.FPS);
                        const totalFrames = SyncEngine.getIntroFrames() + audioFrames + SyncEngine.getOutroFrames();
                        
                        const newVideoTrack: Clip[] = [];
                        let currentFrame = SyncEngine.getIntroFrames();
                        const framesPerScene = Math.floor(audioFrames / Math.max(1, scenes.length));
                        
                        scenes.forEach((scene, i) => {
                            newVideoTrack.push({
                                id: `v-${i}`, type: scene.assetType?.includes('video') ? 'video' : 'image',
                                src: scene.assetUrl || scene.visual, startFrame: currentFrame,
                                durationInFrames: i === scenes.length - 1 ? audioFrames - (framesPerScene * i) : framesPerScene,
                                motionEffect: scene.visualEffect || 'ken-burns', sceneReferenceId: `scene-${i}`,
                                x: 50, y: 50, scale: 1, opacity: 1
                            });
                            currentFrame += framesPerScene;
                        });

                        const initialLayers: Layer[] = [
                            { id: 'l1', name: 'Imagen / Video', clips: newVideoTrack },
                            { id: 'l2', name: 'Narración', clips: [{ id: 'a-custom', type: 'audio' as 'audio', src: customVoiceUrl, startFrame: SyncEngine.getIntroFrames(), durationInFrames: audioFrames }] }
                        ];

                        setLayers(initialLayers);
                        setDurationInFrames(totalFrames);
                        setSyncEta(Math.ceil(audioObj.duration));

                        const store = useStudioStore.getState();
                        store.setScenes(scenes);
                        store.setLayers(initialLayers);
                        store.setDurationInFrames(totalFrames);
                        store.setTitle(title);
                        store.setFormat(format);
                        resolve();
                    };
                    audioObj.onerror = reject;
                });
                return;
            }

            const validScenes = scenes.filter(s => s.speech.trim());
            setSyncEta(Math.ceil(validScenes.length * 2));

            const FALLBACK_VOICES: Record<string, string> = { es: 'es-MX-JorgeNeural', en: 'en-US-AndrewNeural' };
            const voiceLang = selectedVoice.startsWith('es') ? 'es' : 'en';

            const generateVoice = async (text: string, voice: string): Promise<Response> => {
                return fetch('/api/admin/video/voice', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text, voice, rate: 1.0 }) });
            };

            const sceneAudioData = await Promise.all(validScenes.map(async (scene, i) => {
                let res = await generateVoice(scene.speech, selectedVoice);
                if (!res.ok) {
                    const fallback = FALLBACK_VOICES[voiceLang] || FALLBACK_VOICES.en;
                    console.warn(`[StudioVoice] Scene ${i+1} failed with ${selectedVoice}, retrying with fallback ${fallback}...`);
                    res = await generateVoice(scene.speech, fallback);
                }
                if (!res.ok) {
                    const errData = await res.json().catch(() => ({}));
                    throw new Error(errData.details || errData.error || `Error en escena ${i+1}: ${selectedVoice}`);
                }
                const data = await res.json();
                console.log(`[StudioVoice] API Result - Scene ${i} - URL: ${data.url}, Duración Servidor: ${(data.duration || 3).toFixed(3)}s`);
                return { url: data.url, wordTimestamps: data.wordTimestamps || [], duration: data.duration || 3 };
            }));

            const updatedScenes = [...scenes];
            let activeValidIdx = 0;
            
            for (let i = 0; i < updatedScenes.length; i++) {
                const scene = updatedScenes[i];
                const isSpeechless = !scene.speech.trim();
                const sceneDurationSec = isSpeechless ? 3 : (sceneAudioData[activeValidIdx]?.duration || 3);
                
                let dynamicAssetUrl = scene.assetUrl;
                if (!dynamicAssetUrl && scene.speech.trim()) {
                    try {
                        const assetRes = await fetch('/api/admin/video/assets', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query: scene.visual || scene.speech, type: 'both', count: 1 }) });
                        if (assetRes.ok) {
                            const assetData = await assetRes.json();
                            if (assetData.results?.length > 0) {
                                dynamicAssetUrl = assetData.results[0].url;
                                console.log(`[Studio Context] Fetched dynamic asset for scene ${i}: ${dynamicAssetUrl}`);
                            }
                        }
                    } catch (e) { console.warn(`[Studio Context] Failed to fetch dynamic asset for scene ${i}`, e); }
                }

                if (!isSpeechless) {
                    const audioData = sceneAudioData[activeValidIdx];
                    updatedScenes[i] = { ...scene, voiceUrl: audioData.url, wordTimestamps: audioData.wordTimestamps, duration: sceneDurationSec, assetUrl: dynamicAssetUrl || scene.visual, titleCardEnabled: true };
                    activeValidIdx++;
                } else {
                    updatedScenes[i] = { ...scene, duration: 1, assetUrl: dynamicAssetUrl || scene.visual };
                }
            }

            const timings = SyncEngine.calculateTimings(updatedScenes);
            const introFrames = SyncEngine.getIntroFrames();
            const outroFrames = SyncEngine.getOutroFrames();
            const totalProjectFrames = SyncEngine.getTotalDurationInFrames(updatedScenes);

            const newVideoTrack: Clip[] = [];
            const newLowerThirdClips: Clip[] = [];
            const newAudioClips: Clip[] = [];
            const usedUrls = new Set<string>();
            const titleCardFrames = SyncEngine.secondsToFrames(SyncEngine.TITLE_CARD_SECONDS);

            if (introFrames > 0) {
                newVideoTrack.push({
                    id: 'c-intro', type: 'overlay', src: 'intro', startFrame: 0, durationInFrames: introFrames,
                    title: new Date().toLocaleDateString(scriptLang === 'es' ? 'es-ES' : 'en-US', { weekday: 'long', month: 'long', day: 'numeric' }).toUpperCase(),
                    ...(introSfxUrl ? { sfxUrl: introSfxUrl, sfxDurationFrames: Math.min(introFrames, 60), sfxVolume: 0.8 } : {})
                });
            }

            timings.forEach((timing, i) => {
                const scene = updatedScenes[i];
                const isTitleCardEnabled = scene.titleCardEnabled !== false;

                if (scene.voiceUrl && scene.speech.trim()) {
                    newAudioClips.push({ id: `a-scene-${i}`, type: 'audio', src: scene.voiceUrl, startFrame: timing.startFrame, durationInFrames: timing.durationInFrames, volume: 1 });
                    if (isTitleCardEnabled) {
                        newLowerThirdClips.push({ id: `lower-third-${i}`, type: 'overlay', src: 'news-lower-third', startFrame: timing.startFrame, durationInFrames: timing.durationInFrames, title: scene.displayHeadline || scene.headline || "LATEST UPDATE", subtitle: scene.speech || "", opacity: 1, scale: 1, x: 50, y: 50 } as any);
                    }
                }

                if (isTitleCardEnabled) {
                    newVideoTrack.push({ id: `v-title-${i}`, type: 'overlay', src: 'news-card', title: scene.displayHeadline || scene.headline || scene.visual.split(',')[0], subtitle: scene.subHeadline, startFrame: timing.startFrame - titleCardFrames, durationInFrames: titleCardFrames, x: 50, y: 50, scale: 1, opacity: 1, ...(newsCardSfxUrl ? { sfxUrl: newsCardSfxUrl, sfxDurationFrames: Math.min(titleCardFrames, 45), sfxVolume: 0.7 } : {}) } as any);
                }

                const hasSegments = scene.mediaSegments && scene.mediaSegments.length > 0;
                const segmentsToUse = hasSegments ? scene.mediaSegments! : findBestMixedMediaBatch(scene.visual || "Tech news", 2, 2, usedUrls).map(m => ({ id: Math.random().toString(36).substr(2, 9), source: 'library' as const, type: m.type, url: m.url, durationPct: 25, motionEffect: 'ken-burns' as const }));
                segmentsToUse.forEach(seg => usedUrls.add(seg.url));

                let segOffset = 0;
                segmentsToUse.forEach((seg, segIdx) => {
                    const isLastSeg = segIdx === segmentsToUse.length - 1;
                    const segFrames = isLastSeg ? timing.durationInFrames - segOffset : Math.round((seg.durationPct / 100) * timing.durationInFrames);
                    newVideoTrack.push({ id: `v-${i}-${segIdx}`, type: seg.type, src: seg.url, startFrame: timing.startFrame + segOffset, durationInFrames: segFrames, motionEffect: seg.motionEffect || scene.visualEffect || 'ken-burns', sceneReferenceId: `scene-${i}` } as any);
                    segOffset += segFrames;
                });
            });

            setScenes(updatedScenes);

            const musicUrlToUse = bgMusicUrl || "/assets/bg-music.mp3";
            const newMusicTrack: Clip[] = [{ id: 'm-background', type: 'music', src: musicUrlToUse, startFrame: 0, durationInFrames: totalProjectFrames, volume: bgMusicVolume }];

            if (outroSfxUrl) {
                newAudioClips.push({ id: `sfx-outro`, type: 'sfx', src: outroSfxUrl, startFrame: totalProjectFrames - outroFrames, durationInFrames: outroFrames, volume: 0.8 });
            }

            const finalLayers: Layer[] = [
                { id: 'l1', name: 'Imagen / Video', clips: newVideoTrack },
                { id: 'l2', name: 'Cintillo / Overlay', clips: newLowerThirdClips },
                { id: 'l3', name: 'Voz / Narración', clips: newAudioClips },
                { id: 'l4', name: 'Música', clips: newMusicTrack },
            ];

            setLayers(finalLayers);
            setDurationInFrames(totalProjectFrames);
            
            const store = useStudioStore.getState();
            store.setScenes(updatedScenes);
            store.setLayers(finalLayers);
            store.setDurationInFrames(totalProjectFrames);
            store.setTitle(title);
            store.setFormat(format);
            store.setVoiceSpeed(voiceSpeed);
            
            pushToHistory(updatedScenes, finalLayers);
        } catch (err: any) {
            logger.error('Failed to prepare assembly data', err);
            args.setError(err.message || 'Could not sync voiceover data.');
            throw err;
        } finally {
            setIsPreparingAssembly(false);
            isPreparingRef.current = false;
        }
    }, [args]);

    return { prepareAssemblyData };
}
