import React from "react";
import { Copy, Check } from "lucide-react";

interface SocialContentCardProps {
    platform: 'twitter' | 'facebook' | 'linkedin';
    title: string;
    content: string;
    isCopied: boolean;
    onCopy: () => void;
    activeLang: 'en' | 'es';
    platformIcon: React.ReactNode;
    height?: string;
}

export function SocialContentCard({ 
    platform, title, content, isCopied, onCopy, activeLang, platformIcon, height = "h-24"
}: SocialContentCardProps) {
    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-semibold">
                    {platformIcon}
                    <span className="text-sm">{title}</span>
                </div>
                {content && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onCopy(); }}
                        className={`text-xs flex items-center gap-1.5 font-bold transition-all ${isCopied ? 'text-green-500' : 'text-zinc-400 hover:text-zinc-900 dark:hover:text-white'}`}
                    >
                        {isCopied
                            ? <><Check className="w-3.5 h-3.5" /> {activeLang === 'en' ? "Copied" : "Copiado"}</>
                            : <><Copy className="w-3.5 h-3.5" /> {activeLang === 'en' ? "Copy" : "Copiar"}</>
                        }
                    </button>
                )}
            </div>
            <div className="relative group">
                <textarea
                    readOnly
                    className={`w-full ${height} p-4 text-xs font-mono bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 rounded-2xl resize-none text-zinc-600 dark:text-zinc-400 focus:outline-none`}
                    value={content || (activeLang === 'en' ? "No content generated" : "Sin contenido generado")}
                />
                {content && (
                    <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl pointer-events-none flex items-center justify-center">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                            {activeLang === 'en' ? "Read Only" : "Solo lectura"}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}
