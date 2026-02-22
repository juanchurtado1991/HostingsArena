import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';
import { toZonedTime, formatInTimeZone } from 'date-fns-tz';
import { addDays, addWeeks, addMonths } from 'date-fns';

const CRON_SECRET = process.env.CRON_SECRET || 'fallback_secret_for_local_dev';
const TIMEZONE = 'America/El_Salvador';

export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization');
        const urlParams = new URL(request.url).searchParams;
        const secretQuery = urlParams.get('secret');

        if (authHeader !== `Bearer ${CRON_SECRET}` && secretQuery !== CRON_SECRET) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabase = await createAdminClient();
        
        // 1. Get One-time pending reminders
        const { data: oneTimeReminders, error: err1 } = await supabase
            .from('slack_reminders')
            .select('*')
            .eq('status', 'pending')
            .eq('is_recurring', false)
            .lte('scheduled_at', new Date().toISOString());

        // 2. Get Recurring pending reminders
        const { data: recurringReminders, error: err2 } = await supabase
            .from('slack_reminders')
            .select('*')
            .eq('status', 'pending')
            .eq('is_recurring', true)
            .lte('scheduled_at', new Date().toISOString());

        if (err1 || err2) throw err1 || err2;

        const allReminders = [...(oneTimeReminders || []), ...(recurringReminders || [])];

        if (allReminders.length === 0) {
            return NextResponse.json({ message: 'No reminders to process', processed: 0 });
        }

        const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL;
        if (!slackWebhookUrl) {
            logger.warn('SLACK_WEBHOOK_URL is missing.');
            return NextResponse.json({ error: 'Missing slack webhook configuration' }, { status: 500 });
        }

        let sentCount = 0;

        for (const reminder of allReminders) {
            try {
                // Formatting message
                let textContent = reminder.message;
                if (reminder.mention_user) {
                    textContent = `🛎️ ¡Hola ${reminder.mention_user} ! \n\n${reminder.message}`;
                } else {
                    textContent = `🛎️ *Recordatorio*\n\n${reminder.message}`;
                }

                // Send to Slack
                const slackRes = await fetch(slackWebhookUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text: textContent })
                });

                if (!slackRes.ok) throw new Error(`Slack API error: ${slackRes.status}`);

                // Update Database
                if (reminder.is_recurring) {
                    // Calculate next scheduled_at
                    const currentScheduled = new Date(reminder.scheduled_at);
                    let nextDate: Date;

                    switch (reminder.recurrence_pattern) {
                        case 'daily': nextDate = addDays(currentScheduled, 1); break;
                        case 'weekly': nextDate = addWeeks(currentScheduled, 1); break;
                        case 'monthly': nextDate = addMonths(currentScheduled, 1); break;
                        default: nextDate = addDays(currentScheduled, 1);
                    }

                    await supabase
                        .from('slack_reminders')
                        .update({ 
                            last_sent_at: new Date().toISOString(),
                            scheduled_at: nextDate.toISOString() 
                        })
                        .eq('id', reminder.id);
                } else {
                    await supabase
                        .from('slack_reminders')
                        .update({ status: 'sent', last_sent_at: new Date().toISOString() })
                        .eq('id', reminder.id);
                }

                sentCount++;
            } catch (err) {
                logger.error(`Failed to send reminder ${reminder.id}:`, err);
                if (!reminder.is_recurring) {
                    await supabase.from('slack_reminders').update({ status: 'failed' }).eq('id', reminder.id);
                }
            }
        }

        return NextResponse.json({ processed: allReminders.length, sent: sentCount });

    } catch (error: any) {
        logger.error('Reminders cron error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
