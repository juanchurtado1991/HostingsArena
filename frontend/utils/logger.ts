type LogCategory = 'AUTH' | 'SEARCH' | 'ADMIN' | 'SYSTEM' | 'ERROR';

interface LogEntry {
    timestamp: string;
    category: LogCategory;
    message: string;
    data?: any;
}

class DebugLogger {
    private logs: LogEntry[] = [];
    private maxLogs = 200; // Keep last 200 logs
    // Default to true unless explicitly disabled
    private isEnabled = process.env.NEXT_PUBLIC_SHOW_LOGGER !== 'false';

    constructor() {
        this.log('SYSTEM', 'Logger initialized');
    }

    log(category: LogCategory, message: string, data?: any) {
        if (!this.isEnabled) return;

        const entry: LogEntry = {
            timestamp: new Date().toISOString(),
            category,
            message,
            data
        };

        this.logs.unshift(entry);

        if (this.logs.length > this.maxLogs) {
            this.logs.pop();
        }

        // Mirror to console for immediate devtools visibility
        // use a distinctive distinct color or format if possible, but standard log is fine for now
        if (category === 'ERROR') {
            console.error(`[${category}] ${message}`, data || '');
        } else {
            console.log(`[${category}] ${message}`, data || '');
        }
    }

    error(message: string, error?: any) {
        this.log('ERROR', message, error);
    }

    getLogs() {
        return this.logs;
    }

    exportLogs() {
        return this.logs
            .map(l => `[${l.timestamp}] [${l.category}] ${l.message} ${l.data ? JSON.stringify(l.data) : ''}`)
            .join('\n');
    }

    clear() {
        this.logs = [];
        this.log('SYSTEM', 'Logs cleared');
    }
}

export const logger = new DebugLogger();

// Expose to window for manual access in console
if (typeof window !== 'undefined') {
    (window as any).__debugLogger = logger;
}
