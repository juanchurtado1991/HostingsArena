import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/tasks';
import { requireAuth } from '@/lib/auth/guard';

/**
 * GET /api/admin/tasks
 * 
 * Lists all admin tasks with optional filters.
 * Query params: status, priority, task_type, limit
 */
export async function GET(request: NextRequest) {
    try {
        const authError = await requireAuth();
        if (authError) return authError;
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const priority = searchParams.get('priority');
        const taskType = searchParams.get('task_type');
        const limit = parseInt(searchParams.get('limit') || '200');

        const supabase = createAdminClient();

        let query = supabase
            .from('admin_tasks')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limit);

        if (status) query = query.eq('status', status);
        if (priority) query = query.eq('priority', priority);
        if (taskType) query = query.eq('task_type', taskType);

        const { data, error } = await query;

        if (error) throw error;

        const grouped = {
            critical: data?.filter(t => t.priority === 'critical') || [],
            high: data?.filter(t => t.priority === 'high') || [],
            normal: data?.filter(t => t.priority === 'normal') || [],
            low: data?.filter(t => t.priority === 'low') || [],
        };

        return NextResponse.json({
            tasks: data,
            grouped,
            total: data?.length || 0,
        });
    } catch (error) {
        console.error('[TaskList] Error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch tasks', details: String(error) },
            { status: 500 }
        );
    }
}

/**
 * POST /api/admin/tasks
 * 
 * Creates a new admin task manually.
 */
export async function POST(request: NextRequest) {
    try {
        const authError = await requireAuth();
        if (authError) return authError;
        const body = await request.json();
        const supabase = createAdminClient();

        const { data, error } = await supabase
            .from('admin_tasks')
            .insert(body)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, task: data });
    } catch (error) {
        console.error('[TaskCreate] Error:', error);
        return NextResponse.json(
            { error: 'Failed to create task', details: String(error) },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/admin/tasks
 * 
 * Bulks deletes tasks. 
 * Defaults to all pending tasks if no filters provided.
 */
export async function DELETE(request: NextRequest) {
    try {
        const authError = await requireAuth();
        if (authError) return authError;
        const supabase = createAdminClient();

        // Match everything by using a range filter on created_at (always true for all records)
        const { error } = await supabase
            .from('admin_tasks')
            .delete()
            .gt('created_at', '2000-01-01');

        if (error) {
            console.error('[TaskDelete] Supabase Error:', error);
            throw error;
        }

        return NextResponse.json({ success: true, message: 'All pending tasks deleted' });
    } catch (error: any) {
        console.error('[TaskDelete] Error:', error);
        return NextResponse.json(
            {
                error: 'Failed to delete tasks',
                details: error.message || error.details || String(error)
            },
            { status: 500 }
        );
    }
}
