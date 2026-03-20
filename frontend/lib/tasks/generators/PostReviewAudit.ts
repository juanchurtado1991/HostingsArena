
import { TaskGenerator } from '../TaskGeneratorFactory';
import { AdminTask } from '../types';
import { createAdminClient } from '../supabaseAdmin';

export class PostReviewAudit implements TaskGenerator {
    name = 'PostReviewAudit';
    description = 'Scans for AI-generated posts that are in "draft" status and creates review tasks.';

    async scan(): Promise<AdminTask[]> {
        const supabase = createAdminClient();
        const tasks: AdminTask[] = [];

        const { data: drafts, error } = await supabase
            .from('posts')
            .select('id, title, created_at, slug')
            .eq('status', 'draft')
            .eq('is_ai_generated', true);

        if (error) throw new Error(`Failed to fetch draft posts: ${error.message}`);
        if (!drafts || drafts.length === 0) return [];

        const { data: existingTasks, error: taskError } = await supabase
            .from('admin_tasks')
            .select('metadata')
            .eq('task_type', 'content_review');

        if (taskError) throw new Error(`Failed to fetch existing tasks: ${taskError.message}`);

        const processedPostIds = new Set(
            existingTasks?.map(t => (t.metadata as any)?.post_id).filter(Boolean)
        );

        for (const post of drafts) {
            if (processedPostIds.has(post.id)) continue;

            tasks.push({
                task_type: 'content_review',
                priority: 'high',
                title: `Review AI Post: ${post.title}`,
                description: `Review, edit, and publish the AI-generated post "${post.title}". Ensure tone, facts, and formatting are correct.`,
                status: 'pending',
                metadata: {
                    post_id: post.id,
                    slug: post.slug,
                    source: 'ai_generator'
                }
            });
        }

        return tasks;
    }
}
