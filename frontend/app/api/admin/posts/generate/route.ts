import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/tasks';
import { logger } from '@/lib/logger';
import { requireAuth } from '@/lib/auth/guard';
import { personas, structures, narrativeArcs, stressTests } from './data';
import { buildContentSystemPrompt, buildMetaSystemPrompt } from './prompts';
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(request: NextRequest) {
    const authError = await requireAuth();
    if (authError) return authError;

    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const encoder = new TextEncoder();

    const sendProgress = async (data: any) => {
        await writer.write(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
    };

    const fetchOpenAI = async (apiKey: string, body: any) => {
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
            body: JSON.stringify(body)
        });
        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`OpenAI Error (${res.status}): ${errorText}`);
        }
        const json = await res.json();
        return json.choices?.[0]?.message?.content || "";
    };

    const generateWithGemini = async (apiKey: string, model: string, systemPrompt: string, userPrompt?: string) => {
        try {
            const genAI = new GoogleGenerativeAI(apiKey);

            // Map UI model names to actual API model names available in this account
            let modelName = model;
            if (model.includes('2.0')) {
                // gemini-2.0-flash-lite was found in the user's list
                modelName = 'gemini-2.0-flash-lite';
            } else if (model.includes('1.5') || model.includes('flash')) {
                // gemini-flash-latest is the active 1.5 alias found in this account
                modelName = 'gemini-flash-latest';
            }

            const modelInstance = genAI.getGenerativeModel({ model: modelName });

            // Revert to prompt injection for maximum compatibility across v1/v1beta
            const finalPrompt = `SYSTEM INSTRUCTIONS:\n${systemPrompt}\n\nUSER REQUEST:\n${userPrompt || "Produce the content following the system instructions."}`;

            const result = await modelInstance.generateContent(finalPrompt);
            const response = await result.response;
            return response.text();
        } catch (error: any) {
            if (error.message?.includes('429') || error.message?.includes('Quota')) {
                throw new Error("Gemini Quota Exceeded (429). Tu cuenta gratuita de Google tiene el límite en 0 para este modelo. Prueba usando 'Gemini 1.5 Flash' en el selector.");
            }
            if (error.message?.includes('404')) {
                throw new Error(`Gemini 404: El modelo '${model}' no fue encontrado. Intenta con 'Gemini 1.5 Flash'.`);
            }
            if (error.message?.includes('400')) {
                throw new Error("Gemini 400: Error en el formato de la solicitud. Intentando modo de compatibilidad...");
            }
            throw error;
        }
    };

    const runGeneration = async () => {
        try {
            const supabase = createAdminClient();
            const geminiKey = process.env.GEMINI_API_KEY;
            const body = await request.json().catch(() => ({}));
            const currentYear = new Date().getFullYear();

            // Default model is now gemini-1.5-flash (safe due to 2.0 quota issues)
            const modelToUse = body.model || 'gemini-1.5-flash';

            if (!geminiKey) {
                await sendProgress({ error: 'GEMINI_API_KEY not configured' });
                return;
            }

            const [hostingRes, vpnRes, affiliateRes] = await Promise.all([
                supabase.from('hosting_providers').select('*'),
                supabase.from('vpn_providers').select('*'),
                supabase.from('affiliate_partners').select('provider_name').eq('status', 'active')
            ]);

            const activeAffiliateNames = new Set((affiliateRes.data || []).map(a => a.provider_name));

            const allProviders = [
                ...(hostingRes.data || []).map(p => ({ ...p, type: 'hosting' })),
                ...(vpnRes.data || []).map(p => ({ ...p, type: 'vpn' })),
            ].filter(p => activeAffiliateNames.has(p.provider_name));

            if (allProviders.length === 0 && !body.provider_name) {
                await sendProgress({ error: 'No active affiliate partners found.' });
                return;
            }

            let provider;
            if (body.provider_name) {
                provider = allProviders.find(p => p.provider_name === body.provider_name) || {
                    provider_name: body.provider_name,
                    pricing_monthly: null,
                    type: 'hosting'
                };
            } else {
                provider = allProviders[Math.floor(Math.random() * allProviders.length)];
            }

            const specs = provider.type === 'hosting' ? {
                price: provider.pricing_monthly || "Hidden",
                renewal: provider.pricing_renewal || "Unknown",
                disk: provider.disk_space || "Unknown",
                bandwidth: provider.bandwidth || "Unknown",
                upsell: provider.upsell_checked ? "Yes" : "No",
                support: provider.support_24_7 ? "24/7" : "Limited",
                locations: provider.server_locations || "Unknown"
            } : {
                price: provider.pricing_monthly || "Hidden",
                devices: provider.simultaneous_connections || "Unknown",
                streaming: provider.streaming_optimized ? "Yes" : "No",
                logs: provider.no_logs_policy ? "Strict No-Logs" : "Unknown",
                servers: provider.server_count || "Unknown"
            };

            const specsString = JSON.stringify(specs, null, 2);

            const selectedArc = body.scenario && body.scenario !== 'random'
                ? body.scenario
                : narrativeArcs[Math.floor(Math.random() * narrativeArcs.length)];

            const selectedTest = stressTests[Math.floor(Math.random() * stressTests.length)];

            const selectedStructure = body.structure
                ? structures.find(s => s.name === body.structure) || structures[0]
                : structures[Math.floor(Math.random() * structures.length)];

            const selectedPersona = body.persona && personas.includes(body.persona)
                ? body.persona
                : personas[Math.floor(Math.random() * personas.length)];

            const targetWordCount = body.target_word_count || 1500;
            const approxReadingTime = Math.ceil(targetWordCount / 200);

            const extraInstructions = body.extra_instructions
                ? `\n\n**SPECIAL USER INSTRUCTIONS (Must Follow):** ${body.extra_instructions}`
                : "";

            await sendProgress({
                status: `Creating Story: ${provider.provider_name} | Arc: ${selectedArc} | Model: ${modelToUse}`,
                progress: 20
            });

            const contentSystemPrompt = buildContentSystemPrompt({
                providerName: provider.provider_name,
                specsString,
                targetWordCount,
                approxReadingTime,
                structure: selectedStructure,
                persona: selectedPersona,
                arc: selectedArc,
                test: selectedTest,
                extraInstructions
            });

            let fullContent = await generateWithGemini(geminiKey!, modelToUse, contentSystemPrompt);
            fullContent = fullContent.replace(/```html/g, '').replace(/```/g, '').trim();

            await sendProgress({ status: `Generating Viral Metadata...`, progress: 80 });

            const metaSystemPrompt = buildMetaSystemPrompt({
                structureName: selectedStructure.name,
                providerName: provider.provider_name,
                persona: selectedPersona,
                extraInstructions,
                currentYear
            });

            let metaRaw = await generateWithGemini(geminiKey!, modelToUse, metaSystemPrompt, "Generate the JSON metadata object.");

            let meta;
            try {
                const jsonMatch = metaRaw.match(/\{[\s\S]*\}/);
                meta = JSON.parse(jsonMatch ? jsonMatch[0] : metaRaw || "{}");
            } catch (e) {
                logger.error('Metadata parsing failed, using fallback:', e);
                meta = {};
            }

            // CRITICAL: Ensure title is never null/undefined before DB insert
            if (!meta.title || typeof meta.title !== 'string' || meta.title.trim() === '') {
                meta.title = `Review: Is ${provider.provider_name} Worth It in ${currentYear}?`;
            }

            // Build defaults for other fields if missing
            if (!meta.seo_title) meta.seo_title = `${provider.provider_name} Review ${currentYear} - Pros & Cons`;
            if (!meta.seo_description) meta.seo_description = `In-depth review of ${provider.provider_name}. We analyze pricing, speed, and support.`;
            if (!meta.excerpt) meta.excerpt = `We tested ${provider.provider_name} extensively. Here is our honest verdict on their performance and value.`;
            if (!meta.image_prompt) meta.image_prompt = `server room data center modern technology ${provider.provider_name} logo style`;
            if (!meta.rating_score) meta.rating_score = 85;

            // Target Keywords - ensuring it's an array
            let targetKeywordsEn = meta.target_keywords;
            if (typeof targetKeywordsEn === 'string') {
                targetKeywordsEn = targetKeywordsEn.split(',').map((k: string) => k.trim()).filter(Boolean);
            } else if (!Array.isArray(targetKeywordsEn)) {
                targetKeywordsEn = [provider.provider_name, "hosting review", "vpn review", "benchmarks"].filter(Boolean);
            }

            // Fallback for empty social fields
            if (!meta.social_tw_text) meta.social_tw_text = `${meta.title} 👇 #hosting #review`;
            if (!meta.social_fb_text) meta.social_fb_text = `Check out our latest review: ${meta.title}. Is it worth it? Read more here!`;
            if (!meta.social_li_text) meta.social_li_text = `New Industry Review: ${meta.title}. We analyze the performance, pricing, and true value proposition.`;
            if (!meta.social_hashtags || meta.social_hashtags.length === 0) meta.social_hashtags = ["hosting", "tech", "review"];

            await sendProgress({ status: 'Magic Translate to ES (Natural Flow)...', progress: 90 });

            const translationPrompt = `
            You are a top-tier tech copywriter and SEO expert specializing in Hosting and VPN (like GSMArena but for Cloud). 
            Translate the following blog post to Spanish (Spain/Neutral).
            
            CRITICAL RULES FOR NATURAL SPANISH:
            1. **AVOID LITERAL TRANSLATION**: Do not translate word-for-word. If an English expression sounds stiff in Spanish, rewrite it to sound like a native tech expert wrote it from scratch. 
               - BAD: "Este hosting tiene un gran uptime."
               - GOOD: "La estabilidad de este hosting es impecable, manteniendo el servicio online sin interrupciones."
            2. **TECHNICAL TERMS**: DO NOT TRANSLATE terms like "Hosting", "VPS", "VPN", "Uptime", "Dashboard", "cPanel", "SSD NVMe", "Bandwidth", "Logs", "Backups". Spanish speakers in this industry use the English terms.
            3. **TONE**: Professional but engaging. Avoid "Usted". Use "tú" or impersonal forms for a modern startup feel.
            4. **HTML**: Preserve ALL HTML tags (<p>, <h2>, <strong>, etc.) exactly as they are in the "content".
            5. **SEO & HOOKS**: The "excerpt", "seo_title", and "social" fields must be catchy. In Spanish, use punchy verbs.
            
            EN DATA JSON:
            ${JSON.stringify({
                title: meta.title,
                excerpt: meta.excerpt,
                seo_title: meta.seo_title,
                seo_description: meta.seo_description,
                target_keywords: targetKeywordsEn.join(', '),
                social_tw_text: meta.social_tw_text,
                social_fb_text: meta.social_fb_text,
                social_li_text: meta.social_li_text,
                social_hashtags: meta.social_hashtags,
                content: fullContent.substring(0, 15000)
            })}
            `;

            let translatedFields: any = {};
            try {
                const transRaw = await generateWithGemini(geminiKey!, modelToUse, "You are a professional tech translator. Return ONLY valid JSON.", translationPrompt);
                const jsonMatch = transRaw.match(/\{[\s\S]*\}/);
                translatedFields = JSON.parse(jsonMatch ? jsonMatch[0] : transRaw || "{}");
            } catch (e: any) {
                logger.error('Failed to translate post during generation:', e.message);
            }

            const randomSuffix = Math.random().toString(36).substring(2, 6);
            const slugBase = (meta.title || provider.provider_name || 'review').toString();
            const cleanSlug = slugBase.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').substring(0, 60);
            const finalSlug = `${cleanSlug}-${randomSuffix}`;

            const finalCategory = body.custom_category || (provider.type === 'vpn' ? 'VPN Reviews' : 'Hosting Reviews');

            // Sanitize hashtags and keywords
            const sanitizeArray = (val: any) => {
                if (typeof val === 'string') return val.split(/[\s,]+/).map((t: string) => t.trim()).filter(Boolean);
                if (Array.isArray(val)) return val;
                return null;
            };

            const hashtagsEs = sanitizeArray(translatedFields?.social_hashtags)?.map((t: string) => t.startsWith("#") ? t : `#${t}`);
            const keywordsEs = sanitizeArray(translatedFields?.target_keywords);

            const baseUrl = `https://hostingsarena.com`;
            const enDraftUrl = `${baseUrl}/en/news/${finalSlug}`;
            const esDraftUrl = `${baseUrl}/es/news/${finalSlug}`;

            const fixSocial = (text: string | null, url: string) => {
                if (!text) return null;
                return text.replace(/https?:\/\/(www\.)?hostingsarena\.com(\/[a-z]{2})?\/news\/[^\s]+(?=\s|$)/g, '').trim() + `\n\n${url}`;
            };

            const { error: insertError } = await supabase.from('posts').insert({
                title: meta.title,
                slug: finalSlug,
                content: fullContent,
                excerpt: meta.excerpt,
                category: finalCategory,
                status: 'draft',
                is_ai_generated: true,
                ai_quality_score: meta.rating_score || 85,
                seo_title: meta.seo_title,
                seo_description: meta.seo_description,
                target_keywords: targetKeywordsEn,
                related_provider_name: provider.provider_name,
                image_prompt: meta.image_prompt,
                social_tw_text: fixSocial(meta.social_tw_text, enDraftUrl),
                social_fb_text: fixSocial(meta.social_fb_text, enDraftUrl),
                social_li_text: fixSocial(meta.social_li_text, enDraftUrl),
                social_hashtags: meta.social_hashtags,
                // Translated fields
                title_es: translatedFields.title || null,
                content_es: translatedFields.content || null,
                excerpt_es: translatedFields.excerpt || null,
                seo_title_es: translatedFields.seo_title || null,
                seo_description_es: translatedFields.seo_description || null,
                target_keywords_es: keywordsEs || null,
                social_tw_text_es: fixSocial(translatedFields.social_tw_text, esDraftUrl),
                social_fb_text_es: fixSocial(translatedFields.social_fb_text, esDraftUrl),
                social_li_text_es: fixSocial(translatedFields.social_li_text, esDraftUrl),
                social_hashtags_es: hashtagsEs || null,
                updated_at: new Date().toISOString(),
            });

            if (insertError) throw new Error(insertError.message);
            await sendProgress({ status: 'Done', progress: 100, success: true });

        } catch (error: any) {
            logger.error('Fatal error during AI generation:', error);
            await sendProgress({ error: error.message || 'Generation failed' });
        } finally {
            writer.close();
        }
    };

    runGeneration();

    return new Response(readable, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        },
    });
}