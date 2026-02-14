import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/guard';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
    try {
        const authError = await requireAuth();
        if (authError) return authError;

        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'OPENAI_API_KEY not configured' }, { status: 500 });
        }

        const body = await request.json();
        const {
            title,
            content,
            excerpt,
            seo_title,
            seo_description,
            social_tw_text,
            social_fb_text,
            social_li_text,
            social_hashtags,
            from = 'en',
            to = 'es'
        } = body;

        const prompt = `
        You are a professional translator and social media expert specializing in Cloud Hosting and VPN.
        Translate the blog post from ${from === 'en' ? 'English' : 'Spanish'} to ${to === 'es' ? 'Spanish' : 'English'}.
        
        CRITICAL RULES:
        1. Keep HTML structure of "content" exactly as is.
        2. Keep technical terms (VPS, Cloud Hosting, VPN, etc.) standard for the target language.
        3. Tone: Professional, technical, high-conversion.
        4. Return a JSON object with: title, content, excerpt, seo_title, seo_description, social_tw_text, social_fb_text, social_li_text, social_hashtags.
        5. **SOCIAL MEDIA FIELDS**:
           - If a social field (social_tw_text, etc.) has content, TRANSLATE it.
           - If a social field is EMPTY, **GENERATE IT** based on the translated content. 
           - **NEVER** return an empty string for social fields.
           - Twitter: Max 280 chars, engaging hook.
           - Facebook: Conversational, question-based.
           - LinkedIn: Professional insight.
           - Hashtags: Translate or generate 3-5 relevant hashtags.
        6. If a field appears ALREADY in the target language, RETURN IT AS IS.
        
        FIELDS TO PROCESS:
        - title: ${title}
        - excerpt: ${excerpt || ''}
        - seo_title: ${seo_title || ''}
        - seo_description: ${seo_description || ''}
        - social_tw_text: ${social_tw_text || ''}
        - social_fb_text: ${social_fb_text || ''}
        - social_li_text: ${social_li_text || ''}
        - social_hashtags: ${(social_hashtags || []).join(' ')}
        
        CONTENT (HTML):
        ${content}
        `;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a professional tech translator. Respond ONLY with the translated JSON object.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                response_format: { type: "json_object" },
                temperature: 0.3, // Lower temperature for more accurate translation
            }),
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error?.message || 'Translation failed');
        }

        console.log("OpenAI Raw Response:", data.choices[0].message.content);
        const translatedFields = JSON.parse(data.choices[0].message.content);
        console.log("Parsed Translated Fields:", translatedFields);

        return NextResponse.json({
            success: true,
            translated: translatedFields
        });

    } catch (error: any) {
        logger.error('[Translation API] Error:', error);
        return NextResponse.json(
            { error: 'Translation failed', details: error.message },
            { status: 500 }
        );
    }
}
