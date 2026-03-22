"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Music, Upload, CheckCircle, Activity, Loader2 } from "lucide-react";
import { ALL_AUDIO, type AudioItem, loadAudioData, isAudioLibraryLoaded } from "@/components/video/audioLibrary";
import { logger } from "@/lib/logger";
import { PickerBase } from "./pickers/PickerBase";
import { PickerSidebar, PickerMonitor } from "./pickers/PickerSidebar";
import { PickerSearch } from "./pickers/PickerSearch";
import { AudioGridItem } from "./pickers/AudioGridItem";
import { usePickerPagination } from "./pickers/usePickerPagination";

interface AudioPickerProps {
    isOpen: boolean;
    onConfirm: (url: string, label: string) => void;
    onClose: () => void;
    selectedUrl?: string;
    title?: string;
}

export function AudioPicker({ isOpen, onConfirm, onClose, selectedUrl, title = "Audio Library" }: AudioPickerProps) {
    const [search, setSearch] = useState("");
    const [tab, setTab] = useState<'all' | 'import'>('all');
    const [playingUrl, setPlayingUrl] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [selectedItem, setSelectedItem] = useState<AudioItem | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [isLoaded, setIsLoaded] = useState(isAudioLibraryLoaded());

    useEffect(() => {
        if (isOpen) {
            if (!isAudioLibraryLoaded()) {
                loadAudioData().then(() => setIsLoaded(true));
            } else if (!isLoaded) {
                setIsLoaded(true);
            }
        }
    }, [isOpen, isLoaded]);

    const filteredAudio = useMemo(() => {
        if (!isLoaded) return [];
        return ALL_AUDIO.filter(a => 
            a.label.toLowerCase().includes(search.toLowerCase()) ||
            (a.keywords && a.keywords.some(k => k.toLowerCase().includes(search.toLowerCase())))
        );
    }, [search, isLoaded]);

    const { visibleItems, handleScroll } = usePickerPagination(filteredAudio, 50, 50, [search, isLoaded]);

    useEffect(() => {
        if (selectedUrl) {
            const item = ALL_AUDIO.find(a => a.url === selectedUrl);
            if (item) setSelectedItem(item);
        }
    }, [selectedUrl]);

    const togglePlay = (url: string) => {
        if (playingUrl === url) {
            audioRef.current?.pause();
            setPlayingUrl(null);
            return;
        }
        if (audioRef.current) audioRef.current.pause();
        const audio = new Audio(url);
        audio.play();
        audioRef.current = audio;
        setPlayingUrl(url);
        audio.onended = () => setPlayingUrl(null);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setIsUploading(true);
        try {
            const url = URL.createObjectURL(file);
            const newItem: AudioItem = { id: `upload-${Date.now()}`, label: file.name, url, type: 'music', keywords: ['upload'] };
            setSelectedItem(newItem);
        } catch (error) { logger.error("Upload failed", { error }); } finally { setIsUploading(false); }
    };

    const handleClose = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
        setPlayingUrl(null);
        onClose();
    };

    // Stop audio on close (handles both 'X' and 'Use this audio' if parent closes picker)
    useEffect(() => {
        if (!isOpen && audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            setPlayingUrl(null);
        }
    }, [isOpen]);


    return (
        <PickerBase
            isOpen={isOpen} onClose={handleClose} title={title}
            subtitle="Premium acoustic signatures and soundscapes."
            tabs={['all', 'import'] as const}
            activeTab={tab} onTabChange={setTab}
            renderTabLabel={t => t === 'all' ? '🎵 EVERYTHING' : '📤 IMPORT'}
            sidebar={
                <PickerSidebar 
                    icon={<Activity className="w-4 h-4" />}
                    isPlaying={!!playingUrl}
                    onConfirm={() => {
                        if (selectedItem) {
                            if (audioRef.current) {
                                audioRef.current.pause();
                                audioRef.current.currentTime = 0;
                            }
                            setPlayingUrl(null);
                            onConfirm(selectedItem.url, selectedItem.label);
                        }
                    }}
                    confirmDisabled={!selectedItem}
                    confirmLabel="Engage Neural Audio"
                >
                    <PickerMonitor isPlaying={!!playingUrl} icon={<Music className="w-16 h-16 text-zinc-900" />} active={!!selectedItem}>
                        {playingUrl && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="flex items-end gap-1.5 h-16">
                                    {[1, 2, 3, 4, 5, 4, 3, 2, 1].map((n, i) => (
                                        <div 
                                            key={i} 
                                            className="w-1.5 bg-studio-accent rounded-full animate-pulse-waveform"
                                            style={{ height: `${20 + Math.random() * 80}%`, animationDelay: `${i * 0.1}s` }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </PickerMonitor>
                </PickerSidebar>
            }
        >
            {tab === 'all' ? (
                <>
                    <PickerSearch value={search} onChange={setSearch} placeholder="Identify auditory frequency or tag..." />
                    <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar" onScroll={handleScroll}>
                        <div className="space-y-3">
                            {visibleItems.map(audio => (
                                <AudioGridItem 
                                    key={audio.id} item={audio} 
                                    isPlaying={playingUrl === audio.url} 
                                    isSelected={selectedItem?.id === audio.id} 
                                    onClick={() => setSelectedItem(audio)} 
                                    onTogglePlay={(e) => { e.stopPropagation(); togglePlay(audio.url); }} 
                                />
                            ))}
                        </div>
                    </div>
                </>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-8">
                    <div className="w-32 h-32 rounded-[2.5rem] bg-black/5 flex items-center justify-center text-zinc-400 border border-black/5 shadow-inner">
                        {isUploading ? <Loader2 className="w-14 h-14 animate-spin text-studio-accent" /> : <Upload className="w-14 h-14" />}
                    </div>
                    <div className="space-y-4">
                        <h4 className="text-3xl font-black uppercase tracking-[0.1em] text-zinc-900 italic">Import Stream</h4>
                        <p className="text-[10px] text-zinc-400 max-w-[320px] mx-auto uppercase font-black tracking-[0.25em] opacity-80">Support for lossless WAV, FLAC, and high-fidelity MP3 mastering.</p>
                    </div>
                    <Button onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="h-16 px-12 rounded-2xl bg-black/5 text-studio-accent font-black uppercase tracking-[0.3em] text-[11px] shadow-sm">
                        {isUploading ? 'Encoding Stream...' : 'Target Local File'}
                    </Button>
                    <input type="file" ref={fileInputRef} className="hidden" accept="audio/*" onChange={handleFileUpload} />
                </div>
            )}
        </PickerBase>
    );
}