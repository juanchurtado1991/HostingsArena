require('dotenv').config({ path: '.env.local' });
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function listModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("Please set GEMINI_API_KEY environment variable.");
        process.exit(1);
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    try {
        console.log("Fetching available models...");
        // For listing models, we don't need a specific model instance.
        // However, the SDK might not expose a direct listModels method on the confusing new instance structure.
        // Let's try the standard fetch approach to be 100% sure of what the API sees.
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();

        if (data.models) {
            console.log("\n✅ AVAILABLE MODELS:");
            data.models.forEach(m => {
                if (m.name.includes('gemini') || m.name.includes('flash')) {
                    console.log(`- ${m.name} (${m.displayName})`);
                    console.log(`  Supported generation methods: ${m.supportedGenerationMethods.join(', ')}`);
                }
            });
        } else {
            console.error("❌ No models found or error:", data);
        }

    } catch (error) {
        console.error("Error listing models:", error);
    }
}

listModels();
