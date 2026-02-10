import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/tasks';

/**
 * GET /api/admin/affiliates
 * List all affiliate partners with optional search/filter.
 * Auto-expires links whose expires_at has passed and creates renewal tasks.
 */
export async function GET(request: NextRequest) {
    try {
        const supabase = createAdminClient();
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search') || '';
        const status = searchParams.get('status') || '';

        // --- Auto-expire logic ---
        // Find links that should be expired
        const { data: expiredLinks } = await supabase
            .from('affiliate_partners')
            .select('id, provider_name')
            .neq('status', 'expired')
            .not('expires_at', 'is', null)
            .lt('expires_at', new Date().toISOString());

        if (expiredLinks && expiredLinks.length > 0) {
            // Batch-update status to expired
            const expiredIds = expiredLinks.map(l => l.id);
            await supabase
                .from('affiliate_partners')
                .update({ status: 'expired' })
                .in('id', expiredIds);

            // Create renewal tasks for each expired link
            const renewalTasks = expiredLinks.map(link => ({
                task_type: 'affiliate_audit',
                priority: 'high' as const,
                status: 'pending' as const,
                title: `Renew affiliate link for ${link.provider_name}`,
                description: `The affiliate link for ${link.provider_name} has expired and needs renewal. Go to the affiliate network dashboard to generate a fresh link.`,
                metadata: {
                    provider_name: link.provider_name,
                    reason: 'link_expired',
                    expired_at: new Date().toISOString(),
                },
            }));

            // Only create tasks if they don't already exist as pending
            for (const task of renewalTasks) {
                const { data: existing } = await supabase
                    .from('admin_tasks')
                    .select('id')
                    .eq('task_type', 'affiliate_audit')
                    .eq('status', 'pending')
                    .eq('title', task.title)
                    .maybeSingle();

                if (!existing) {
                    await supabase.from('admin_tasks').insert(task);
                }
            }
        }

        // --- Main query ---
        let query = supabase
            .from('affiliate_partners')
            .select('*')
            .order('provider_name', { ascending: true });

        if (search) {
            query = query.ilike('provider_name', `%${search}%`);
        }

        if (status && status !== 'all') {
            query = query.eq('status', status);
        }

        const { data, error } = await query;

        if (error) throw error;

        // Get counts by status
        const { data: allData } = await supabase
            .from('affiliate_partners')
            .select('status');

        const stats = {
            total: allData?.length || 0,
            active: allData?.filter(a => a.status === 'active').length || 0,
            paused: allData?.filter(a => a.status === 'paused').length || 0,
            expired: allData?.filter(a => a.status === 'expired').length || 0,
        };

        return NextResponse.json({ affiliates: data || [], stats });
    } catch (error) {
        console.error('[Affiliates API] GET error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch affiliates', details: String(error) },
            { status: 500 }
        );
    }
}

/**
 * POST /api/admin/affiliates
 * Create a new affiliate partner
 */
export async function POST(request: NextRequest) {
    try {
        const supabase = createAdminClient();
        const body = await request.json();

        const { provider_name, affiliate_link, network, commission_rate, cookie_days, link_duration_days, status } = body;

        if (!provider_name || !affiliate_link) {
            return NextResponse.json(
                { error: 'provider_name and affiliate_link are required' },
                { status: 400 }
            );
        }

        // Validate URL
        try {
            new URL(affiliate_link);
        } catch {
            return NextResponse.json(
                { error: 'affiliate_link must be a valid URL' },
                { status: 400 }
            );
        }

        // Compute expires_at from link_duration_days
        const durationDays = link_duration_days ? parseInt(link_duration_days) : null;
        let expiresAt: string | null = null;
        if (durationDays && durationDays > 0) {
            const expiry = new Date();
            expiry.setDate(expiry.getDate() + durationDays);
            expiresAt = expiry.toISOString();
        }

        const { data, error } = await supabase
            .from('affiliate_partners')
            .upsert({
                provider_name,
                affiliate_link,
                network: network || null,
                commission_rate: commission_rate || null,
                cookie_days: cookie_days ? parseInt(cookie_days) : null,
                link_duration_days: durationDays,
                expires_at: expiresAt,
                status: status || 'active',
                last_verified_at: new Date().toISOString(),
            }, { onConflict: 'provider_name' })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ affiliate: data, message: 'Affiliate saved successfully' });
    } catch (error) {
        console.error('[Affiliates API] POST error:', error);
        return NextResponse.json(
            { error: 'Failed to save affiliate', details: String(error) },
            { status: 500 }
        );
    }
}

/**
 * PATCH /api/admin/affiliates
 * Update an existing affiliate partner
 */
export async function PATCH(request: NextRequest) {
    try {
        const supabase = createAdminClient();
        const body = await request.json();

        const { id, ...updates } = body;

        if (!id) {
            return NextResponse.json({ error: 'id is required' }, { status: 400 });
        }

        if (updates.affiliate_link) {
            try {
                new URL(updates.affiliate_link);
            } catch {
                return NextResponse.json(
                    { error: 'affiliate_link must be a valid URL' },
                    { status: 400 }
                );
            }
        }

        if (updates.cookie_days) {
            updates.cookie_days = parseInt(updates.cookie_days);
        }

        // Handle link_duration_days → compute expires_at
        if (updates.link_duration_days !== undefined) {
            const durationDays = updates.link_duration_days ? parseInt(updates.link_duration_days) : null;
            updates.link_duration_days = durationDays;
            if (durationDays && durationDays > 0) {
                const expiry = new Date();
                expiry.setDate(expiry.getDate() + durationDays);
                updates.expires_at = expiry.toISOString();
            } else {
                updates.expires_at = null;
            }
        }

        updates.last_verified_at = new Date().toISOString();

        const { data, error } = await supabase
            .from('affiliate_partners')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ affiliate: data, message: 'Affiliate updated successfully' });
    } catch (error) {
        console.error('[Affiliates API] PATCH error:', error);
        return NextResponse.json(
            { error: 'Failed to update affiliate', details: String(error) },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/admin/affiliates
 * Delete an affiliate partner
 */
export async function DELETE(request: NextRequest) {
    try {
        const supabase = createAdminClient();
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'id is required' }, { status: 400 });
        }

        const { error } = await supabase
            .from('affiliate_partners')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return NextResponse.json({ message: 'Affiliate deleted successfully' });
    } catch (error) {
        console.error('[Affiliates API] DELETE error:', error);
        return NextResponse.json(
            { error: 'Failed to delete affiliate', details: String(error) },
            { status: 500 }
        );
    }
}
