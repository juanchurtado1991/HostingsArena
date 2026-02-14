import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/tasks';
import { requireAuth } from '@/lib/auth/guard';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
    try {
        const authError = await requireAuth();
        if (authError) return authError;

        const supabase = createAdminClient();
        const apiKey = process.env.OPENAI_API_KEY;

        if (!apiKey) {
            return NextResponse.json({ error: 'OPENAI_API_KEY not configured' }, { status: 500 });
        }

        // 1. Find posts missing Spanish content
        const { data: posts, error } = await supabase
            .from('posts')
            .select('*')
            .or('title_es.is.null,content_es.is.null')
            .limit(5); // Process in small batches to avoid timeouts

        if (error) throw error;
        if (!posts || posts.length === 0) {
            return NextResponse.json({ message: 'No posts need translation' });
        }

        const results = [];

        for (const post of posts) {
            try {
                logger.log('ADMIN', `Translating post: ${post.title}`);

                const prompt = `
                Translate the following blog post fields from English to Spanish.
                Return a JSON object with: title, content, excerpt, seo_title, seo_description, social_tw_text, social_fb_text, social_li_text, social_hashtags.
                
                FIELDS:
                - title: ${post.title}
                - excerpt: ${post.excerpt || ''}
                - seo_title: ${post.seo_title || ''}
                - seo_description: ${post.seo_description || ''}
                - social_tw_text: ${post.social_tw_text || ''}
                - social_fb_text: ${post.social_fb_text || ''}
                - social_li_text: ${post.social_li_text || ''}
                - social_hashtags: ${(post.social_hashtags || []).join(' ')}
                
                CONTENT (HTML):
                ${post.content}
                `;

                const aiRes = await fetch('https://api.openai.com/v1/chat/completions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
                    body: JSON.stringify({
                        model: 'gpt-4o-mini',
                        messages: [{ role: 'system', content: 'You are a pro tech translator. JSON only.' }, { role: 'user', content: prompt }],
                        response_format: { type: "json_object" },
                        temperature: 0.2,
                    })
                });

                const aiData = await aiRes.json();
                const translated = JSON.parse(aiData.choices[0].message.content);

                // Update DB
                const { error: updateError } = await supabase
                    .from('posts')
                    .update({
                        title_es: translated.title,
                        content_es: translated.content,
                        excerpt_es: translated.excerpt,
                        seo_title_es: translated.seo_title,
                        seo_description_es: translated.seo_description,
                        // We also update original social fields since we only have one set of social columns for now
                        // but we could add _es if requested.
                        social_tw_text: translated.social_tw_text,
                        social_fb_text: translated.social_fb_text,
                        social_li_text: translated.social_li_text,
                        social_hashtags: Array.isArray(translated.social_hashtags) ? translated.social_hashtags : (translated.social_hashtags?.split(' ') || [])
                    })
                    .eq('id', post.id);

                if (updateError) throw updateError;
                results.push({ id: post.id, status: 'success' });

            } catch (err: any) {
                logger.error(`Failed to translate post ${post.id}:`, err);
                results.push({ id: post.id, status: 'error', error: err.message });
            }
        }

        return NextResponse.json({
            processed: posts.length,
            results,
            message: `Processed ${posts.length} posts.`
        });

    } catch (error: any) {
        logger.error('[Migration API] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
