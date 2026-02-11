import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/tasks';

export async function POST(request: NextRequest) {
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const encoder = new TextEncoder();

    const sendProgress = async (data: any) => {
        await writer.write(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
    };

    const runGeneration = async () => {
        try {
            const supabase = createAdminClient();
            const body = await request.json().catch(() => ({}));
            const count = Math.min(body.count || 1, 3);
            const currentYear = new Date().getFullYear();

            const apiKey = process.env.OPENAI_API_KEY;
            if (!apiKey) {
                await sendProgress({ error: 'OPENAI_API_KEY not configured' });
                return;
            }

            const [hostingRes, vpnRes, affiliateRes] = await Promise.all([
                supabase.from('hosting_providers').select('provider_name, pricing_monthly, website_url'),
                supabase.from('vpn_providers').select('provider_name, pricing_monthly, website_url'),
                supabase.from('affiliate_partners').select('provider_name').eq('status', 'active')
            ]);

            const activeAffiliateNames = new Set((affiliateRes.data || []).map(a => a.provider_name));

            const allProviders = [
                ...(hostingRes.data || []).map(p => ({ ...p, type: 'hosting' })),
                ...(vpnRes.data || []).map(p => ({ ...p, type: 'vpn' })),
            ].filter(p => activeAffiliateNames.has(p.provider_name));

            if (allProviders.length === 0) {
                return NextResponse.json(
                    { error: 'No active affiliate partners found. Please add at least one active affiliate to generate content.' },
                    { status: 403 }
                );
            }

            const shuffled = allProviders.sort(() => Math.random() - 0.5);
            const selectedProviders = shuffled.slice(0, count);

            const totalSteps = selectedProviders.length * 7;
            let currentStep = 0;

            for (const provider of selectedProviders) {
                const price = provider.pricing_monthly ? `$${provider.pricing_monthly}/mo` : 'competitive pricing';

                await sendProgress({ status: `[${provider.provider_name}] Planning editorial structure...`, progress: Math.round((currentStep / totalSteps) * 100) });

                const architectRes = await fetch('https://api.openai.com/v1/chat/completions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
                    body: JSON.stringify({
                        model: 'gpt-4o-mini',
                        messages: [
                            {
                                role: 'system',
                                content: `You are the Editor-in-Chief of a tech blog. Return ONLY a JSON array of 5 strings representing engaging, conversational section headers for a review of ${provider.provider_name}. 
                            Avoid boring titles like 'Introduction' or 'Features'. 
                            Instead use titles like 'First Impressions', 'The Speed Test: Is it Fast in ${currentYear}?', 'Who is this for?', 'The Verdict'.`
                            },
                        ],
                        temperature: 0.8,
                    })
                });

                const architectJson = await architectRes.json();
                const rawText = architectJson.choices[0].message.content.replace(/```json\n?|```/g, '').trim();
                let sections = [];
                try {
                    sections = JSON.parse(rawText);
                } catch (e) {
                    sections = ["First Impressions", "Performance & Speed", "Security Features", "Pricing & Value", "Final Thoughts"];
                }

                if (sections.length > 5) sections = sections.slice(0, 5);
                currentStep++;

                let fullContent = "";
                for (let i = 0; i < sections.length; i++) {
                    const sectionTitle = sections[i];
                    await sendProgress({
                        status: `[${provider.provider_name}] Writing part ${i + 1}/${sections.length}: ${sectionTitle}...`,
                        progress: Math.round(((currentStep + i) / totalSteps) * 100)
                    });

                    const authorRes = await fetch('https://api.openai.com/v1/chat/completions', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
                        body: JSON.stringify({
                            model: 'gpt-4o-mini',
                            messages: [
                                {
                                    role: 'system',
                                    content: `Write a concise 250-word blog section in raw HTML (<p>, <h3>) about "${sectionTitle}" for ${provider.provider_name}. 
                                
                                RULES:
                                1. Do NOT use markdown code blocks (no \`\`\`html). Return raw text.
                                2. Use a conversational, expert human tone (use "we", "I", "our testing").
                                3. Avoid robotic lists or staring every sentence with "${provider.provider_name}".
                                4. Focus on the user experience and 'why' it matters, not just specs.
                                5. Use <p> tags primarily. Only use <ul> if absolutely necessary for specs.`
                                }
                            ],
                            temperature: 0.7,
                        })
                    });

                    const authorJson = await authorRes.json();
                    let contentRaw = authorJson.choices?.[0]?.message?.content || "";

                    contentRaw = contentRaw.replace(/```html/g, '').replace(/```/g, '').trim();

                    fullContent += `\n\n<h2>${sectionTitle}</h2>\n\n${contentRaw}`;
                }
                currentStep += sections.length;

                await sendProgress({ status: `[${provider.provider_name}] Finalizing...`, progress: Math.round((currentStep / totalSteps) * 100) });

                await sendProgress({
                    status: `[${provider.provider_name}] Crafting SEO title and meta tags...`,
                    progress: Math.round(((currentStep + 1) / totalSteps) * 100)
                });

                const metaRes = await fetch('https://api.openai.com/v1/chat/completions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
                    body: JSON.stringify({
                        model: 'gpt-4o-mini',
                        messages: [
                            {
                                role: 'system',
                                content: `You are an SEO expert for a tech blog. Return ONLY a valid JSON object. Do not wrap in markdown or code blocks.
                                
                                JSON Structure:
                                {
                                    "title": "Click-worthy H1 title (max 60 chars)",
                                    "seo_title": "SEO optimized title tag (max 60 chars)",
                                    "seo_description": "Compelling meta description (max 160 chars)",
                                    "excerpt": "Short summary for the blog card (2 sentences)",
                                    "image_prompt": "Prompt for an AI image generator (modern, tech, abstract)"
                                }

                                Rules:
                                1. Title must be catchy and CURRENT (e.g., 'Is [Provider] Worth It in ${currentYear}?' or '[Provider] Review ${currentYear}: Fast but Flawed?').
                                2. Avoid generic titles like 'Introduction to [Provider]'.
                                3. SEO Description must include keywords like '${currentYear} Review'.`
                            },
                            {
                                role: 'user',
                                content: `Provider: ${provider.provider_name}. Type: ${provider.type}. Pricing: ${price}.`
                            }
                        ],
                        temperature: 0.7,
                    })
                });

                const metaJson = await metaRes.json();

                let metaRaw = metaJson.choices[0].message.content
                    .replace(/```json/g, '')
                    .replace(/```/g, '')
                    .trim();

                let meta;
                try {
                    meta = JSON.parse(metaRaw);
                } catch (e) {
                    console.error("Error parsing meta JSON", e);
                    meta = {
                        title: `${provider.provider_name} Review: Is it Worth It?`,
                        seo_title: `${provider.provider_name} Review ${currentYear} - Features & Pricing`,
                        seo_description: `Read our honest review of ${provider.provider_name}. We tested speed, security, and pricing to see if it's the right choice for you in ${currentYear}.`,
                        excerpt: `Is ${provider.provider_name} the right choice for you? We break down its features, pricing, and performance in this quick review.`,
                        image_prompt: `futuristic technology abstract background representing ${provider.type} security and speed, digital art, blue and purple neon style`
                    };
                }

                const slug = meta.title
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/(^-|-$)/g, '')
                    .substring(0, 80);

                const { error: insertError } = await supabase.from('posts').insert({
                    title: meta.title,
                    slug: `${slug}-${Date.now()}`,
                    content: fullContent,
                    excerpt: meta.excerpt,
                    category: provider.type === 'vpn' ? 'VPN Reviews' : 'Hosting Reviews',
                    status: 'draft',
                    is_ai_generated: true,
                    seo_title: meta.seo_title,
                    seo_description: meta.seo_description,
                    related_provider_name: provider.provider_name,
                    image_prompt: meta.image_prompt,
                    updated_at: new Date().toISOString(),
                });

                if (insertError) {
                    console.error(`Error saving ${provider.provider_name}:`, insertError);
                    await sendProgress({ error: `Failed to save ${provider.provider_name} to database.` });
                } else {
                    await sendProgress({
                        status: `Successfully created post: ${meta.title}`,
                        progress: Math.round(((currentStep + 1) / totalSteps) * 100)
                    });
                }

                currentStep++;
            }

            await sendProgress({ status: 'Done', progress: 100, success: true });
        } catch (error) {
            console.error('Fatal error:', error);
            await sendProgress({ error: 'Generation failed critical error' });
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