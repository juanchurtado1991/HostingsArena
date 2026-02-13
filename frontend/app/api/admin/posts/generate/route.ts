import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/tasks';
import { logger } from '@/lib/logger';

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
            const price = provider.pricing_monthly ? `$${provider.pricing_monthly}/mo` : 'market standard rates';

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

            const narrativeArcs = [
                "The 'Skeptic Converted': You thought it was trash, but were proven wrong.",
                "The 'Hidden Flaw': It looks perfect on paper, but you found a deal-breaker.",
                "The 'David vs Goliath': Comparing this small provider to AWS/Google and finding it better for specific things.",
                "The 'Migration Nightmare': You are testing this because your previous host crashed.",
                "The 'Speed Freak': You care ONLY about milliseconds and raw performance."
            ];

            const selectedArc = body.scenario && body.scenario !== 'random'
                ? body.scenario
                : narrativeArcs[Math.floor(Math.random() * narrativeArcs.length)];

            const stressTests = [
                "Installing a heavy WooCommerce store with 5,000 products.",
                "Running a Minecraft Server with 50+ mods.",
                "Simulating a Reddit 'Hug of Death' traffic spike.",
                "Uploading a 10GB SQL database dump via CLI.",
                "Streaming 4K video through the VPN from 3 different continents simultaneously."
            ];
            const selectedTest = stressTests[Math.floor(Math.random() * stressTests.length)];

            const structures = [
                {
                    name: "The Hero's Journey",
                    desc: "A narrative review. Start with a problem, introduce the provider as a potential solution, face challenges (cons), and reach a resolution.",
                    html_guideline: "Use <h2> for chapters (The Call, The Trial, The Reward). Focus on storytelling."
                },
                {
                    name: "The Deep Dive Technical Analysis",
                    desc: "A rigorous, data-heavy review. Focus on benchmarks, speed tests, and raw specs.",
                    html_guideline: "Use <div class='data-box'> for metrics. Compare strictly against competitors."
                },
                {
                    name: "The Ultimate Buyer's Guide",
                    desc: "Educational and helpful. Explain WHY features matter while reviewing the provider.",
                    html_guideline: "Use 'Who is this for?' sections and 'Pro Tips' boxes."
                }
            ];

            const selectedStructure = structures[Math.floor(Math.random() * structures.length)];

            const personas = [
                "The Enthusiastic Futurist (Loves innovation, optimistic)",
                "The Helpful Mentor (Explains things simply, wants you to succeed)",
                "The Digital AESTHETE (Appreciates good UI/UX and clean code)",
                "The Performance Junkie (Gets excited about speed and uptime)"
            ];
            const selectedPersona = personas[Math.floor(Math.random() * personas.length)];

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

            const contentRes = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
                body: JSON.stringify({
                    model: modelToUse,
                    messages: [
                        {
                            role: 'system',
                            content: `You are a World-Class Tech Editor.
                            Task: Write a comprehensive, imaginative review of **${provider.provider_name}**.
                            
                            **CRITICAL DATA (MUST USE):**
                            ${specsString}
                            
                            **PARAMETERS:**
                            - Length: **Approx ${targetWordCount} words**. This is a ${approxReadingTime}-minute read.
                            - Structure: **${selectedStructure.name}** (${selectedStructure.desc}).
                            - Tone: **${selectedPersona}**. Positive, constructive, and imaginative.
                            - Narrative Arc: **${selectedArc}**.
                            - Key Stress Test: **${selectedTest}**.
                            - Custom Instructions: ${extraInstructions}
                            
                            **WRITING RULES:**
                            1. **Be Imaginative:** Use metaphors and vivid descriptions.
                            2. **Focus on Good:** Highlight strengths. Frame weaknesses as "trade-offs" or "areas for improvement".
                            3. **Deep Content:** Do not skim. Discuss unique features, explore the dashboard, discuss value proposition depth.
                            4. **Formatting:** Use short paragraphs, varied sentence length, and **bold** for emphasis.
                            
                            **HTML OUTPUT FORMAT (Adhere to ${selectedStructure.name}):**
                            <div class="review-content">
                                ${selectedStructure.html_guideline}
                                
                                <!-- Content Body (approx ${targetWordCount} words) -->
                                [GENERATE CONTENT HERE]
                                
                                <!-- Required Elements -->
                                <div class="specs-box">
                                   <h3>Technical Snapshot</h3>
                                   <!-- Generate a table using the CRITICAL DATA provided above -->
                                   <table class="specs-table">
                                      <tr><th>Metric</th><th>Details</th></tr>
                                      <!-- Fill with JSON data -->
                                   </table>
                                </div>
                                
                                <div class="verdict-box">
                                   <h3>Final Thoughts</h3>
                                   [A 3-paragraph summary ending on a high note]
                                </div>
                            </div>`
                        }
                    ],
                    temperature: 0.9,
                })
            });

            const contentJson = await contentRes.json();
            let fullContent = contentJson.choices?.[0]?.message?.content || "";
            fullContent = fullContent.replace(/```html/g, '').replace(/```/g, '').trim();

            await sendProgress({ status: `Generating Viral Metadata...`, progress: 80 });

            const metaRes = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
                body: JSON.stringify({
                    model: 'gpt-4o-mini',
                    response_format: { type: "json_object" },
                    messages: [
                        {
                            role: 'system',
                            content: `You are a Viral Content Strategist.
                            The article is a **${selectedStructure.name}** review of **${provider.provider_name}**.
                            Persona: **${selectedPersona}**.
                            ${extraInstructions}
                            
                            Generate metadata that is:
                            1. **Imaginative & Positive** (Focus on value/innovation).
                            2. **High CTR** (Use curiosity gaps, but avoid negativity).
                            3. **SEO Optimized** for "${provider.provider_name} review ${currentYear}".
                            4. **Social Media Ready**:
                                - Twitter: Short, punchy, curiosity-inducing (max 280 chars).
                                - LinkedIn: Professional, value-driven, industry insight.
                                - Facebook: Friendly, engaging, story-oriented or community-focused.
                                - Hashtags: 3-5 relevant tags.
                            
                            Return JSON:
                            {
                                "title": "Viral Title (e.g., 'The Future of Hosting?', 'Why X is a Game Changer')",
                                "seo_title": "SEO Title (60 chars max)",
                                "seo_description": "Meta Description (160 chars) - Focus on benefits.",
                                "excerpt": "2 sentences that hook the reader with a powerful metaphor.",
                                "image_prompt": "Cinematic 8k photography, futuristic server room, neon cyan and blue accents, depth of field",
                                "social_tw_text": "Twitter post content (strings)",
                                "social_li_text": "LinkedIn post content (string)",
                                "social_fb_text": "Facebook post content (string)",
                                "social_hashtags": ["tag1", "tag2"],
                                "rating_score": 90
                            }`
                        }
                    ],
                    temperature: 0.85,
                })
            });

            const metaJson = await metaRes.json();
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