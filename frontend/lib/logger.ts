type LogCategory = 'AUTH' | 'SEARCH' | 'ADMIN' | 'SYSTEM' | 'ERROR';

interface LogEntry {
    timestamp: string;
    category: LogCategory;
    message: string;
    data?: any;
}

class DebugLogger {
    private logs: LogEntry[] = [];
    private maxLogs = 200;
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
            .map(l => {
                let dataStr = '';
                if (l.data) {
                    if (l.data instanceof Error) {
                        dataStr = ` ${l.data.name}: ${l.data.message}`;
                    } else {
                        try {
                            dataStr = ` ${JSON.stringify(l.data)}`;
                        } catch (e) {
                            dataStr = ' [Circular/Unserializable]';
                        }
                    }
                }
                return `[${l.timestamp}] [${l.category}] ${l.message}${dataStr}`;
            })
            .join('\n');
    }

    clear() {
        this.logs = [];
        this.log('SYSTEM', 'Logs cleared');
    }
}

export const logger = new DebugLogger();

if (typeof window !== 'undefined') {
    (window as any).__debugLogger = logger;
}
