import type { TaskGenerator } from '../TaskGeneratorFactory';
import type { AdminTask, ScraperStatus } from '../types';
import { createAdminClient } from '../supabaseAdmin';

/**
 * ScraperHealthCheck Task Generator
 * 
 * Monitors scraper_status for failures or stale data.
 * Creates tasks when:
 * - status = 'error' → HIGH priority
 * - status = 'warning' → HIGH priority  
 * - last_run > 3 days ago → NORMAL priority
 * 
 * This is a "Data Integrity" generator - bad scrapers = stale prices = lost trust.
 */
export class ScraperHealthCheck implements TaskGenerator {
    readonly name = 'ScraperHealthCheck';
    readonly description = 'Detects failing or stale scrapers';

    private readonly STALE_THRESHOLD_DAYS = 3;

    async scan(): Promise<AdminTask[]> {
        const supabase = createAdminClient();
        const tasks: AdminTask[] = [];

        // Get all scraper statuses
        const { data: scrapers, error } = await supabase
            .from('scraper_status')
            .select('*');

        if (error) throw error;

        // Check for existing pending tasks to avoid duplicates
        const { data: existingTasks } = await supabase
            .from('admin_tasks')
            .select('metadata')
            .eq('task_type', 'scraper_fix')
            .eq('status', 'pending');

        const existingProviderNames = new Set(
            (existingTasks || [])
                .map(t => (t.metadata as Record<string, unknown>)?.provider_name)
                .filter(Boolean)
        );

        const now = new Date();
        const staleThreshold = new Date(now.getTime() - this.STALE_THRESHOLD_DAYS * 24 * 60 * 60 * 1000);

        for (const scraper of (scrapers || []) as ScraperStatus[]) {
            // Skip if task already exists for this provider
            if (existingProviderNames.has(scraper.provider_name)) continue;

            const lastRun = scraper.last_run ? new Date(scraper.last_run) : null;
            const isError = scraper.status === 'error';
            const isWarning = scraper.status === 'warning';
            const isStale = lastRun && lastRun < staleThreshold;

            // Skip if everything is OK
            if (!isError && !isWarning && !isStale) continue;

            // Determine priority and message
            const isHighPriority = isError || isWarning;

            const task: AdminTask = {
                task_type: 'scraper_fix',
                priority: isHighPriority ? 'high' : 'normal',
                title: isError
                    ? `Error en Scraper: ${scraper.provider_name}`
                    : isWarning
                        ? `Advertencia en Scraper: ${scraper.provider_name}`
                        : `Scraper Desactualizado: ${scraper.provider_name}`,
                description: isError
                    ? `El scraper de ${scraper.provider_name} falló con error: "${scraper.error_message || 'Unknown'}". Los precios pueden estar desactualizados.`
                    : isWarning
                        ? `El scraper de ${scraper.provider_name} tiene advertencias: "${scraper.error_message || 'Datos parciales'}". Revisa los datos extraídos.`
                        : `El scraper de ${scraper.provider_name} no ha corrido en ${this.STALE_THRESHOLD_DAYS}+ días. Última ejecución: ${lastRun?.toLocaleDateString() || 'Nunca'}.`,
                metadata: {
                    provider_name: scraper.provider_name,
                    provider_type: scraper.provider_type,
                    status: scraper.status,
                    last_run: scraper.last_run,
                    error_message: scraper.error_message,
                    items_synced: scraper.items_synced,
                },
            };

            tasks.push(task);
        }

        return tasks;
    }
}
