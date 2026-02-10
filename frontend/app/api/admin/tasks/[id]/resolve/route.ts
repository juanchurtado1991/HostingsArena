import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/tasks';

interface RouteParams {
    params: Promise<{ id: string }>;
}

/**
 * POST /api/admin/tasks/[id]/resolve
 * 
 * Resolves a task with a specific action.
 * The action depends on the task type:
 * 
 * - affiliate_audit: { link: 'https://...' } - Saves link to affiliate_partners
 * - scraper_fix: { acknowledged: true } - Just marks as complete
 * - content_review: { approved: true, published: true } - Publishes the post
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const body = await request.json();
        const supabase = createAdminClient();

        // Get the task first
        const { data: task, error: taskError } = await supabase
            .from('admin_tasks')
            .select('*')
            .eq('id', id)
            .single();

        if (taskError) throw taskError;
        if (!task) {
            return NextResponse.json({ error: 'Task not found' }, { status: 404 });
        }

        // Handle based on task type
        let actionResult: Record<string, unknown> = {};

        switch (task.task_type) {
            case 'affiliate_audit': {
                const { link, network, commission_rate, cookie_days } = body;
                if (!link) {
                    return NextResponse.json(
                        { error: 'Missing required field: link' },
                        { status: 400 }
                    );
                }

                // Validate URL format
                try {
                    new URL(link);
                } catch {
                    return NextResponse.json(
                        { error: 'Invalid URL format' },
                        { status: 400 }
                    );
                }

                const providerName = (task.metadata as Record<string, unknown>)?.provider_name as string;

                // Upsert affiliate link with all fields
                const { error: affError } = await supabase
                    .from('affiliate_partners')
                    .upsert({
                        provider_name: providerName,
                        affiliate_link: link,
                        status: 'active',
                        network: network || null,
                        commission_rate: commission_rate || null,
                        cookie_days: cookie_days ? parseInt(cookie_days) : null,
                        last_verified_at: new Date().toISOString(),
                    }, { onConflict: 'provider_name' });

                if (affError) throw affError;

                actionResult = {
                    action: 'link_added',
                    provider: providerName,
                    link,
                    network,
                    commission_rate,
                    cookie_days,
                };
                break;
            }

            case 'scraper_fix': {
                // Just acknowledge - actual fix is done manually
                actionResult = {
                    action: 'acknowledged',
                    provider: (task.metadata as Record<string, unknown>)?.provider_name
                };
                break;
            }

            case 'content_review': {
                const { approved } = body;
                const postId = (task.metadata as Record<string, unknown>)?.post_id as string;

                if (postId && approved) {
                    // Update post status to published
                    await supabase
                        .from('posts')
                        .update({
                            status: 'published',
                            published_at: new Date().toISOString(),
                        })
                        .eq('id', postId);
                }

                actionResult = {
                    action: approved ? 'approved' : 'rejected',
                    post_id: postId
                };
                break;
            }

            default:
                actionResult = { action: 'completed' };
        }

        // Mark task as completed
        const { error: updateError } = await supabase
            .from('admin_tasks')
            .update({
                status: 'completed',
                metadata: {
                    ...(task.metadata as Record<string, unknown>),
                    resolution: actionResult,
                    resolved_at: new Date().toISOString(),
                },
            })
            .eq('id', id);

        if (updateError) throw updateError;

        return NextResponse.json({
            success: true,
            message: 'Task resolved successfully',
            result: actionResult,
        });
    } catch (error) {
        console.error('[TaskResolve] Error:', error);
        return NextResponse.json(
            { error: 'Failed to resolve task', details: String(error) },
            { status: 500 }
        );
    }
}
