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

        // 1. Try Native Twitter Integration
        let twitterUrl = null;
        if (post.social_tw_text) {
            try {
                const { twitterClient } = await import('@/lib/twitter');
                twitterUrl = await twitterClient.postTweet(post.social_tw_text);
            } catch (e) {
                logger.error('Error importing or using twitterClient', e);
            }
        }

        // 2. Webhook Integration (Make.com / Buffer) - Optional
        const webhookUrl = process.env.SOCIAL_PUBLISH_WEBHOOK_URL;
        let webhookData = {};

        if (webhookUrl) {
            // ... (existing webhook logic) ...
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

            const response = await fetch(webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                try {
                    webhookData = await response.json();
                } catch (e) { /* ignore */ }
            }
        }

        return NextResponse.json({
            success: true,
            message: 'Publishing actions completed',
            data: {
                ...webhookData,
                // If native twitter worked, it overrides/supplements the webhook data
                x_url: twitterUrl || (webhookData as any)?.x_url
            }
        });

    } catch (error: any) {
        logger.error('Error in publish-webhook:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
