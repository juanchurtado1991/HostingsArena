import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/tasks';
import { logger } from '@/lib/logger';
import { requireAuth } from '@/lib/auth/guard';
import { personas, structures, narrativeArcs, stressTests } from './data';
import { buildContentSystemPrompt, buildMetaSystemPrompt } from './prompts';

export async function POST(request: NextRequest) {
    const authError = await requireAuth();
    if (authError) return authError;

    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const encoder = new TextEncoder();

    const sendProgress = async (data: any) => {
        await writer.write(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
    };

    const fetchWithRetry = async (url: string, options: any, retries = 3, backoff = 1000) => {
        let lastError: any;
        for (let i = 0; i < retries; i++) {
            try {
                const res = await fetch(url, options);
                if (res.ok) return res;

                // Retry on transient errors: 500, 502, 503, 504, 520, 429
                if (![429, 500, 502, 503, 504, 520].includes(res.status)) {
                    return res;
                }

                logger.warn(`OpenAI fetch failed with ${res.status}, retry ${i + 1}/${retries}`);
                lastError = new Error(`OpenAI Error ${res.status}`);
            } catch (e: any) {
                lastError = e;
                logger.warn(`OpenAI fetch exception: ${e.message}, retry ${i + 1}/${retries}`);
            }
            if (i < retries - 1) {
                await new Promise(r => setTimeout(r, backoff * Math.pow(2, i)));
            }
        }
        throw lastError || new Error('Fetch failed after retries');
    };

    const runGeneration = async () => {
        try {
            const supabase = createAdminClient();
            const apiKey = process.env.OPENAI_API_KEY;
            const body = await request.json().catch(() => ({}));
            const currentYear = new Date().getFullYear();

            if (!apiKey) {
                await sendProgress({ error: 'OPENAI_API_KEY not configured' });
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

            const modelToUse = body.model || 'gpt-4o-mini';
            const targetWordCount = body.target_word_count || 1500;
            const approxReadingTime = Math.ceil(targetWordCount / 200);

            const extraInstructions = body.extra_instructions
                ? `\n\n**SPECIAL USER INSTRUCTIONS (Must Follow):** ${body.extra_instructions}`
                : "";

            await sendProgress({
                status: `Creating Story: ${provider.provider_name} | Arc: ${selectedArc}`,
                progress: 20
            });

            const contentRes = await fetchWithRetry('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
                body: JSON.stringify({
                    model: modelToUse,
                    messages: [
                        {
                            role: 'system',
                            content: buildContentSystemPrompt({
                                providerName: provider.provider_name,
                                specsString,
                                targetWordCount,
                                approxReadingTime,
                                structure: selectedStructure,
                                persona: selectedPersona,
                                arc: selectedArc,
                                test: selectedTest,
                                extraInstructions
                            })
                        }
                    ],
                    temperature: 0.9,
                })
            });

            if (!contentRes.ok) {
                const errorText = await contentRes.text();
                logger.error('OpenAI Content Generation failed:', { status: contentRes.status, errorText });
                throw new Error(`OpenAI Content Error (${contentRes.status})`);
            }

            const contentJson = await contentRes.json();
            let fullContent = contentJson.choices?.[0]?.message?.content || "";
            fullContent = fullContent.replace(/```html/g, '').replace(/```/g, '').trim();

            await sendProgress({ status: `Generating Viral Metadata...`, progress: 80 });

            const metaRes = await fetchWithRetry('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
                body: JSON.stringify({
                    model: 'gpt-4o-mini',
                    response_format: { type: "json_object" },
                    messages: [
                        {
                            role: 'system',
                            content: buildMetaSystemPrompt({
                                structureName: selectedStructure.name,
                                providerName: provider.provider_name,
                                persona: selectedPersona,
                                extraInstructions,
                                currentYear
                            })
                        }
                    ],
                    temperature: 0.85,
                })
            }).catch(e => {
                logger.error('Meta generation fetch failed finally:', e);
                return { ok: false, status: 500 } as any;
            });

            if (!metaRes.ok) {
                const errorText = await metaRes.text();
                logger.error('OpenAI Metadata Generation failed:', { status: metaRes.status, errorText });
                // We don't throw here, use fallback
                console.warn('Using fallback metadata due to OpenAI error');
            }

            const metaJson = metaRes.ok ? await metaRes.json() : {};
            let meta;
            try {
                meta = JSON.parse(metaJson.choices?.[0]?.message?.content || "{}");
            } catch (e) {
                meta = {
                    title: `Is ${provider.provider_name} Worth It in ${currentYear}?`,
                    seo_title: `${provider.provider_name} Review ${currentYear}`,
                    seo_description: `Honest review of ${provider.provider_name}.`,
                    excerpt: `We tested ${provider.provider_name} to see if the hype is real.`,
                    image_prompt: "server room tech",
                    social_tw_text: `Is ${provider.provider_name} the best host in ${currentYear}? We tested it. 👇`,
                    social_li_text: `We just completed our deep dive review of ${provider.provider_name}. Here is what the data says about their performance and pricing.`,
                    social_fb_text: `Looking for a new host? We just put ${provider.provider_name} to the test. Check out our findings!`,
                    social_hashtags: ["webhosting", "techreview", "server"],
                    rating_score: 80
                };
            }

            // Fallback for empty social fields
            if (!meta.social_tw_text) meta.social_tw_text = `${meta.title} 👇 #hosting #review`;
            if (!meta.social_fb_text) meta.social_fb_text = `Check out our latest review: ${meta.title}. Is it worth it? Read more here!`;
            if (!meta.social_li_text) meta.social_li_text = `New Industry Review: ${meta.title}. We analyze the performance, pricing, and true value proposition.`;
            if (!meta.social_hashtags || meta.social_hashtags.length === 0) meta.social_hashtags = ["hosting", "tech", "review"];

            await sendProgress({ status: 'Magic Translate to ES...', progress: 90 });

            const translationPrompt = `
            You are a professional tech translator and social media expert specializing in Cloud Hosting and VPN.
            Translate the following article from English to Spanish.
            
            CRITICAL RULES:
            1. CONTENT: Keep HTML structure exactly as is. Translate the text inside tags.
            2. METADATA: Translate title, excerpt, seo_title, and seo_description.
            3. SOCIAL: Generate or translate engaging social media copy in Spanish.
            4. Return a JSON object with: title, content, excerpt, seo_title, seo_description, social_tw_text, social_fb_text, social_li_text, social_hashtags.
            5. IMPORTANT: social_hashtags MUST be an ARRAY of strings.
            
            EN DATA:
            - title: ${meta.title}
            - excerpt: ${meta.excerpt}
            - seo_title: ${meta.seo_title}
            - seo_description: ${meta.seo_description}
            - social_tw_text: ${meta.social_tw_text}
            - social_fb_text: ${meta.social_fb_text}
            - social_li_text: ${meta.social_li_text}
            - social_hashtags: ${(meta.social_hashtags || []).join(' ')}
            
            EN CONTENT (HTML):
            ${fullContent.substring(0, 10000)} // Safety limit
            `;

            let translatedFields: any = {};
            try {
                const t0 = Date.now();
                const translationRes = await fetchWithRetry('https://api.openai.com/v1/chat/completions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
                    body: JSON.stringify({
                        model: 'gpt-4o-mini',
                        response_format: { type: "json_object" },
                        messages: [
                            {
                                role: 'system',
                                content: 'You are a professional tech translator. Respond ONLY with valid JSON.'
                            },
                            {
                                role: 'user',
                                content: translationPrompt
                            }
                        ],
                        temperature: 0.3,
                    })
                });

                if (translationRes.ok) {
                    const translationJson = await translationRes.json();
                    translatedFields = JSON.parse(translationJson.choices?.[0]?.message?.content || "{}");
                    console.log(`Translation successful in ${Date.now() - t0}ms`);
                } else {
                    const errorText = await translationRes.text();
                    logger.error(`OpenAI Translation failed with status ${translationRes.status}:`, errorText);
                }
            } catch (e: any) {
                logger.error('Failed to translate post during generation:', e.message);
            }

            const randomSuffix = Math.random().toString(36).substring(2, 6);
            const cleanSlug = meta.title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '')
                .substring(0, 60);

            const finalSlug = `${cleanSlug}-${randomSuffix}`;
            const finalCategory = body.custom_category
                ? body.custom_category
                : (provider.type === 'vpn' ? 'VPN Reviews' : 'Hosting Reviews');

            // Sanitize hashtags to be an array for the DB
            let hashtagsEs = translatedFields?.social_hashtags;
            if (hashtagsEs && typeof hashtagsEs === 'string') {
                hashtagsEs = hashtagsEs.split(/[\s,]+/).map((t: string) => t.startsWith("#") ? t : `#${t}`).filter(Boolean);
            } else if (!Array.isArray(hashtagsEs)) {
                hashtagsEs = null;
            }

            const baseUrl = `https://hostingsarena.com`;
            const enDraftUrl = `${baseUrl}/en/news/${finalSlug}`;
            const esDraftUrl = `${baseUrl}/es/news/${finalSlug}`;

            // Helper to fix links in generated social text
            const fixGeneratedSocialLink = (text: string | null, liveUrl: string) => {
                if (!text) return null;
                // Robust regex to move ALL variations of hostingsarena news links
                const cleaned = text.replace(/https?:\/\/(www\.)?hostingsarena\.com(\/[a-z]{2})?\/news\/[^\s]+(?=\s|$)/g, '').trim();
                return `${cleaned}\n\n${liveUrl}`;
            };

            // Process EN Social Links
            meta.social_tw_text = fixGeneratedSocialLink(meta.social_tw_text, enDraftUrl);
            meta.social_fb_text = fixGeneratedSocialLink(meta.social_fb_text, enDraftUrl);
            meta.social_li_text = fixGeneratedSocialLink(meta.social_li_text, enDraftUrl);

            // Process ES Social Links
            translatedFields.social_tw_text = fixGeneratedSocialLink(translatedFields.social_tw_text, esDraftUrl);
            translatedFields.social_fb_text = fixGeneratedSocialLink(translatedFields.social_fb_text, esDraftUrl);
            translatedFields.social_li_text = fixGeneratedSocialLink(translatedFields.social_li_text, esDraftUrl);

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
                related_provider_name: provider.provider_name,
                image_prompt: meta.image_prompt,
                social_tw_text: meta.social_tw_text,
                social_fb_text: meta.social_fb_text,
                social_li_text: meta.social_li_text,
                social_hashtags: meta.social_hashtags,
                // Translated fields
                title_es: translatedFields.title || null,
                content_es: translatedFields.content || null,
                excerpt_es: translatedFields.excerpt || null,
                seo_title_es: translatedFields.seo_title || null,
                seo_description_es: translatedFields.seo_description || null,
                social_tw_text_es: translatedFields.social_tw_text || null,
                social_fb_text_es: translatedFields.social_fb_text || null,
                social_li_text_es: translatedFields.social_li_text || null,
                social_hashtags_es: hashtagsEs,
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