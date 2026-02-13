import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/tasks';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
    try {
        const supabase = createAdminClient();
        const body = await request.json();
        const { id } = body;

        if (!id) {
            return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
        }

        const { data: post, error } = await supabase
            .from('posts')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !post) {
            return NextResponse.json({ error: 'Post not found' }, { status: 404 });
        }

        // Webhook URL from generic environment variable or specific one
        const webhookUrl = process.env.SOCIAL_PUBLISH_WEBHOOK_URL;

        if (!webhookUrl) {
            logger.warn('SOCIAL_PUBLISH_WEBHOOK_URL is not defined. Skipping webhook trigger.');
            return NextResponse.json({
                success: true,
                message: 'Webhook processed (skipped - no URL configured)',
                data: post
            });
        }

        // Prepare payload for Make/Zapier
        const payload = {
            id: post.id,
            title: post.title,
            slug: post.slug,
            url: `https://hostingarena.com/news/${post.slug}`,
            excerpt: post.excerpt,
            cover_image: post.cover_image_url,
            social_twitter: post.social_tw_text,
            social_linkedin: post.social_li_text,
            hashtags: post.social_hashtags,
            published_at: new Date().toISOString()
        };

        // Fire and await response to get real links
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            logger.error(`Webhook trigger failed with status ${response.status}`);
            const errorText = await response.text();
            return NextResponse.json({
                error: 'Upstream webhook failed',
                details: errorText
            }, { status: 502 });
        }

        // Try to parse JSON from Make.com to get social links
        let upstreamData = {};
        try {
            upstreamData = await response.json();
        } catch (e) {
            logger.warn('Webhook success but no JSON returned');
        }

        return NextResponse.json({
            success: true,
            message: 'Webhook triggered successfully',
            data: upstreamData
        });

    } catch (error: any) {
        logger.error('Error in publish-webhook:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
