import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/tasks';
import { requireAuth } from '@/lib/auth/guard';

/**
 * GET /api/admin/affiliates
 * List all affiliate partners with optional search/filter.
 * Auto-expires links whose expires_at has passed and creates renewal tasks.
 */
export async function GET(request: NextRequest) {
    try {
        const authError = await requireAuth();
        if (authError) return authError;
        const supabase = createAdminClient();
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search') || '';
        const status = searchParams.get('status') || '';

        const { data: expiredLinks } = await supabase
            .from('affiliate_partners')
            .select('id, provider_name')
            .neq('status', 'expired')
            .not('expires_at', 'is', null)
            .lt('expires_at', new Date().toISOString());

        if (expiredLinks && expiredLinks.length > 0) {
            const expiredIds = expiredLinks.map(l => l.id);
            await supabase
                .from('affiliate_partners')
                .update({ status: 'expired' })
                .in('id', expiredIds);

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

        const { data: allData } = await supabase
            .from('affiliate_partners')
            .select('status');

        const stats = {
            total: allData?.length || 0,
            active: allData?.filter(a => a.status === 'active').length || 0,
            paused: allData?.filter(a => a.status === 'paused').length || 0,
            expired: allData?.filter(a => a.status === 'expired').length || 0,
            processing: allData?.filter(a => a.status === 'processing_approval').length || 0,
            rejected: allData?.filter(a => a.status === 'rejected').length || 0,
        };

        return NextResponse.json({ affiliates: data || [], stats });
    } catch (error: any) {
        console.error('[Affiliates API] GET error:', error);
        return NextResponse.json(
            {
                error: 'Failed to fetch affiliates',
                details: error.message || error.details || String(error)
            },
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
        const authError = await requireAuth();
        if (authError) return authError;
        const supabase = createAdminClient();
        const body = await request.json();

        const {
            provider_name,
            affiliate_link,
            network,
            commission_rate,
            cookie_days,
            link_duration_days,
            status,
            account_email,
            account_password,
            dashboard_url,
            account_phone,
            payment_method,
            minimum_payout_amount,
            minimum_payout_currency,
            reminder_at,
            reminder_note
        } = body;

        if (!provider_name || !affiliate_link) {
            return NextResponse.json(
                { error: 'provider_name and affiliate_link are required' },
                { status: 400 }
            );
        }

        try {
            new URL(affiliate_link);
        } catch {
            return NextResponse.json(
                { error: 'affiliate_link must be a valid URL' },
                { status: 400 }
            );
        }

        const durationDays = (link_duration_days !== undefined && link_duration_days !== "") ? parseInt(link_duration_days) : null;
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
                commission_rate: (commission_rate !== undefined && commission_rate !== "") ? parseFloat(commission_rate) : null,
                cookie_days: (cookie_days !== undefined && cookie_days !== "") ? parseInt(cookie_days) : null,
                link_duration_days: durationDays,
                expires_at: expiresAt,
                status: status || 'active',
                account_email: account_email || null,
                account_password: account_password || null,
                dashboard_url: dashboard_url || null,
                account_phone: account_phone || null,
                payment_method: payment_method || null,
                minimum_payout_amount: (minimum_payout_amount !== undefined && minimum_payout_amount !== "") ? parseFloat(minimum_payout_amount) : null,
                minimum_payout_currency: minimum_payout_currency || 'USD',
                reminder_at: reminder_at || null,
                reminder_note: reminder_note || null,
                last_verified_at: new Date().toISOString(),
            }, { onConflict: 'provider_name' })
            .select()
            .single();

        if (error) throw error;

        // Handle Reminder -> Task creation
        if (data && data.reminder_at) {
            const title = `Reminder: Affiliate Link for ${data.provider_name}`;
            const description = data.reminder_note || `Follow up on affiliate link for ${data.provider_name}`;

            const { data: existing } = await supabase
                .from('admin_tasks')
                .select('id')
                .eq('task_type', 'affiliate_reminder')
                .eq('status', 'pending')
                .eq('title', title)
                .maybeSingle();

            if (!existing) {
                await supabase.from('admin_tasks').insert({
                    task_type: 'affiliate_reminder',
                    priority: 'medium',
                    status: 'pending',
                    title,
                    description,
                    metadata: {
                        affiliate_id: data.id,
                        provider_name: data.provider_name,
                        reminder_at: data.reminder_at,
                    },
                });
            }
        }

        return NextResponse.json({ affiliate: data, message: 'Affiliate saved successfully' });
    } catch (error: any) {
        console.error('[Affiliates API] POST error:', error);
        return NextResponse.json(
            {
                error: 'Failed to save affiliate',
                details: error.message || error.details || String(error)
            },
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
        const authError = await requireAuth();
        if (authError) return authError;
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

        if (updates.cookie_days !== undefined) {
            updates.cookie_days = updates.cookie_days === "" ? null : parseInt(updates.cookie_days);
        }

        if (updates.minimum_payout_amount !== undefined) {
            updates.minimum_payout_amount = updates.minimum_payout_amount === "" ? null : parseFloat(updates.minimum_payout_amount);
        }

        if (updates.commission_rate !== undefined) {
            updates.commission_rate = updates.commission_rate === "" ? null : parseFloat(updates.commission_rate);
        }

        if (updates.link_duration_days !== undefined) {
            const durationDays = (updates.link_duration_days !== "" && updates.link_duration_days !== null) ? parseInt(updates.link_duration_days) : null;
            updates.link_duration_days = durationDays;
            if (durationDays && durationDays > 0) {
                const expiry = new Date();
                expiry.setDate(expiry.getDate() + durationDays);
                updates.expires_at = expiry.toISOString();
            } else {
                updates.expires_at = null;
            }
        }

        // Sanitize updates: convert empty strings to null for optional fields
        const fieldsToNullify = [
            'network', 'account_email', 'account_password',
            'dashboard_url', 'account_phone', 'payment_method', 'reminder_at',
            'reminder_note', 'minimum_payout_currency'
        ];

        fieldsToNullify.forEach(field => {
            if (updates[field] === "") {
                updates[field] = null;
            }
        });

        updates.last_verified_at = new Date().toISOString();

        const { data, error } = await supabase
            .from('affiliate_partners')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        // Handle Reminder -> Task creation
        if (data && data.reminder_at) {
            const title = `Reminder: Affiliate Link for ${data.provider_name}`;
            const description = data.reminder_note || `Follow up on affiliate link for ${data.provider_name}`;

            const { data: existing } = await supabase
                .from('admin_tasks')
                .select('id')
                .eq('task_type', 'affiliate_reminder')
                .eq('status', 'pending')
                .eq('title', title)
                .maybeSingle();

            if (!existing) {
                await supabase.from('admin_tasks').insert({
                    task_type: 'affiliate_reminder',
                    priority: 'medium',
                    status: 'pending',
                    title,
                    description,
                    metadata: {
                        affiliate_id: data.id,
                        provider_name: data.provider_name,
                        reminder_at: data.reminder_at,
                    },
                });
            }
        }

        if (data && (data.status === 'paused' || data.status === 'expired')) {
            try {
                const { data: affectedPosts } = await supabase
                    .from('posts')
                    .select('id, title')
                    .ilike('related_provider_name', data.provider_name)
                    .eq('status', 'published');

                if (affectedPosts && affectedPosts.length > 0) {
                    for (const post of affectedPosts) {
                        const { data: existing } = await supabase
                            .from('admin_tasks')
                            .select('id')
                            .eq('task_type', 'content_update')
                            .eq('status', 'pending')
                            .contains('metadata', { post_id: post.id })
                            .maybeSingle();

                        if (!existing) {
                            await supabase.from('admin_tasks').insert({
                                task_type: 'content_update',
                                priority: 'high',
                                status: 'pending',
                                title: `Update post: affiliate link ${data.status} for ${data.provider_name}`,
                                description: `The affiliate link for ${data.provider_name} is now "${data.status}". Post "${post.title}" contains this provider's link and needs updating.`,
                                metadata: {
                                    post_id: post.id,
                                    post_title: post.title,
                                    provider_name: data.provider_name,
                                    affiliate_status: data.status,
                                    reason: 'affiliate_link_deactivated',
                                },
                            });
                        }
                    }
                }
            } catch (taskErr) {
                console.error('[Affiliates API] Failed to create post update tasks:', taskErr);
            }
        }

        return NextResponse.json({ affiliate: data, message: 'Affiliate updated successfully' });
    } catch (error: any) {
        console.error('[Affiliates API] PATCH error:', error);
        return NextResponse.json(
            {
                error: 'Failed to update affiliate',
                details: error.message || error.details || String(error)
            },
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
        const authError = await requireAuth();
        if (authError) return authError;
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
    } catch (error: any) {
        console.error('[Affiliates API] DELETE error:', error);
        return NextResponse.json(
            {
                error: 'Failed to delete affiliate',
                details: error.message || error.details || String(error)
            },
            { status: 500 }
        );
    }
}
