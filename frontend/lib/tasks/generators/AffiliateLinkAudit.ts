import type { TaskGenerator } from '../TaskGeneratorFactory';
import type { AdminTask } from '../types';
import { createAdminClient } from '../supabaseAdmin';

/**
 * AffiliateLinkAudit Task Generator
 * 
 * Scans hosting_providers and vpn_providers for missing affiliate links.
 * Creates CRITICAL priority tasks for any provider without a link in affiliate_partners.
 * 
 * This is a "Revenue Protection" generator - missing links = lost money.
 */
export class AffiliateLinkAudit implements TaskGenerator {
    readonly name = 'AffiliateLinkAudit';
    readonly description = 'Detects providers without affiliate links configured';

    async scan(): Promise<AdminTask[]> {
        const supabase = createAdminClient();
        const tasks: AdminTask[] = [];

        const [hostingRes, vpnRes] = await Promise.all([
            supabase.from('hosting_providers').select('id, provider_name'),
            supabase.from('vpn_providers').select('id, provider_name'),
        ]);

        if (hostingRes.error) throw hostingRes.error;
        if (vpnRes.error) throw vpnRes.error;

        const allProviders = [
            ...(hostingRes.data || []).map(p => ({ ...p, type: 'hosting' as const })),
            ...(vpnRes.data || []).map(p => ({ ...p, type: 'vpn' as const })),
        ];

        const { data: affiliates, error: affError } = await supabase
            .from('affiliate_partners')
            .select('provider_name, status');

        if (affError) throw affError;

        const affiliateMap = new Map(
            (affiliates || []).map(a => [a.provider_name.toLowerCase(), a.status])
        );

        const { data: existingTasks } = await supabase
            .from('admin_tasks')
            .select('metadata')
            .eq('task_type', 'affiliate_audit')
            .eq('status', 'pending');

        const pendingProviderNames = new Set(
            (existingTasks || [])
                .map(t => (t.metadata as Record<string, unknown>)?.provider_name as string)
                .filter(Boolean)
        );

        // Track names added in THIS current scan to avoid duplicates from allProviders
        const processedInScan = new Set<string>();

        for (const provider of allProviders) {
            const providerName = provider.provider_name;
            const providerNameLower = providerName.toLowerCase();

            // 1. Skip if already processed in this scan loop
            if (processedInScan.has(providerNameLower)) continue;
            processedInScan.add(providerNameLower);

            // 2. Skip if affiliate exists and is active
            const hasAffiliate = affiliateMap.has(providerNameLower);
            const affiliateStatus = affiliateMap.get(providerNameLower);
            if (hasAffiliate && affiliateStatus === 'active') continue;

            // 3. Skip if we already have a PENDING task in DB for this provider
            if (pendingProviderNames.has(providerName)) continue;

            const isExpired = affiliateStatus === 'expired';
            const isPaused = affiliateStatus === 'paused';

            const task: AdminTask = {
                task_type: 'affiliate_audit',
                priority: isExpired ? 'high' : 'critical',
                title: isExpired
                    ? `Renovar Link Expirado: ${providerName}`
                    : isPaused
                        ? `Link Pausado: ${providerName}`
                        : `Falta Link de Afiliado: ${providerName}`,
                description: isExpired
                    ? `El enlace de afiliado para ${providerName} ha expirado. Genera un nuevo link desde el panel del programa de afiliados.`
                    : isPaused
                        ? `El enlace de afiliado para ${providerName} está pausado. Verifica y reactiva.`
                        : `No hay enlace de afiliado configurado para ${providerName}. Cada día sin link = dinero perdido.`,
                status: 'pending',
                metadata: {
                    provider_id: provider.id,
                    provider_name: providerName,
                    provider_type: provider.type,
                    has_inactive_link: hasAffiliate,
                    reason: isExpired ? 'link_expired' : isPaused ? 'link_paused' : 'link_missing',
                },
            };

            tasks.push(task);
        }

        return tasks;
    }
}
