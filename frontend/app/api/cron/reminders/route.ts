import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';
import { toZonedTime, formatInTimeZone } from 'date-fns-tz';
import { addDays, addWeeks, addMonths } from 'date-fns';

const CRON_SECRET = process.env.CRON_SECRET || 'fallback_secret_for_local_dev';
const TIMEZONE = 'America/El_Salvador';
const IGNORED_IPS = ["190.150.105.226", "190.53.30.25"];

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

        // Fetch Analytics Data if placeholders exist in any message
        const hasPlaceholders = allReminders.some(r => r.message.includes('{'));
        let analytics: any = null;

        if (hasPlaceholders) {
            const now = new Date();
            // Start of today in El Salvador (UTC-6)
            const todayStart = new Date(toZonedTime(now, TIMEZONE)).setHours(0,0,0,0);
            const todayUtcString = new Date(todayStart).toISOString();

            const [todayViews, totalViews, todayClicks, totalClicks, topCountriesToday, topCountriesTotal] = await Promise.all([
                supabase.from("page_views").select("id", { count: "exact", head: true }).not("ip_address", "in", `(${IGNORED_IPS.join(",")})`).gte("created_at", todayUtcString),
                supabase.from("page_views").select("id", { count: "exact", head: true }).not("ip_address", "in", `(${IGNORED_IPS.join(",")})`),
                supabase.from("affiliate_clicks").select("id", { count: "exact", head: true }).not("ip_address", "in", `(${IGNORED_IPS.join(",")})`).gte("created_at", todayUtcString),
                supabase.from("affiliate_clicks").select("id", { count: "exact", head: true }).not("ip_address", "in", `(${IGNORED_IPS.join(",")})`),
                supabase.from("page_views").select("country").not("ip_address", "in", `(${IGNORED_IPS.join(",")})`).gte("created_at", todayUtcString),
                supabase.from("page_views").select("country").not("ip_address", "in", `(${IGNORED_IPS.join(",")})`).limit(1000), // Recent 1000 for total top
            ]);

            // Helper to get top country from data
            const getTopCountry = (data: any[] | null) => {
                const countryCounts: Record<string, number> = {};
                data?.forEach(v => {
                    if (v.country) countryCounts[v.country] = (countryCounts[v.country] || 0) + 1;
                });
                const sorted = Object.entries(countryCounts).sort((a, b) => b[1] - a[1]);
                return sorted.length > 0 ? sorted[0][0] : null;
            };

            const todayTop = getTopCountry(topCountriesToday.data);
            const totalTop = getTopCountry(topCountriesTotal.data);

            analytics = {
                today_views: todayViews.count || 0,
                total_views: totalViews.count || 0,
                today_clicks: todayClicks.count || 0,
                total_clicks: totalClicks.count || 0,
                today_top_country: todayTop || totalTop || 'N/A'
            };
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
                const rawMention = reminder.mention_user || '';
                
                // Smart mention formatting for Webhooks
                const mention = rawMention === '@here' ? '<!here>' :
                               rawMention === '@channel' ? '<!channel>' :
                               (rawMention.startsWith('U') && rawMention.length > 8) ? `<@${rawMention}>` :
                               rawMention;

                let messageBody = reminder.message;
                if (analytics) {
                    messageBody = messageBody
                        .replace(/{today_views}/g, analytics.today_views.toLocaleString())
                        .replace(/{total_views}/g, analytics.total_views.toLocaleString())
                        .replace(/{today_clicks}/g, analytics.today_clicks.toLocaleString())
                        .replace(/{total_clicks}/g, analytics.total_clicks.toLocaleString())
                        .replace(/{today_top_country}/g, analytics.today_top_country);
                }

                if (mention) {
                    textContent = `🔔 *Friendly Reminder* ${mention}\n\n${messageBody}`;
                } else {
                    textContent = `🔔 *Friendly Reminder*\n\n${messageBody}`;
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
