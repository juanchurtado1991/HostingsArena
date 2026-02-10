import { NextRequest, NextResponse } from 'next/server';
import {
    TaskGeneratorFactory,
    AffiliateLinkAudit,
    ScraperHealthCheck,
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
        // Verify authorization (cron secret or admin)
        const authHeader = request.headers.get('authorization');
        const cronSecret = process.env.CRON_SECRET;

        // Allow cron jobs with secret
        if (cronSecret && authHeader === `Bearer ${cronSecret}`) {
            // Authorized via cron secret
        } else {
            // TODO: Add admin auth check here
            // For now, allow all requests in development
            if (process.env.NODE_ENV === 'production') {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }
        }

        // Initialize task factory with all generators
        const factory = new TaskGeneratorFactory();
        factory.register(new AffiliateLinkAudit());
        factory.register(new ScraperHealthCheck());

        // Run all generators with detailed logging
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

        // Insert tasks into database
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
    } catch (error) {
        console.error('[TaskGenerate] Error:', error);
        return NextResponse.json(
            { error: 'Failed to generate tasks', details: String(error) },
            { status: 500 }
        );
    }
}
