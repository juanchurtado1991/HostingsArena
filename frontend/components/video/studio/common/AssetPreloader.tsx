"use client";
import { useEffect, useRef } from 'react';
import { Scene } from '@/contexts/VideoStudioContext';
import { logger } from '@/lib/logger';

interface AssetPreloaderProps {
    scenes: Scene[];
}

/**
 * Silently preloads assets (images and videos) to the browser cache
 * to ensure a smooth transition and instant playback in Phase 3 (NLE).
 */
export function AssetPreloader({ scenes }: AssetPreloaderProps) {
    const preloadedUrls = useRef<Set<string>>(new Set());

    useEffect(() => {
        if (!scenes || scenes.length === 0) return;

        scenes.forEach(scene => {
            // Collect all potential target URLs
            const urls: { url: string; type: 'image' | 'video' }[] = [];
            
            if (scene.mediaSegments) {
                scene.mediaSegments.forEach(seg => {
                    urls.push({ url: seg.url, type: seg.type as any });
                });
            } else if (scene.assetUrl) {
                urls.push({ url: scene.assetUrl, type: scene.assetType as any });
            }

            // Preload each unique URL
            urls.forEach(({ url, type }) => {
                if (!url || preloadedUrls.current.has(url)) return;

                if (type === 'image') {
                    const img = new Image();
                    img.src = url;
                    preloadedUrls.current.add(url);
                    logger.log('SYSTEM', `Preloading image: ${url.substring(0, 50)}...`);
                } else if (type === 'video') {
                    const video = document.createElement('video');
                    video.src = url;
                    video.preload = 'auto';
                    video.muted = true;
                    // We don't need to append it, setting src with preload="auto" usually triggers the fetch
                    preloadedUrls.current.add(url);
                    logger.log('SYSTEM', `Preloading video: ${url.substring(0, 50)}...`);
                }
            });
        });
    }, [scenes]);

    return null; // Invisible component
}
