import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/tasks';

interface RouteParams {
    params: Promise<{ id: string }>;
}

/**
 * GET /api/admin/tasks/[id]
 * 
 * Get a single task by ID.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const supabase = createAdminClient();

        const { data, error } = await supabase
            .from('admin_tasks')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        if (!data) {
            return NextResponse.json({ error: 'Task not found' }, { status: 404 });
        }

        return NextResponse.json({ task: data });
    } catch (error) {
        console.error('[TaskGet] Error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch task', details: String(error) },
            { status: 500 }
        );
    }
}

/**
 * PATCH /api/admin/tasks/[id]
 * 
 * Update a task (status, assigned_to, etc.)
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const body = await request.json();
        const supabase = createAdminClient();

        const { data, error } = await supabase
            .from('admin_tasks')
            .update(body)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, task: data });
    } catch (error) {
        console.error('[TaskUpdate] Error:', error);
        return NextResponse.json(
            { error: 'Failed to update task', details: String(error) },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/admin/tasks/[id]
 * 
 * Delete a task.
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const supabase = createAdminClient();

        const { error } = await supabase
            .from('admin_tasks')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[TaskDelete] Error:', error);
        return NextResponse.json(
            { error: 'Failed to delete task', details: String(error) },
            { status: 500 }
        );
    }
}
