import { createAdminClient } from "@/lib/supabase/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const supabase = await createAdminClient();
    const { providerId, format, lang } = await request.json();

    if (!providerId) {
        return NextResponse.json({ error: "Provider ID is required" }, { status: 400 });
    }

    try {
        // 1. Fetch Provider Data (Hosting or VPN)
        // Check hosting first
        let { data: provider, error } = await supabase
            .from('hosting_providers')
            .select('*')
            .eq('id', providerId)
            .single();

        let type = 'hosting';

        if (!provider) {
            // Check VPN
            const { data: vpnProvider, error: vpnError } = await supabase
                .from('vpn_providers')
                .select('*')
                .eq('id', providerId)
                .single();
            
            if (vpnProvider) {
                provider = vpnProvider;
                type = 'vpn';
            }
        }

        if (!provider) {
            return NextResponse.json({ error: "Provider not found" }, { status: 404 });
        }

        // 2. Prepare Context for Gemini
        const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
            You are a professional video script writer for HostingArena.com.
            Create a highly engaging, high-converting 60-second video script (YouTube Shorts/TikTok format) for the following provider:
            
            Name: ${provider.provider_name}
            Type: ${type}
            Monthly Price: $${provider.pricing_monthly}
            Renewal Price: $${provider.renewal_price}
            Support Score: ${type === 'hosting' ? provider.support_score : provider.support_quality_score}/10
            Performance: ${provider.performance_grade}
            Key Features: ${JSON.stringify(provider.features || {})}
            Editor Notes: ${provider.raw_data?.notes || ''}

            RULES:
            1. Language: ${lang === 'es' ? 'Spanish' : 'English'}.
            2. Goal: Hook the viewer in the first 3 seconds and drive them to click the affiliate link.
            3. Structure: Hook -> Pain Point -> Solution (${provider.provider_name}) -> Key Data (Price/Performance) -> CTA.
            4. Style: Energetic, clear, and professional.
            5. Duration: Max 140 words (for ~60s speech).
            6. Include [Visual: ...] tags for scene suggestions.
            
            Do not use markdown formatting for the script text, just the plain script with [Visual] tags.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const script = response.text();

        return NextResponse.json({ script });

    } catch (error: any) {
        console.error("Video Script API Error:", error);
        return NextResponse.json({ error: "Failed to generate script", details: error.message }, { status: 500 });
    }
}
