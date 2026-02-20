import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/tasks';
import { requireAuth } from '@/lib/auth/guard';

/**
 * GET /api/admin/posts
 * List posts with optional filters and pagination
 */
export async function GET(request: NextRequest) {
    try {
        const authError = await requireAuth();
        if (authError) return authError;
        const supabase = createAdminClient();
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status') || '';
        const search = searchParams.get('search') || '';
        const aiOnly = searchParams.get('ai_only') === 'true';
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');

        let query = supabase
            .from('posts')
            .select('*', { count: 'exact' })
            .order('created_at', { ascending: false })
            .range((page - 1) * limit, page * limit - 1);

        if (status && status !== 'all') {
            query = query.eq('status', status);
        }

        if (search) {
            query = query.ilike('title', `%${search}%`);
        }

        if (aiOnly) {
            query = query.eq('is_ai_generated', true);
        }

        const { data, error, count } = await query;

        if (error) throw error;

        return NextResponse.json({
            posts: data || [],
            total: count || 0,
            page,
            totalPages: Math.ceil((count || 0) / limit),
        });
    } catch (error) {
        console.error('[Posts API] GET error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch posts', details: String(error) },
            { status: 500 }
        );
    }
}

/**
 * POST /api/admin/posts
 * Create a new post
 */
export async function POST(request: NextRequest) {
    try {
        const authError = await requireAuth();
        if (authError) return authError;
        const supabase = createAdminClient();
        const body = await request.json();

        const {
            title, slug, content, excerpt, category,
            status: postStatus, seo_title, seo_description,
            target_keywords, related_provider_name, image_prompt,
            is_ai_generated, ai_quality_score,
            social_tw_text, social_fb_text, social_li_text, social_hashtags,
            title_es, content_es, excerpt_es,
            seo_title_es, seo_description_es,
            target_keywords_es,
            social_tw_text_es, social_fb_text_es, social_li_text_es, social_hashtags_es,
            published_at
        } = body;

        if (!title) {
            return NextResponse.json({ error: 'title is required' }, { status: 400 });
        }

        const finalSlug = slug || title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');

        const { data, error } = await supabase
            .from('posts')
            .insert({
                title,
                slug: finalSlug,
                content: content || '',
                excerpt: excerpt || null,
                category: category || null,
                status: postStatus || 'draft',
                seo_title: seo_title || title,
                seo_description: seo_description || excerpt || null,
                target_keywords: target_keywords || null,
                target_keywords_es: target_keywords_es || null,
                related_provider_name: related_provider_name || null,
                image_prompt: image_prompt || null,
                is_ai_generated: is_ai_generated || false,
                ai_quality_score: ai_quality_score || null,
                social_tw_text: social_tw_text || null,
                social_fb_text: social_fb_text || null,
                social_li_text: social_li_text || null,
                social_hashtags: social_hashtags || null,
                title_es: title_es || null,
                content_es: content_es || null,
                excerpt_es: excerpt_es || null,
                seo_title_es: seo_title_es || null,
                seo_description_es: seo_description_es || null,
                social_tw_text_es: social_tw_text_es || null,
                social_fb_text_es: social_fb_text_es || null,
                social_li_text_es: social_li_text_es || null,
                social_hashtags_es: social_hashtags_es || null,
                published_at: postStatus === 'published' ? (published_at || new Date().toISOString()) : null,
            })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ post: data, message: 'Post created' }, { status: 201 });
    } catch (error) {
        console.error('[Posts API] POST error:', error);
        return NextResponse.json(
            { error: 'Failed to create post', details: String(error) },
            { status: 500 }
        );
    }
}

/**
 * PATCH /api/admin/posts
 * Update an existing post
 */
export async function PATCH(request: NextRequest) {
    try {
        const authError = await requireAuth();
        if (authError) return authError;
        const supabase = createAdminClient();
        const body = await request.json();
        const { id, ...updates } = body;

        if (!id) {
            return NextResponse.json({ error: 'id is required' }, { status: 400 });
        }

        if (updates.status === 'published' && !updates.published_at) {
            const { data: currentPost } = await supabase.from('posts').select('status, published_at').eq('id', id).single();
            if (currentPost && currentPost.status !== 'published') {
                updates.published_at = new Date().toISOString();
            } else if (currentPost && currentPost.status === 'published') {
                updates.published_at = currentPost.published_at;
            }
        }

        if (!updates.is_ai_generated) {
            updates.last_human_review_at = new Date().toISOString();
        }

        const { data, error } = await supabase
            .from('posts')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ post: data, message: 'Post updated' });
    } catch (error) {
        console.error('[Posts API] PATCH error:', error);
        return NextResponse.json(
            { error: 'Failed to update post', details: String(error) },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/admin/posts
 * Delete a post by id
 */
export async function DELETE(request: NextRequest) {
    try {
        const authError = await requireAuth();
        if (authError) return authError;
        const supabase = createAdminClient();
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'id is required' }, { status: 400 });
        }

        const { error } = await supabase
            .from('posts')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return NextResponse.json({ message: 'Post deleted' });
    } catch (error) {
        console.error('[Posts API] DELETE error:', error);
        return NextResponse.json(
            { error: 'Failed to delete post', details: String(error) },
            { status: 500 }
        );
    }
}
