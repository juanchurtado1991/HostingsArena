import { VideoStudioProvider } from "@/contexts/VideoStudioContext";
import { VideoStudio } from "@/components/dashboard";
import Link from 'next/link';
import { ArrowLeft, Film } from 'lucide-react';
import styles from "@/components/dashboard/VideoStudio.module.css";
import { cn } from "@/lib/utils";

export default async function StudioPage({ params }: { params: Promise<{ lang: string }> }) {
    const { lang } = await params;
    return (
        <VideoStudioProvider initialLang={lang}>
            <div className={cn("flex flex-col h-screen w-screen overflow-hidden relative video-studio-area", styles.glassEngine)}>
                
                {/* Minimal Top Navigation - Glassified */}
                {/* Unified Studio Header is now handled by WorkflowNavigation inside VideoStudio */}
                
                {/* Main Studio Area */}
                <main className="flex-1 overflow-y-auto overflow-x-hidden relative z-10 custom-scrollbar">
                    <div className="w-full">
                        <VideoStudio dict={{}} lang={lang} />
                    </div>
                </main>

            </div>
        </VideoStudioProvider>
    );
}
