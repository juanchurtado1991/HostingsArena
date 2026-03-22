import React from "react";
import { Globe, Clock, ExternalLink, Loader2, CheckCircle, XCircle } from "lucide-react";

interface PlatformStatusProps {
    status: 'loading' | 'success' | 'error';
    indexingStatus: 'idle' | 'loading' | 'success' | 'error';
    isScheduled: boolean;
    scheduledDateStr: string;
    finalPostUrl: string;
}

export function PlatformStatus({ 
    status, indexingStatus, isScheduled, scheduledDateStr, finalPostUrl 
}: PlatformStatusProps) {
    return (
        <div className="flex flex-col gap-3 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white dark:bg-zinc-700 rounded-lg shadow-sm">
                        <Globe className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">HostingArena</span>
                        <span className="text-xs text-zinc-500">{isScheduled ? `Programado (${scheduledDateStr})` : "Post en vivo"}</span>
                    </div>
                </div>
                {status === 'success' && !isScheduled ? (
                    <a
                        href={finalPostUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2 rounded-full bg-blue-50 text-blue-600 text-xs font-bold hover:bg-blue-100 transition-colors flex items-center gap-2"
                    >
                        Ver Post <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                ) : (status === 'success' && isScheduled ? (
                    <span className="px-4 py-2 rounded-full bg-amber-50 text-amber-600 text-xs font-bold flex items-center gap-2">
                        Oculto <Clock className="w-3.5 h-3.5" /> 
                    </span>
                ) : (
                    <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
                ))}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white dark:bg-zinc-700 rounded-lg shadow-sm border border-zinc-100 dark:border-zinc-600">
                        <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true"><path fill="#EA4335" d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .533 5.333.533 12S5.867 24 12.48 24c3.44 0 6.013-1.147 8.027-3.24 2.053-2.053 2.627-5.307 2.627-7.6 0-.747-.08-1.28-.173-1.813h-10.48z"></path></svg>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Google Search</span>
                        <span className="text-xs text-zinc-500">Indexación Instantánea</span>
                    </div>
                </div>

                {indexingStatus === 'loading' && (
                    <div className="px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-bold flex items-center gap-1.5 animate-pulse">
                        <Loader2 className="w-3 h-3 animate-spin" /> Enviando
                    </div>
                )}
                {indexingStatus === 'success' && (
                    <div className="px-3 py-1.5 rounded-full bg-green-50 text-green-600 text-[10px] font-bold flex items-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5" /> Indexado
                    </div>
                )}
                {indexingStatus === 'error' && (
                    <div className="px-3 py-1.5 rounded-full bg-red-50 text-red-600 text-[10px] font-bold flex items-center gap-1.5">
                        <XCircle className="w-3.5 h-3.5" /> Error
                    </div>
                )}
                {indexingStatus === 'idle' && (
                    <div className="px-3 py-1.5 rounded-full bg-zinc-100 text-zinc-400 text-[10px] font-bold">
                        Pendiente
                    </div>
                )}
            </div>
        </div>
    );
}
