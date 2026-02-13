import { useState } from "react";
import { CheckCircle, XCircle, Loader2, Globe, ExternalLink, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PublishSummaryModalProps {
    isOpen: boolean;
    onClose: () => void;
    status: 'loading' | 'success' | 'error';
    postUrl: string;
    socialContent?: {
        twitter?: string;
        facebook?: string;
        linkedin?: string;
        hashtags?: string[];
    };
    indexingStatus?: 'idle' | 'loading' | 'success' | 'error';
    errorDetails?: string;
}

export function PublishSummaryModal({
    isOpen,
    onClose,
    status,
    postUrl,
    socialContent,
    errorDetails,
    indexingStatus = 'idle'
}: PublishSummaryModalProps) {
    const [copiedTw, setCopiedTw] = useState(false);
    const [copiedFb, setCopiedFb] = useState(false);
    const [copiedLi, setCopiedLi] = useState(false);

    if (!isOpen) return null;

    const handleCopy = async (text: string, type: 'tw' | 'li' | 'fb') => {
        try {
            await navigator.clipboard.writeText(text);
            if (type === 'tw') {
                setCopiedTw(true);
                setTimeout(() => setCopiedTw(false), 2000);
            } else if (type === 'fb') {
                setCopiedFb(true);
                setTimeout(() => setCopiedFb(false), 2000);
            } else {
                setCopiedLi(true);
                setTimeout(() => setCopiedLi(false), 2000);
            }
        } catch (err) {
            console.error("Failed to copy!", err);
        }
    };

    const twitterFullText = socialContent?.twitter
        ? `${socialContent.twitter}${socialContent.hashtags ? '\n\n' + socialContent.hashtags.join(' ') : ''}\n\n${postUrl}`
        : '';

    const facebookFullText = socialContent?.facebook
        ? `${socialContent.facebook}${socialContent.hashtags ? '\n\n' + socialContent.hashtags.join(' ') : ''}\n\n${postUrl}`
        : '';

    const linkedinFullText = socialContent?.linkedin
        ? `${socialContent.linkedin}${socialContent.hashtags ? '\n\n' + socialContent.hashtags.join(' ') : ''}\n\n${postUrl}`
        : '';

    return (
        <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 p-4"
            onClick={(e) => e.stopPropagation()} // Prevent closing PostEditor
        >
            <div className="w-full max-w-xl bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl p-6 md:p-8 transform transition-all scale-100 border border-zinc-100 dark:border-zinc-800 max-h-[90vh] overflow-y-auto">

                {/* Header / Icon */}
                <div className="flex flex-col items-center justify-center mb-6">
                    {/* ... (keep status icons) ... */}
                    {status === 'loading' && (
                        <div className="p-4 rounded-full bg-blue-50 text-blue-500 mb-4 animate-pulse">
                            <Loader2 className="w-8 h-8 animate-spin" />
                        </div>
                    )}
                    {status === 'success' && (
                        <div className="p-4 rounded-full bg-green-50 text-green-500 mb-4">
                            <CheckCircle className="w-8 h-8" />
                        </div>
                    )}
                    {status === 'error' && (
                        <div className="p-4 rounded-full bg-red-50 text-red-500 mb-4">
                            <XCircle className="w-8 h-8" />
                        </div>
                    )}

                    <h2 className="text-2xl font-bold text-center text-zinc-900 dark:text-white">
                        {status === 'loading' && "Publicando..."}
                        {status === 'success' && "¡Publicado con éxito! 🚀"}
                        {status === 'error' && "Error al publicar ❌"}
                    </h2>

                    <p className="text-center text-zinc-500 mt-2 text-sm max-w-xs">
                        {status === 'loading' && "Guardando el post y solicitando indexación en Google."}
                        {status === 'success' && "Tu post ya está en vivo. Copia el contenido para tus redes sociales."}
                        {status === 'error' && "El post fue guardado, pero hubo un error en el proceso."}
                    </p>
                </div>

                {/* Content */}
                <div className="space-y-6">
                    {/* HostingArena Link & Google Indexing Status */}
                    {(status === 'success' || status === 'loading') && (
                        <div className="flex flex-col gap-3 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white dark:bg-zinc-700 rounded-lg shadow-sm">
                                        <Globe className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">HostingArena</span>
                                        <span className="text-xs text-zinc-500">Post en vivo</span>
                                    </div>
                                </div>
                                {status === 'success' ? (
                                    <a
                                        href={postUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="px-4 py-2 rounded-full bg-blue-50 text-blue-600 text-xs font-bold hover:bg-blue-100 transition-colors flex items-center gap-2"
                                    >
                                        Ver Post <ExternalLink className="w-3.5 h-3.5" />
                                    </a>
                                ) : (
                                    <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
                                )}
                            </div>

                            {/* Google Indexing Row */}
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
                    )}

                    {/* Manual Copy Sections */}
                    {status === 'success' && (
                        <div className="grid gap-6">
                            {/* X (Twitter) Copy */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-semibold">
                                        <div className="p-1.5 bg-black text-white rounded-md">
                                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zl-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                                        </div>
                                        <span className="text-sm">Contenido para X (Twitter)</span>
                                    </div>
                                    {twitterFullText && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleCopy(twitterFullText, 'tw'); }}
                                            className={`text-xs flex items-center gap-1.5 font-bold transition-all ${copiedTw ? 'text-green-500' : 'text-zinc-400 hover:text-zinc-900 dark:hover:text-white'}`}
                                        >
                                            {copiedTw ? <><Check className="w-3.5 h-3.5" /> Copiado</> : <><Copy className="w-3.5 h-3.5" /> Copiar</>}
                                        </button>
                                    )}
                                </div>
                                <div className="relative group">
                                    <textarea
                                        readOnly
                                        className="w-full h-24 p-4 text-xs font-mono bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 rounded-2xl resize-none text-zinc-600 dark:text-zinc-400 focus:outline-none"
                                        value={twitterFullText || "Sin contenido generado"}
                                    />
                                    {twitterFullText && (
                                        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl pointer-events-none flex items-center justify-center">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Solo lectura</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Facebook Copy */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-semibold">
                                        <div className="p-1.5 bg-[#1877F2] text-white rounded-md">
                                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                                        </div>
                                        <span className="text-sm">Contenido para Facebook</span>
                                    </div>
                                    {facebookFullText && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleCopy(facebookFullText, 'fb'); }}
                                            className={`text-xs flex items-center gap-1.5 font-bold transition-all ${copiedFb ? 'text-green-500' : 'text-zinc-400 hover:text-zinc-900 dark:hover:text-white'}`}
                                        >
                                            {copiedFb ? <><Check className="w-3.5 h-3.5" /> Copiado</> : <><Copy className="w-3.5 h-3.5" /> Copiar</>}
                                        </button>
                                    )}
                                </div>
                                <div className="relative group">
                                    <textarea
                                        readOnly
                                        className="w-full h-24 p-4 text-xs font-mono bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 rounded-2xl resize-none text-zinc-600 dark:text-zinc-400 focus:outline-none"
                                        value={facebookFullText || "Sin contenido generado"}
                                    />
                                    {facebookFullText && (
                                        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl pointer-events-none flex items-center justify-center">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Solo lectura</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* LinkedIn Copy */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-semibold">
                                        <div className="p-1.5 bg-[#0077b5] text-white rounded-md">
                                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                                        </div>
                                        <span className="text-sm">Contenido para LinkedIn</span>
                                    </div>
                                    {linkedinFullText && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleCopy(linkedinFullText, 'li'); }}
                                            className={`text-xs flex items-center gap-1.5 font-bold transition-all ${copiedLi ? 'text-green-500' : 'text-zinc-400 hover:text-zinc-900 dark:hover:text-white'}`}
                                        >
                                            {copiedLi ? <><Check className="w-3.5 h-3.5" /> Copiado</> : <><Copy className="w-3.5 h-3.5" /> Copiar</>}
                                        </button>
                                    )}
                                </div>
                                <div className="relative group">
                                    <textarea
                                        readOnly
                                        className="w-full h-24 p-4 text-xs font-mono bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 rounded-2xl resize-none text-zinc-600 dark:text-zinc-400 focus:outline-none"
                                        value={linkedinFullText || "Sin contenido generado"}
                                    />
                                    {linkedinFullText && (
                                        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl pointer-events-none flex items-center justify-center">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Solo lectura</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Error Details */}
                    {status === 'error' && (
                        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 text-sm text-red-600 dark:text-red-400">
                            <p className="font-semibold mb-1">Error Details:</p>
                            <p className="font-mono text-xs opacity-80 break-words">{errorDetails || "Unknown error occurred"}</p>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="mt-8 flex justify-center">
                    <Button
                        onClick={onClose}
                        className={`rounded-full px-12 py-3 font-bold transition-all hover:scale-105 active:scale-95 ${status === 'success'
                            ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900'
                            : 'bg-zinc-100 text-zinc-500'
                            }`}
                        variant={status === 'success' ? 'default' : 'ghost'}
                    >
                        {status === 'success' ? "Listo" : "Cerrar"}
                    </Button>
                </div>

            </div>
        </div>
    );
}
