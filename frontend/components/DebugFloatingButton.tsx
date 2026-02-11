"use client";

import { useState } from 'react';
import { logger } from '@/lib/logger';
import { Bug, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function DebugFloatingButton() {
    const [copied, setCopied] = useState(false);

    const isEnabled = process.env.NEXT_PUBLIC_SHOW_LOGGER !== 'false';

    useState(() => {
        if (typeof window !== 'undefined' && isEnabled) {
            const handleError = (event: ErrorEvent) => {
                logger.error('Uncaught Exception', { message: event.message, source: event.filename, lineno: event.lineno });
            };
            const handleRejection = (event: PromiseRejectionEvent) => {
                logger.error('Unhandled Promise Rejection', { reason: event.reason });
            };

            window.addEventListener('error', handleError);
            window.addEventListener('unhandledrejection', handleRejection);

            logger.log('SYSTEM', 'Global error listeners attached');

            return () => {
                window.removeEventListener('error', handleError);
                window.removeEventListener('unhandledrejection', handleRejection);
            };
        }
    });

    if (!isEnabled) return null;

    const handleCopy = () => {
        try {
            const logs = logger.exportLogs();
            navigator.clipboard.writeText(logs);
            console.log('Logs copied to clipboard via button');
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy logs', err);
            alert('Failed to copy logs to clipboard. Check console.');
        }
    };

    return (
        <div className="fixed bottom-4 left-4 z-[9999] opacity-70 hover:opacity-100 transition-opacity group">
            <Button
                onClick={handleCopy}
                variant={copied ? "default" : "destructive"}
                size="sm"
                className="rounded-full shadow-2xl flex items-center gap-2 text-xs font-mono border-2 border-white/20"
                title="Click to copy debug logs to clipboard"
            >
                {copied ? <Check className="h-3 w-3" /> : <Bug className="h-3 w-3" />}
                {copied ? "COPIED" : "DEBUG LOGS"}
            </Button>
        </div>
    );
}
