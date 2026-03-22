import React from "react";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

interface PublishStatusHeaderProps {
    status: 'loading' | 'success' | 'error';
    isScheduled?: boolean;
}

export function PublishStatusHeader({ status, isScheduled }: PublishStatusHeaderProps) {
    return (
        <div className="flex flex-col items-center justify-center mb-6">
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
                {status === 'loading' && "Guardando..."}
                {status === 'success' && (isScheduled ? "¡Publicación programada! ⏳" : "¡Publicado con éxito! 🚀")}
                {status === 'error' && "Error al guardar ❌"}
            </h2>

            <p className="text-center text-zinc-500 mt-2 text-sm max-w-xs">
                {status === 'loading' && "Guardando el post."}
                {status === 'success' && (isScheduled ? `Tu post está programado para publicarse en la fecha indicada.` : "Tu post ya está en vivo. Copia el contenido para redes sociales.")}
                {status === 'error' && "El post fue guardado, pero hubo un error en el proceso."}
            </p>
        </div>
    );
}
