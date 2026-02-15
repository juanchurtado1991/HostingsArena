import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/guard';
import { logger } from '@/lib/logger';
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(request: NextRequest) {
    try {
        const authError = await requireAuth();
        if (authError) return authError;

        const openAiKey = process.env.OPENAI_API_KEY;
        const geminiKey = process.env.GEMINI_API_KEY;

        const body = await request.json();
        const {
            content,
            title,
            language = 'en', // 'en' or 'es'
            platform = 'all', // 'twitter', 'facebook', 'linkedin', or 'all'
            model = 'gemini-1.5-flash' // Default to Gemini 1.5
        } = body;

        const isGemini = model.startsWith('gemini');

        if (isGemini && !geminiKey) {
            return NextResponse.json({ error: 'GEMINI_API_KEY not configured' }, { status: 500 });
        }
        if (!isGemini && !openAiKey) {
            return NextResponse.json({ error: 'OPENAI_API_KEY not configured' }, { status: 500 });
        }

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

        let resultRaw = "";

        if (isGemini) {
            try {
                const genAI = new GoogleGenerativeAI(geminiKey!);
                // Map UI model names to actual API model names available in this account
                let modelName = model;
                if (model.includes('2.0')) {
                    modelName = 'gemini-2.0-flash-lite';
                } else if (model.includes('1.5') || model.includes('flash')) {
                    modelName = 'gemini-flash-latest';
                }

                const modelInstance = genAI.getGenerativeModel({ model: modelName });

                // Universal prompt format
                const finalPrompt = `SYSTEM INSTRUCTIONS:\nYou are a professional social media manager. Respond ONLY with valid JSON.\n\nUSER REQUEST:\n${prompt}`;

                const result = await modelInstance.generateContent(finalPrompt);
                const response = await result.response;
                resultRaw = response.text();
            } catch (error: any) {
                if (error.message?.includes('429') || error.message?.includes('Quota')) {
                    throw new Error("Gemini Quota Exceeded (429). Tu cuenta gratuita de Google tiene el límite en 0 para este modelo. Prueba usando 'Gemini 1.5 Flash' en el selector.");
                }
                if (error.message?.includes('404')) {
                    throw new Error(`Gemini 404: El modelo '${model}' no fue encontrado. Intenta con 'Gemini 1.5 Flash'.`);
                }
                throw error;
            }
        } else {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${openAiKey}`,
                },
                body: JSON.stringify({
                    model: model,
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
            resultRaw = data.choices[0].message.content;
        }

        console.log("Social Gen Raw:", resultRaw);
        const jsonMatch = resultRaw.match(/\{[\s\S]*\}/);
        const generatedFields = JSON.parse(jsonMatch ? jsonMatch[0] : resultRaw || "{}");

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
