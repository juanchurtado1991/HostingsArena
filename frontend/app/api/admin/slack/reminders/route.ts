import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/guard';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

// List reminders
export async function GET(request: NextRequest) {
    const authError = await requireAuth();
    if (authError) return authError;

    try {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('slack_reminders')
            .select('*')
            .order('scheduled_at', { ascending: false })
            .limit(100);

        if (error) throw error;

        return NextResponse.json({ reminders: data });
    } catch (error: any) {
        logger.error('Error fetching slack reminders:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// Create a new reminder
export async function POST(request: NextRequest) {
    const authError = await requireAuth();
    if (authError) return authError;

    try {
        const body = await request.json();
        const { message, mention_user, scheduled_at, is_recurring, recurrence_pattern } = body;

        if (!message || !scheduled_at) {
            return NextResponse.json({ error: 'Message and scheduled_at are required' }, { status: 400 });
        }
        
        if (is_recurring && !['daily', 'weekly', 'monthly'].includes(recurrence_pattern)) {
            return NextResponse.json({ error: 'Invalid recurrence pattern' }, { status: 400 });
        }

        const supabase = await createClient();
        const { data, error } = await supabase
            .from('slack_reminders')
            .insert({
                message,
                mention_user: mention_user || null,
                scheduled_at, // The UI should send a valid ISO string representing the UTC time of the El Salvador target
                is_recurring: is_recurring || false,
                recurrence_pattern: is_recurring ? recurrence_pattern : null,
                status: 'pending'
            })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ reminder: data });
    } catch (error: any) {
        logger.error('Error scheduling slack reminder:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// Delete/Cancel a reminder
export async function DELETE(request: NextRequest) {
    const authError = await requireAuth();
    if (authError) return authError;

    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Reminder ID is required' }, { status: 400 });
        }

        const supabase = await createClient();
        const { error } = await supabase
            .from('slack_reminders')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return NextResponse.json({ message: 'Reminder deleted successfully' });
    } catch (error: any) {
        logger.error('Error deleting slack reminder:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
