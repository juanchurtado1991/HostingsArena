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

        const { data: scrapers, error } = await supabase
            .from('scraper_status')
            .select('*');

        if (error) throw error;

        const { data: existingTasks } = await supabase
            .from('admin_tasks')
            .select('id, metadata')
            .eq('task_type', 'scraper_fix')
            .eq('status', 'pending');

        const existingProviderNames = new Set(
            (existingTasks || [])
                .map(t => (t.metadata as Record<string, unknown>)?.provider_name)
                .filter(Boolean)
        );

        const now = new Date();
        const staleThreshold = new Date(now.getTime() - this.STALE_THRESHOLD_DAYS * 24 * 60 * 60 * 1000);

        // 🛡️ AUTO-RESOLVE LOGIC
        // If we have a pending task for a provider that is now SUCCESS, resolve it.
        if (existingTasks && existingTasks.length > 0) {
            for (const task of existingTasks) {
                const meta = task.metadata as Record<string, unknown>;
                const providerName = meta?.provider_name as string;
                if (!providerName) continue;

                // Find current status
                const currentStatus = (scrapers || []).find(s => s.provider_name === providerName);

                // If scraper is healthy (success) OR removed (not found in status table?), resolve.
                if (!currentStatus) {
                    await supabase
                        .from('admin_tasks')
                        .update({
                            status: 'resolved',
                            resolution_notes: 'Auto-resolved: Scraper no longer exists in monitoring (removed or inactive).'
                        })
                        .eq('id', task.id);
                    console.log(`✅ Auto-resolved task for ${providerName} (Not found in status)`);
                } else if (currentStatus.status === 'success') {
                    await supabase
                        .from('admin_tasks')
                        .update({
                            status: 'resolved',
                            resolution_notes: 'Auto-resolved by ScraperHealthCheck: Scraper reported success.'
                        })
                        .eq('id', task.id);
                    console.log(`✅ Auto-resolved task for ${providerName} (Success status)`);
                }
            }
        }

        for (const scraper of (scrapers || []) as ScraperStatus[]) {
            if (existingProviderNames.has(scraper.provider_name)) continue;

            const lastRun = scraper.last_run ? new Date(scraper.last_run) : null;
            const isError = scraper.status === 'error';
            const isWarning = scraper.status === 'warning';
            const isStale = lastRun && lastRun < staleThreshold;

            if (!isError && !isWarning && !isStale) continue;

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
                    ? `The scraper for ${scraper.provider_name} failed with error: "${scraper.error_message || 'Unknown'}". Prices may be outdated.`
                    : isWarning
                        ? `El scraper de ${scraper.provider_name} tiene advertencias: "${scraper.error_message || 'Datos parciales'}". Revisa los datos extraídos.`
                        : `El scraper de ${scraper.provider_name} no ha corrido en ${this.STALE_THRESHOLD_DAYS}+ días. Última ejecución: ${lastRun?.toLocaleDateString() || 'Nunca'}.`,
                status: 'pending',
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
