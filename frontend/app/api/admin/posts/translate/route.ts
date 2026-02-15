import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/guard';
import { logger } from '@/lib/logger';
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(request: NextRequest) {
    try {
        const authError = await requireAuth();
        if (authError) return authError;

        const geminiKey = process.env.GEMINI_API_KEY;
        if (!geminiKey) {
            return NextResponse.json({ error: 'GEMINI_API_KEY not configured' }, { status: 500 });
        }

        const body = await request.json();
        const {
            title,
            content,
            excerpt,
            seo_title,
            seo_description,
            target_keywords, // Added
            social_tw_text,
            social_fb_text,
            social_li_text,
            social_hashtags,
            from = 'en',
            to = 'es'
        } = body;

        const prompt = `
        You are a top-tier tech copywriter and SEO expert specializing in Hosting and VPN (like GSMArena but for Cloud). 
        Translate the following blog post from ${from === 'en' ? 'English' : 'Spanish'} to ${to === 'es' ? 'Spanish (Spain/Neutral)' : 'English'}.
        
        CRITICAL RULES FOR NATURAL SPANISH:
        1. **AVOID LITERAL TRANSLATION**: Do not translate word-for-word. If an English expression sounds stiff in Spanish, rewrite it to sound like a native tech expert wrote it from scratch.
        2. **TECHNICAL TERMS**: DO NOT TRANSLATE terms like "Hosting", "VPS", "VPN", "Uptime", "Dashboard", "cPanel", "SSD NVMe", "Bandwidth", "Logs", "Backups". Spanish speakers in this industry use the English terms.
        3. **TONE**: Professional but engaging. Avoid "Usted" (unless it's a formal disclaimer). Use "tú" or impersonal forms for a modern startup feel.
        4. **HTML**: Preserve ALL HTML tags (<p>, <h2>, <strong>, etc.) exactly as they are in the "content".
        5. **SEO & HOOKS**: The "excerpt", "seo_title", and "social" fields must be catchy. In Spanish, use punchy verbs. Instead of "Este es un hosting rápido", use "Descubre el hosting que pulveriza récords de velocidad".
        6. **STRUCTURE**: Return ONLY a valid JSON object.

        FIELDS TO TRANSLATE (JSON format):
        {
          "title": "${title}",
          "content": "[HTML CONTENT PROVIDED BELOW]",
          "excerpt": "${excerpt || ''}",
          "seo_title": "${seo_title || ''}",
          "seo_description": "${seo_description || ''}",
          "target_keywords": "${(target_keywords || []).join(', ')}",
          "social_tw_text": "${social_tw_text || ''}",
          "social_fb_text": "${social_fb_text || ''}",
          "social_li_text": "${social_li_text || ''}",
          "social_hashtags": "${(social_hashtags || []).join(' ')}"
        }

        CONTENT TO TRANSLATE (HTML):
        ${content}
        `;

        const genAI = new GoogleGenerativeAI(geminiKey);
        const model = genAI.getGenerativeModel({
            model: "gemini-flash-latest",
            generationConfig: { responseMimeType: "application/json" }
        });

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        const translatedFields = JSON.parse(jsonMatch ? jsonMatch[0] : responseText);

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
