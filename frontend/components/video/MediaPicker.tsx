"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Image as ImageIcon, Video as VideoIcon, Upload, Loader2, Activity } from "lucide-react";
import { ALL_MEDIA, type MediaItem, loadMediaData, isMediaLibraryLoaded } from "@/components/video/mediaLibrary";
import { logger } from "@/lib/logger";
import { PickerBase } from "./pickers/PickerBase";
import { PickerSidebar, PickerMonitor } from "./pickers/PickerSidebar";
import { PickerSearch } from "./pickers/PickerSearch";
import { MediaGridItem } from "./pickers/MediaGridItem";
import { usePickerPagination } from "./pickers/usePickerPagination";

interface MediaPickerProps {
    isOpen: boolean;
    onConfirm: (url: string, type: 'image' | 'video', label: string) => void;
    onClose: () => void;
    selectedUrl?: string;
    title?: string;
}

export function MediaPicker({ isOpen, onConfirm, onClose, selectedUrl, title = "Visual Assets" }: MediaPickerProps) {
    const [search, setSearch] = useState("");
    const [tab, setTab] = useState<'images' | 'videos' | 'import'>('images');
    const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [libraryLoaded, setLibraryLoaded] = useState(isMediaLibraryLoaded());

    useEffect(() => {
        if (isOpen && !isMediaLibraryLoaded()) {
            loadMediaData().then(() => setLibraryLoaded(true));
        }
    }, [isOpen]);

    const filteredMedia = useMemo(() => {
        return ALL_MEDIA.filter(m => {
            const matchesSearch = m.keywords.some(k => k.toLowerCase().includes(search.toLowerCase())) ||
                                m.url.toLowerCase().includes(search.toLowerCase());
            const matchesTab = tab === 'import' ? true : (tab === 'images' ? m.type === 'image' : m.type === 'video');
            return matchesSearch && matchesTab;
        });
    }, [search, libraryLoaded, tab]);

    const { visibleItems, handleScroll } = usePickerPagination(filteredMedia, 30, 30, [search, libraryLoaded, tab]);

    useEffect(() => {
        if (selectedUrl) {
            const item = ALL_MEDIA.find(m => m.url === selectedUrl);
            if (item) setSelectedItem(item);
        }
    }, [selectedUrl]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setIsUploading(true);
        try {
            const url = URL.createObjectURL(file);
            const type: 'image' | 'video' = file.type.startsWith('video') ? 'video' : 'image';
            const newItem: MediaItem = { url, type, keywords: ['custom', 'upload'] };
            setSelectedItem(newItem);
            setTab('import');
        } catch (error) { logger.error("Upload failed", { error }); } finally { setIsUploading(false); }
    };

    return (
        <PickerBase
            isOpen={isOpen} onClose={onClose} title={title}
            subtitle="Premium stock footage and high-fidelity visuals."
            tabs={['images', 'videos', 'import'] as const}
            activeTab={tab} onTabChange={setTab}
            renderTabLabel={t => t === 'images' ? '🖼️ IMAGES' : t === 'videos' ? '🎥 VIDEOS' : '📤 IMPORT'}
            sidebar={
                <PickerSidebar 
                    icon={<Activity className="w-4 h-4" />}
                    isPlaying={false}
                    onConfirm={() => selectedItem && onConfirm(selectedItem.url, selectedItem.type, selectedItem.keywords[0] || 'Asset')}
                    confirmDisabled={!selectedItem}
                    confirmLabel="Engage Neural Visual"
                >
                    <PickerMonitor isPlaying={false} icon={<ImageIcon className="w-16 h-16 text-zinc-900" />} active={!!selectedItem}>
                        {selectedItem && (
                            <div className="absolute inset-0 z-20 overflow-hidden rounded-[2.5rem]">
                                {selectedItem.type === 'video' ? (
                                    <video src={selectedItem.url} className="w-full h-full object-cover" autoPlay muted loop />
                                ) : (
                                    <img src={selectedItem.url} className="w-full h-full object-cover" alt="" />
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                                {/* removed text overlay for consistency */}
                            </div>
                        )}
                        {!selectedItem && (
                             <div className="absolute inset-x-6 bottom-32 opacity-20">
                                 <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-studio-accent to-transparent" />
                             </div>
                        )}
                    </PickerMonitor>
                </PickerSidebar>
            }
        >
            {tab !== 'import' ? (
                <>
                    <PickerSearch value={search} onChange={setSearch} placeholder={tab === 'images' ? "Scan for visual signatures..." : "Scan for kinetic cinematography..."} />
                    <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar" onScroll={handleScroll}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {visibleItems.map((item, idx) => (
                                <MediaGridItem key={`${item.url}-${idx}`} item={item} isSelected={selectedItem?.url === item.url} onClick={() => setSelectedItem(item)} />
                            ))}
                        </div>
                    </div>
                </>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-8">
                    <div className="w-32 h-32 rounded-[2.5rem] bg-black/5 flex items-center justify-center text-zinc-400 border border-black/5 shadow-inner">
                        {isUploading ? <Loader2 className="w-14 h-14 animate-spin text-studio-accent" /> : <Upload className="w-14 h-14" />}
                    </div>
                    <div className="space-y-4 text-center">
                        <h4 className="text-3xl font-black uppercase tracking-[0.1em] text-zinc-900 italic">Import Asset</h4>
                        <p className="text-[10px] text-zinc-400 max-w-[320px] mx-auto uppercase font-black tracking-[0.25em] opacity-80">Support for RAW CinemaDNG, 10-bit HEVC, and Pro-Log workflows.</p>
                    </div>
                    <Button onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="h-16 px-12 rounded-2xl bg-black/5 text-studio-accent font-black uppercase tracking-[0.3em] text-[11px] shadow-sm">
                        {isUploading ? 'Encoding Stream...' : 'Target Local File'}
                    </Button>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*,video/*" onChange={handleFileUpload} />
                </div>
            )}
        </PickerBase>
    );
}