"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Globe, Sparkles, Loader2, Play, Activity } from "lucide-react";
import { logger } from "@/lib/logger";
import { PickerBase } from "./pickers/PickerBase";
import { PickerSidebar, PickerMonitor } from "./pickers/PickerSidebar";
import { PickerSearch } from "./pickers/PickerSearch";
import { VoiceGridItem } from "./pickers/VoiceGridItem";
import { usePickerPagination } from "./pickers/usePickerPagination";

interface VoiceItem {
    id: string;
    name: string;
    gender?: 'male' | 'female';
    accent?: string;
    descriptive?: string;
    preview_url?: string;
    language: 'english' | 'spanish';
}

interface VoicePickerProps {
    isOpen: boolean;
    onConfirm: (wid: string) => void;
    onClose: () => void;
    selectedWid?: string;
}

export function VoicePicker({ isOpen, onConfirm, onClose, selectedWid }: VoicePickerProps) {
    const [search, setSearch] = useState("");
    const [tab, setTab] = useState<'english' | 'spanish'>('english');
    const [voices, setVoices] = useState<VoiceItem[]>([]);
    const [playingId, setPlayingId] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [loading, setLoading] = useState(false);
    const [selectedVoice, setSelectedVoice] = useState<VoiceItem | null>(null);
    const [previewLoading, setPreviewLoading] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) fetchVoices();
    }, [isOpen]);

    useEffect(() => {
        if (selectedWid && voices.length > 0) {
            const voice = voices.find(v => v.id === selectedWid);
            if (voice) setSelectedVoice(voice);
        }
    }, [selectedWid, voices]);

    // Stop audio on close
    useEffect(() => {
        if (!isOpen && audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            setPlayingId(null);
        }
    }, [isOpen]);

    const fetchVoices = async () => {
        setLoading(true);
        try {
            console.log("VoicePicker: Fetching local Microsoft/Edge voices...");
            const res = await fetch('/api/admin/video/voice?lang=all');
            if (!res.ok) throw new Error(`Voice API error: ${res.status}`);
            
            const data = await res.json();
            if (!data.voices) throw new Error("VoicePicker: No voices found in API response.");
            
            const formatted = data.voices.map((v: any) => ({
                id: v.id,
                name: v.name,
                gender: v.gender,
                accent: v.accent,
                descriptive: v.descriptive || v.description,
                preview_url: `/voices/previews/${v.id}.webm`, // Corrected local path
                language: v.id.startsWith('es-') ? 'spanish' : 'english'
            }));

            console.log(`VoicePicker: Loaded ${formatted.length} voices (${formatted.filter((v: any) => v.language === 'spanish').length} Spanish).`);
            setVoices(formatted);
        } catch (error) { 
            logger.error("Fetch voices failed", { error }); 
            console.error("VoicePicker Error:", error);
        } finally { 
            setLoading(false); 
        }
    };

    const filteredVoices = useMemo(() => {
        return voices.filter(v => {
            const matchesSearch = v.name.toLowerCase().includes(search.toLowerCase()) || 
                                (v.accent && v.accent.toLowerCase().includes(search.toLowerCase()));
            const matchesTab = v.language === tab;
            return matchesSearch && matchesTab;
        });
    }, [voices, search, tab]);

    const { visibleItems, handleScroll } = usePickerPagination(filteredVoices, 30, 30, [search, tab]);

    const togglePreview = async (voice: VoiceItem) => {
        if (playingId === voice.id) {
            audioRef.current?.pause();
            setPlayingId(null);
            return;
        }

        if (audioRef.current) audioRef.current.pause();

        if (voice.preview_url) {
            try {
                audioRef.current = new Audio(voice.preview_url);
                await audioRef.current.play();
                setPlayingId(voice.id);
                audioRef.current.onended = () => setPlayingId(null);
            } catch (err: any) {
                console.error("VoicePicker: Audio playback failed", err);
                if (err.name === 'NotSupportedError') {
                    logger.error("Format Not Supported", { url: voice.preview_url });
                }
                setPlayingId(null);
            }
        }
    };




    const handleClose = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
        setPlayingId(null);
        onClose();
    };

    return (
        <PickerBase
            isOpen={isOpen} onClose={handleClose} title="Neural Voice Synthesis"
            subtitle="Master-grade AI clones and premade signature timbres."
            tabs={['english', 'spanish'] as const}
            activeTab={tab} onTabChange={setTab}
            renderTabLabel={t => t === 'english' ? '🇺🇸 ENGLISH' : '🇪🇸 SPANISH'}
            sidebar={
                <PickerSidebar 
                    icon={<Activity className="w-4 h-4" />}
                    isPlaying={!!playingId}
                    onConfirm={() => {
                        if (selectedVoice) {
                            if (audioRef.current) {
                                audioRef.current.pause();
                                audioRef.current.currentTime = 0;
                            }
                            setPlayingId(null);
                            onConfirm(selectedVoice.id);
                        }
                    }}
                    confirmDisabled={!selectedVoice}
                    confirmLabel="Engage Neural Voice"
                >
                    <PickerMonitor isPlaying={!!playingId} icon={<Mic className="w-16 h-16 text-zinc-900" />} active={!!selectedVoice}>
                        {playingId && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="flex items-end gap-1.5 h-16">
                                    {[1, 2, 3, 4, 3, 2, 1].map((n, i) => (
                                        <div 
                                            key={i} 
                                            className="w-1.5 bg-studio-accent rounded-full animate-pulse-waveform"
                                            style={{ height: `${30 + Math.random() * 70}%`, animationDelay: `${i * 0.15}s` }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                        {selectedVoice && !playingId && (
                             <div className="absolute inset-x-6 bottom-32 opacity-20">
                                 <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-studio-accent to-transparent" />
                             </div>
                        )}
                    </PickerMonitor>
                </PickerSidebar>
            }
        >
            <PickerSearch value={search} onChange={setSearch} placeholder={tab === 'spanish' ? "Identifica firma vocal o acento..." : "Identify vocal signature or accent..."} />
            
            <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar space-y-3" onScroll={handleScroll}>
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-64 space-y-4">
                        <Loader2 className="w-10 h-10 animate-spin text-studio-accent" />
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Synchronizing ElevenLabs Cloud...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         {visibleItems.map(voice => (
                            <VoiceGridItem 
                                key={voice.id} voice={voice} 
                                isPlaying={playingId === voice.id} 
                                isSelected={selectedVoice?.id === voice.id} 
                                isLoading={previewLoading === voice.id}
                                onClick={() => setSelectedVoice(voice)} 
                                onPreview={(e) => { e.stopPropagation(); togglePreview(voice); }} 
                            />
                        ))}
                    </div>
                )}
            </div>
        </PickerBase>
    );
}
