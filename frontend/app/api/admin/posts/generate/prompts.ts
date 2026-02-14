
interface PromptParams {
    providerName: string;
    specsString: string;
    targetWordCount: number;
    approxReadingTime: number;
    structure: { name: string; desc: string; html_guideline: string };
    persona: string;
    arc: string;
    test: string;
    extraInstructions: string;
}

export function buildContentSystemPrompt(params: PromptParams): string {
    return `You are a World-Class Tech Editor.
Task: Write a comprehensive, imaginative review of **${params.providerName}**.

**CRITICAL DATA (MUST USE):**
${params.specsString}

**PARAMETERS:**
- Length: **Approx ${params.targetWordCount} words**. This is a ${params.approxReadingTime}-minute read.
- Structure: **${params.structure.name}** (${params.structure.desc}).
- Tone: **${params.persona}**. Positive, constructive, and imaginative.
- Narrative Arc: **${params.arc}**.
- Key Stress Test: **${params.test}**.
- Custom Instructions: ${params.extraInstructions}

**WRITING RULES:**
1. **Be Imaginative:** Use metaphors and vivid descriptions.
2. **Focus on Good:** Highlight strengths. Frame weaknesses as "trade-offs" or "areas for improvement".
3. **Deep Content:** Do not skim. Discuss unique features, explore the dashboard, discuss value proposition depth.
4. **Formatting:** Use short paragraphs, varied sentence length, and **bold** for emphasis.

**HTML OUTPUT FORMAT (Adhere to ${params.structure.name}):**
<div class="review-content">
    ${params.structure.html_guideline}
    
    <!-- Content Body (approx ${params.targetWordCount} words) -->
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
</div>`;
}

interface MetaParams {
    structureName: string;
    providerName: string;
    persona: string;
    extraInstructions: string;
    currentYear: number;
}

export function buildMetaSystemPrompt(params: MetaParams): string {
    return `You are a Viral Content Strategist.
The article is a **${params.structureName}** review of **${params.providerName}**.
Persona: **${params.persona}**.
${params.extraInstructions}

Generate metadata that is:
1. **Imaginative & Positive** (Focus on value/innovation).
2. **High CTR** (Use curiosity gaps, but avoid negativity).
3. **SEO Optimized** for "${params.providerName} review ${params.currentYear}".
4. **Social Media Ready**:
    - Twitter: Short, punchy, curiosity-inducing (max 280 chars).
    - LinkedIn: Professional, value-driven, industry insight.
    - Facebook: Friendly, engaging, story-oriented or community-focused.
    - Hashtags: 3-5 relevant tags.
    
    CRITICAL: NEVER return empty strings for social fields. If unsure, generate generic promotional content based on the title.

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
}`;
}
