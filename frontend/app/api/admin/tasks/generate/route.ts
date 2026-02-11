import { NextRequest, NextResponse } from 'next/server';
import {
    TaskGeneratorFactory,
    AffiliateLinkAudit,
    ScraperHealthCheck,
    PostReviewAudit,
    createAdminClient
} from '@/lib/tasks';

/**
 * POST /api/admin/tasks/generate
 * 
 * Runs all task generators and creates pending tasks in the database.
 * Returns the count of new tasks created.
 * 
 * Protected: Requires CRON_SECRET or admin authentication.
 */
export async function POST(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization');
        const cronSecret = process.env.CRON_SECRET;

        if (cronSecret && authHeader === `Bearer ${cronSecret}`) {
            // Authorized via Cron Secret
        } else {
            // Authorized via Middleware (Admin Session)
            // We rely on middleware to block unauthorized requests to /api/admin
        }

        const factory = new TaskGeneratorFactory();
        factory.register(new AffiliateLinkAudit());
        factory.register(new ScraperHealthCheck());
        factory.register(new PostReviewAudit());

        const { tasks, results } = await factory.runAllDetailed();

        console.log('[TaskGenerate] Results:', JSON.stringify(results, null, 2));

        if (tasks.length === 0) {
            return NextResponse.json({
                success: true,
                message: 'No new tasks needed',
                created: 0,
                generatorResults: results,
            });
        }

        const supabase = createAdminClient();
        const { error } = await supabase
            .from('admin_tasks')
            .insert(tasks);

        if (error) throw error;

        return NextResponse.json({
            success: true,
            message: `Created ${tasks.length} new tasks`,
            created: tasks.length,
            tasksByType: tasks.reduce((acc, t) => {
                acc[t.task_type] = (acc[t.task_type] || 0) + 1;
                return acc;
            }, {} as Record<string, number>),
        });
    } catch (error: any) {
        console.error('[TaskGenerate] Error:', error);
        return NextResponse.json(
            {
                error: 'Failed to generate tasks',
                details: error.message || error.details || String(error)
            },
            { status: 500 }
        );
    }
}
