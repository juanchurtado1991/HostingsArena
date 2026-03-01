"use client";

import React from 'react';
import { useVideoStudio } from '@/contexts/VideoStudioContext';
import { Phase1Ideation } from '@/components/video/studio/Phase1Ideation';
import { Phase2Creative } from '@/components/video/studio/Phase2Creative';
import { Phase3Editor } from '@/components/video/studio/Phase3Editor';
import { Phase4Export } from '@/components/video/studio/Phase4Export';
import { WorkflowNavigation } from '@/components/video/studio/WorkflowNavigation';
import { Film, Smartphone, Monitor as MonitorIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import styles from './VideoStudio.module.css';

interface VideoStudioProps {
    dict: any;
    lang: string;
}

export function VideoStudio({ dict, lang }: VideoStudioProps) {
    const { currentPhase, format, setFormat } = useVideoStudio();

    return (
        <div className={styles.glassEngine}>
            <div className={styles.studioContent}>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12" style={{ display: 'none' }}>
                    {/* Header removed as per user request to save space */}
                </div>

                <div className={cn("w-full transition-all duration-700", currentPhase === 3 ? styles.maxGrow : "max-w-[1600px] mx-auto")}>
                    <WorkflowNavigation />
                    
                    <div className={cn(
                        "relative pt-1 transition-all duration-500", 
                        currentPhase === 3 ? "px-4 pb-2" : "px-8 pb-6 rounded-2xl overflow-hidden shadow-sm border border-black/5"
                    )}>
                        {currentPhase === 1 && <Phase1Ideation />}
                        {currentPhase === 2 && <Phase2Creative />}
                        {currentPhase === 3 && <Phase3Editor />}
                        {currentPhase === 4 && <Phase4Export />}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default VideoStudio;
