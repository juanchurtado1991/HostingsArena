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

        const existingProviderIds = new Set(
            (existingTasks || [])
                .map(t => (t.metadata as Record<string, unknown>)?.provider_id)
                .filter(Boolean)
        );

        for (const provider of allProviders) {
            const providerNameLower = provider.provider_name.toLowerCase();
            const hasAffiliate = affiliateMap.has(providerNameLower);
            const affiliateStatus = affiliateMap.get(providerNameLower);

            if (hasAffiliate && affiliateStatus === 'active') continue;

            if (existingProviderIds.has(provider.id)) continue;

            const isExpired = affiliateStatus === 'expired';
            const isPaused = affiliateStatus === 'paused';

            const task: AdminTask = {
                task_type: 'affiliate_audit',
                priority: isExpired ? 'high' : 'critical',
                title: isExpired
                    ? `Renovar Link Expirado: ${provider.provider_name}`
                    : isPaused
                        ? `Link Pausado: ${provider.provider_name}`
                        : `Falta Link de Afiliado: ${provider.provider_name}`,
                description: isExpired
                    ? `El enlace de afiliado para ${provider.provider_name} ha expirado. Genera un nuevo link desde el panel del programa de afiliados.`
                    : isPaused
                        ? `El enlace de afiliado para ${provider.provider_name} está pausado. Verifica y reactiva.`
                        : `No hay enlace de afiliado configurado para ${provider.provider_name}. Cada día sin link = dinero perdido.`,
                metadata: {
                    provider_id: provider.id,
                    provider_name: provider.provider_name,
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
