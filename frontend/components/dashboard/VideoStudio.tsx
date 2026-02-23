"use client";

import { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { 
    Play, Sparkles, Volume2, Image as ImageIcon, 
    RefreshCw, Wand2, Monitor, Smartphone, 
    ChevronRight, CheckCircle2, AlertCircle,
    Music, Film, Type, Languages
} from "lucide-react";
import { logger } from "@/lib/logger";

interface VideoStudioProps {
    dict: any;
    lang: string;
}

const VOICES = [
    { id: "alloy", label: "Alloy", desc: "Versatile, balanced" },
    { id: "echo", label: "Echo", desc: "Deep, athletic" },
    { id: "fable", label: "Fable", desc: "British, accented" },
    { id: "onyx", label: "Onyx", desc: "Authoritative, male" },
    { id: "nova", label: "Nova", desc: "Energetic, female" },
    { id: "shimmer", label: "Shimmer", desc: "Clear, soft" },
];

export function VideoStudio({ dict, lang }: VideoStudioProps) {
    const [selectedProvider, setSelectedProvider] = useState<string>("");
    const [providers, setProviders] = useState<any[]>([]);
    const [loadingProviders, setLoadingProviders] = useState(true);
    const [script, setScript] = useState("");
    const [isGeneratingScript, setIsGeneratingScript] = useState(false);
    const [selectedVoice, setSelectedVoice] = useState("nova");
    const [format, setFormat] = useState<"9:16" | "16:9">("9:16");
    const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
    const [isPlayingPreview, setIsPlayingPreview] = useState(false);
    const [previewAudio, setPreviewAudio] = useState<HTMLAudioElement | null>(null);

    useEffect(() => {
        fetchProviders();
    }, []);

    const fetchProviders = async () => {
        try {
            const res = await fetch('/api/providers?type=hosting');
            const data = await res.json();
            if (Array.isArray(data)) setProviders(data);
        } catch (error) {
            logger.error("Failed to fetch providers for Studio", error);
        } finally {
            setLoadingProviders(false);
        }
    };

    const generateScript = async () => {
        if (!selectedProvider) return;
        setIsGeneratingScript(true);
        try {
            const res = await fetch('/api/admin/video/script', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ providerId: selectedProvider, format, lang })
            });
            const data = await res.json();
            if (data.script) setScript(data.script);
        } catch (error) {
            logger.error("Failed to generate script", error);
        } finally {
            setIsGeneratingScript(false);
        }
    };

    const playVoicePreview = async () => {
        if (!script) return;
        if (isPlayingPreview && previewAudio) {
            previewAudio.pause();
            setIsPlayingPreview(false);
            return;
        }

        setIsPlayingPreview(true);
        try {
            const res = await fetch('/api/admin/video/voice', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: script, voice: selectedVoice })
            });

            if (!res.ok) throw new Error("Failed to fetch audio");
            
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const audio = new Audio(url);
            
            audio.onended = () => {
                setIsPlayingPreview(false);
                setPreviewAudio(null);
            };

            setPreviewAudio(audio);
            audio.play();
        } catch (error) {
            logger.error("Failed to play preview", error);
            setIsPlayingPreview(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Play className="w-6 h-6 text-primary" />
                        Video Studio <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full uppercase tracking-widest font-bold">Beta</span>
                    </h2>
                    <p className="text-muted-foreground">Automated YouTube Shorts & TikTok generator.</p>
                </div>
                <div className="flex gap-2">
                    <Button 
                        variant={format === "9:16" ? "default" : "outline"} 
                        size="sm" 
                        onClick={() => setFormat("9:16")}
                        className="gap-2"
                    >
                        <Smartphone className="w-4 h-4" /> Shorts (9:16)
                    </Button>
                    <Button 
                        variant={format === "16:9" ? "default" : "outline"} 
                        size="sm" 
                        onClick={() => setFormat("16:9")}
                        className="gap-2"
                    >
                        <Monitor className="w-4 h-4" /> Video (16:9)
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column: Configuration */}
                <div className="lg:col-span-8 space-y-6">
                    {/* Step 1: Provider Selection */}
                    <GlassCard className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                <span className="font-bold">1</span>
                            </div>
                            <h3 className="font-bold">Target Provider</h3>
                        </div>
                        <select 
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer"
                            value={selectedProvider}
                            onChange={(e) => setSelectedProvider(e.target.value)}
                        >
                            <option value="">Select a provider...</option>
                            {providers.map(p => (
                                <option key={p.id} value={p.id}>{p.provider_name}</option>
                            ))}
                        </select>
                    </GlassCard>

                    {/* Step 2: AI Script */}
                    <GlassCard className="p-6">
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                    <span className="font-bold">2</span>
                                </div>
                                <h3 className="font-bold">AI Video Script</h3>
                            </div>
                            <Button 
                                size="sm" 
                                variant="secondary" 
                                disabled={!selectedProvider || isGeneratingScript}
                                onClick={generateScript}
                                className="gap-2 h-8"
                            >
                                <Sparkles className={cn("w-3.5 h-3.5", isGeneratingScript && "animate-spin")} />
                                {lang === 'es' ? 'Generar Guion' : 'Generate Script'}
                            </Button>
                        </div>
                        <textarea 
                            className="w-full h-48 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none placeholder:text-muted-foreground/30"
                            placeholder="Select a provider and click generate, or write your own script here..."
                            value={script}
                            onChange={(e) => setScript(e.target.value)}
                        />
                        <div className="mt-2 text-[10px] text-muted-foreground flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            AI will use audited price and technical data for higher conversion.
                        </div>
                    </GlassCard>

                    {/* Step 3: Voice & Style */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <GlassCard className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                    <span className="font-bold">3</span>
                                </div>
                                <h3 className="font-bold">Voice Model</h3>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                {VOICES.map(voice => (
                                    <div
                                        key={voice.id}
                                        onClick={() => setSelectedVoice(voice.id)}
                                        onKeyDown={(e) => e.key === 'Enter' && setSelectedVoice(voice.id)}
                                        role="button"
                                        tabIndex={0}
                                        className={cn(
                                            "flex flex-col items-start p-3 rounded-xl border text-left transition-all cursor-pointer",
                                            selectedVoice === voice.id 
                                                ? "bg-primary/20 border-primary" 
                                                : "bg-white/5 border-transparent hover:bg-white/10"
                                        )}
                                    >
                                        <div className="flex items-center justify-between w-full mb-1">
                                            <span className="font-bold text-xs">{voice.label}</span>
                                            {selectedVoice === voice.id && (
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); playVoicePreview(); }}
                                                    className="p-1 hover:bg-primary/20 rounded-lg transition-colors"
                                                >
                                                    {isPlayingPreview ? (
                                                        <RefreshCw className="w-3 h-3 animate-spin text-primary" />
                                                    ) : (
                                                        <Volume2 className="w-3 h-3 text-primary" />
                                                    )}
                                                </button>
                                            )}
                                        </div>
                                        <span className="text-[10px] text-muted-foreground">{voice.desc}</span>
                                    </div>
                                ))}
                            </div>
                        </GlassCard>

                        <GlassCard className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                    <span className="font-bold">4</span>
                                </div>
                                <h3 className="font-bold">Visual Themes</h3>
                            </div>
                            <div className="space-y-2">
                                {[
                                    { id: 'glass', icon: Monitor, label: 'Modern Glass' },
                                    { id: 'dark', icon: Film, label: 'Cyber Dark' },
                                    { id: 'clean', icon: Type, label: 'Minimal Light' },
                                ].map(theme => (
                                    <div key={theme.id} className="flex items-center justify-between p-2.5 rounded-lg bg-white/5 border border-white/10 cursor-not-allowed opacity-50">
                                        <div className="flex items-center gap-2">
                                            <theme.icon className="w-4 h-4 text-muted-foreground" />
                                            <span className="text-xs font-medium">{theme.label}</span>
                                        </div>
                                        <div className="w-4 h-4 rounded-full border border-white/20" />
                                    </div>
                                ))}
                            </div>
                        </GlassCard>
                    </div>
                </div>

                {/* Right Column: Preview & Action */}
                <div className="lg:col-span-4 space-y-6">
                    <GlassCard className="p-4 flex flex-col items-center justify-center min-h-[400px] relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-purple-500/10 opacity-50" />
                        
                        <div className={cn(
                            "relative z-10 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center p-8 text-center transition-all bg-background/50 backdrop-blur-sm",
                            format === "9:16" ? "aspect-[9/16] w-full max-w-[240px]" : "aspect-video w-full"
                        )}>
                            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Film className="w-8 h-8 text-primary" />
                            </div>
                            <h4 className="font-bold text-sm mb-2">Video Preview</h4>
                            <p className="text-[10px] text-muted-foreground">The AI will compose clips, text overlays and voiceover in real-time.</p>
                        </div>

                        <div className="absolute bottom-6 left-6 right-6 z-20">
                            <Button 
                                className="w-full py-6 rounded-2xl text-lg font-black shadow-2xl shadow-primary/30 gap-2"
                                disabled={!selectedProvider || !script || isGeneratingVideo}
                            >
                                {isGeneratingVideo ? (
                                    <RefreshCw className="w-6 h-6 animate-spin" />
                                ) : (
                                    <>
                                        <Wand2 className="w-6 h-6" />
                                        RENDER VIDEO
                                    </>
                                )}
                            </Button>
                        </div>
                    </GlassCard>

                    <GlassCard className="p-6 border-amber-500/20 bg-amber-500/5">
                        <h4 className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <Languages className="w-4 h-4" /> Localization
                        </h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            HostingArena defaults to **{lang.toUpperCase()}**. The script and voiceover will be generated in this language.
                        </p>
                    </GlassCard>
                </div>
            </div>
        </div>
    );
}
