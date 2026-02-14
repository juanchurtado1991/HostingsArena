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
            content,
            title,
            language = 'en', // 'en' or 'es'
            platform = 'all' // 'twitter', 'facebook', 'linkedin', or 'all'
        } = body;

        if (!content && !title) {
            return NextResponse.json({ error: 'Content or Title is required' }, { status: 400 });
        }

        const prompt = `
        You are a professional social media manager for a Tech/Hosting news site.
        Generate social media posts for the following article.
        
        TARGET LANGUAGE: ${language === 'es' ? 'Spanish (Español)' : 'English'}
        
        ARTICLE TITLE: ${title}
        ARTICLE CONTENT/EXCERPT: ${content ? content.substring(0, 1500) : ''}
        
        CRITICAL RULES:
        1. Tone: Professional, engaging, click-worthy, but NOT clickbait. Verified and authoritative.
        2. Language: STRICTLY output in ${language === 'es' ? 'Spanish' : 'English'}.
        3. Twitter: Max 280 chars. Engaging hook + hashtags.
        4. Facebook: Conversational, question-based openers.
        5. LinkedIn: Professional industry insight format.
        6. Hashtags: Relevant keywords (3-5 max).
        
        Return a JSON object with fields: 
        - twitter
        - facebook
        - linkedin
        - hashtags (array of strings, e.g. ["#hosting", "#vps"])
        
        Response ONLY with the JSON.
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
                        content: 'You are a social media expert. Respond ONLY with valid JSON.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                response_format: { type: "json_object" },
                temperature: 0.7,
            }),
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error?.message || 'Generation failed');
        }

        console.log("OpenAI Social Gen Raw:", data.choices[0].message.content);
        const generatedFields = JSON.parse(data.choices[0].message.content);

        return NextResponse.json({
            success: true,
            generated: generatedFields
        });

    } catch (error: any) {
        logger.error('[Social Gen API] Error:', error);
        return NextResponse.json(
            { error: 'Generation failed', details: error.message },
            { status: 500 }
        );
    }
}
