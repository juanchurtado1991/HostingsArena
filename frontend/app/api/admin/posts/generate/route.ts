import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/tasks';

/**
 * POST /api/admin/posts/generate
 * 
 * Generate AI news posts using OpenAI GPT-4o.
 * Picks random providers, generates article content, saves as drafts.
 * 
 * Body: { count?: number } (default: 2)
 */
export async function POST(request: NextRequest) {
    try {
        const supabase = createAdminClient();
        const body = await request.json().catch(() => ({}));
        const count = Math.min(body.count || 2, 10); // Max 10 at a time

        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            return NextResponse.json(
                { error: 'OPENAI_API_KEY not configured' },
                { status: 500 }
            );
        }

        // Fetch random providers for article topics
        // Fetch top rated providers to ensure we write about popular/good services
        const [hostingRes, vpnRes] = await Promise.all([
            supabase.from('hosting_providers').select('provider_name, pricing_monthly, website_url, rating').order('rating', { ascending: false }).limit(25),
            supabase.from('vpn_providers').select('provider_name, pricing_monthly, website_url, rating').order('rating', { ascending: false }).limit(25),
        ]);

        const allProviders = [
            ...(hostingRes.data || []).map(p => ({ ...p, type: 'hosting' })),
            ...(vpnRes.data || []).map(p => ({ ...p, type: 'vpn' })),
        ];

        if (allProviders.length === 0) {
            return NextResponse.json({ error: 'No providers found' }, { status: 400 });
        }

        // Weighted random selection: Higher chance for top providers
        // We take the top 50 accumulated, then shuffle to pick 'count'
        // This ensures we mostly write about popular ones but rotate them.
        const shuffled = allProviders.sort(() => Math.random() - 0.5);
        const selectedProviders = shuffled.slice(0, count);

        const categories = [
            'Security', 'Performance', 'Privacy', 'Pricing',
            'Technology', 'Hosting Market', 'VPN News', 'Industry Analysis',
        ];

        const generatedPosts = [];
        const errors = [];

        for (const provider of selectedProviders) {
            const category = categories[Math.floor(Math.random() * categories.length)];
            const price = provider.pricing_monthly ? `$${provider.pricing_monthly}/mo` : 'competitive pricing';
            const rating = provider.rating ? `${provider.rating}/5` : 'highly rated';

            try {
                const response = await fetch('https://api.openai.com/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${apiKey}`,
                    },
                    body: JSON.stringify({
                        model: 'gpt-4o',
                        messages: [
                            {
                                role: 'system',
                                content: `You are an expert tech journalist for HostingArena. Your goal is to write authoritative, high-quality news and analysis about web hosting and VPNs.
                                
STRICT STYLE GUIDELINES:
1.  **Journalistic Structure**: Start with the most important insight (the "hook"). Explain why it matters. End with a verdict.
2.  **No Fluff**: AVOID filler phrases like "In today's digital landscape", "Unlock potential", "Delve into". Be direct and concise.
3.  **Data-Driven**: Use the provided data (Price: ${price}, Rating: ${rating}) to ground your article in reality.
4.  **Opinionated**: Don't just describe. Analyze. Is this a good deal? Who is it for?
5.  **Format**: Use clean HTML (<h2>, <p>, <ul>, <strong>). No <h1>.
6.  **Length**: 450-650 words.`
                            },
                            {
                                role: 'user',
                                content: `Write a compelling ${category} article focusing on **${provider.provider_name}**.

Context:
- Provider: ${provider.provider_name}
- Type: ${provider.type === 'hosting' ? 'Web Hosting' : 'VPN'} Service
- Current Price: ${price}
- User Rating: ${rating}

Focus: Analyze ${provider.provider_name}'s position in the ${category} market. Compare it briefly to competitors if relevant.

Return a JSON object with these exact fields:
{
  "title": "Punchy, click-worthy headline (max 80 chars)",
  "excerpt": "Direct, factual summary (max 200 chars)",
  "content": "Full article HTML. Include specific details about pricing and features.",
  "seo_title": "SEO Title (max 60 chars)",
  "seo_description": "SEO Meta Description (max 155 chars)",
  "target_keywords": ["keyword1", "keyword2", "keyword3"],
  "image_prompt": "Photorealistic, modern tech office or server room concept featuring ${provider.provider_name} branding colors. High quality, 4k.",
  "ai_quality_score": 85
}

Return ONLY the JSON.`
                            }
                        ],
                        temperature: 0.7,
                        max_tokens: 2000,
                    }),
                });

                if (!response.ok) {
                    const errText = await response.text();
                    console.error(`[PostGenerate] OpenAI error for ${provider.provider_name}:`, response.statusText, errText);
                    errors.push({ provider: provider.provider_name, error: `OpenAI Error: ${response.status} ${response.statusText}`, details: errText });
                    continue;
                }

                const aiResult = await response.json();
                const rawContent = aiResult.choices?.[0]?.message?.content?.trim();

                if (!rawContent) {
                    errors.push({ provider: provider.provider_name, error: 'Empty response from OpenAI' });
                    continue;
                }

                // Parse JSON (handle potential markdown fences)
                let jsonStr = rawContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
                let article;
                try {
                    article = JSON.parse(jsonStr);
                } catch (parseErr) {
                    console.error("JSON Parse Error:", parseErr, "Raw:", jsonStr);
                    errors.push({ provider: provider.provider_name, error: 'Failed to parse AI JSON', raw: jsonStr });
                    continue;
                }

                // Generate slug
                const slug = article.title
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/(^-|-$)/g, '')
                    .substring(0, 80);

                // Save to database
                const { data: post, error } = await supabase
                    .from('posts')
                    .insert({
                        title: article.title,
                        slug: `${slug}-${Date.now()}`,
                        content: article.content,
                        excerpt: article.excerpt,
                        category: category,
                        status: 'draft',
                        is_ai_generated: true,
                        ai_quality_score: article.ai_quality_score || 75,
                        ai_feedback: { model: 'gpt-4o', generated_at: new Date().toISOString() },
                        seo_title: article.seo_title,
                        seo_description: article.seo_description,
                        target_keywords: article.target_keywords || [],
                        related_provider_name: provider.provider_name,
                        image_prompt: article.image_prompt,
                    })
                    .select()
                    .single();

                if (error) {
                    console.error(`[PostGenerate] DB error for ${provider.provider_name}:`, error);
                    errors.push({ provider: provider.provider_name, error: 'Database Insert Error', details: error.message });
                    continue;
                }

                generatedPosts.push(post);
            } catch (err) {
                console.error(`[PostGenerate] Error generating post for ${provider.provider_name}:`, err);
                errors.push({ provider: provider.provider_name, error: 'Unexpected Error', details: String(err) });
            }
        }

        return NextResponse.json({
            success: true,
            message: `Generated ${generatedPosts.length} of ${count} requested posts`,
            generated: generatedPosts.length,
            posts: generatedPosts,
            errors: errors,
            providerCount: selectedProviders.length,
        });
    } catch (error) {
        console.error('[PostGenerate] Error:', error);
        return NextResponse.json(
            { error: 'Failed to generate posts', details: String(error) },
            { status: 500 }
        );
    }
}
