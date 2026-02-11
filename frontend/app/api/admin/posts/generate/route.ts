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
            const apiKey = process.env.OPENAI_API_KEY;
            const body = await request.json().catch(() => ({}));
            const currentYear = new Date().getFullYear();

            if (!apiKey) {
                await sendProgress({ error: 'OPENAI_API_KEY not configured' });
                return;
            }

            // 1. OBTENCIÓN DE DATOS
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

            // Selección del Proveedor
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

            // Build a rich data object for the AI
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

            // 2. MOTOR DE "PERSONALIDAD Y CAOS"

            // A. El "Gancho" Narrativo (Storytelling Arc)
            const narrativeArcs = [
                "The 'Skeptic Converted': You thought it was trash, but were proven wrong.",
                "The 'Hidden Flaw': It looks perfect on paper, but you found a deal-breaker.",
                "The 'David vs Goliath': Comparing this small provider to AWS/Google and finding it better for specific things.",
                "The 'Migration Nightmare': You are testing this because your previous host crashed.",
                "The 'Speed Freak': You care ONLY about milliseconds and raw performance."
            ];

            // Si el usuario eligió un escenario manual, lo usamos. Si no, caos aleatorio.
            const selectedArc = body.scenario && body.scenario !== 'random'
                ? body.scenario
                : narrativeArcs[Math.floor(Math.random() * narrativeArcs.length)];

            // B. La "Prueba de Tortura" (Specific Stress Test)
            const stressTests = [
                "Installing a heavy WooCommerce store with 5,000 products.",
                "Running a Minecraft Server with 50+ mods.",
                "Simulating a Reddit 'Hug of Death' traffic spike.",
                "Uploading a 10GB SQL database dump via CLI.",
                "Streaming 4K video through the VPN from 3 different continents simultaneously."
            ];
            const selectedTest = stressTests[Math.floor(Math.random() * stressTests.length)];

            // 2. STRUCTURE & TONE ENGINE
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

            // Positive & Imaginative Personas
            const personas = [
                "The Enthusiastic Futurist (Loves innovation, optimistic)",
                "The Helpful Mentor (Explains things simply, wants you to succeed)",
                "The Digital AESTHETE (Appreciates good UI/UX and clean code)",
                "The Performance Junkie (Gets excited about speed and uptime)"
            ];
            const selectedPersona = personas[Math.floor(Math.random() * personas.length)];
            const selectedVoice = selectedPersona;

            const extraInstructions = body.extra_instructions
                ? `\n\n**SPECIAL USER INSTRUCTIONS (Must Follow):** ${body.extra_instructions}`
                : "";

            await sendProgress({
                status: `Creating Story: ${provider.provider_name} | Arc: ${selectedArc}`,
                progress: 20
            });

            // 3. GENERACIÓN DE CONTENIDO
            const contentRes = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
                body: JSON.stringify({
                    model: 'gpt-4o',
                    messages: [
                        {
                            role: 'system',
                            content: `You are a World-Class Tech Editor.
                            Task: Write a comprehensive, imaginative review of **${provider.provider_name}**.
                            
                            **CRITICAL DATA (MUST USE):**
                            ${specsString}
                            
                            **PARAMETERS:**
                            - Length: **Long-form (approx 2000 words)**. This is a 10-minute read.
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
                                
                                <!-- Content Body (approx 1500-2000 words) -->
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
                    temperature: 0.9, // Subimos temperatura para más creatividad
                })
            });

            const contentJson = await contentRes.json();
            let fullContent = contentJson.choices?.[0]?.message?.content || "";
            fullContent = fullContent.replace(/```html/g, '').replace(/```/g, '').trim();

            await sendProgress({ status: `Generating Viral Metadata...`, progress: 80 });

            // 4. GENERACIÓN DE METADATA (Enfoque Clickbait/Viral)
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
                            
                            Return JSON:
                            {
                                "title": "Viral Title (e.g., 'The Future of Hosting?', 'Why X is a Game Changer')",
                                "seo_title": "SEO Title (60 chars max)",
                                "seo_description": "Meta Description (160 chars) - Focus on benefits.",
                                "excerpt": "2 sentences that hook the reader with a powerful metaphor.",
                                "image_prompt": "Cinematic 8k photography, futuristic server room, neon cyan and blue accents, depth of field",
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
                updated_at: new Date().toISOString(),
            });

            if (insertError) throw new Error(insertError.message);

            await sendProgress({ status: 'Done', progress: 100, success: true });

        } catch (error: any) {
            console.error('Fatal error:', error);
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