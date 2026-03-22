import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import os from "os";
import { execSync } from 'child_process';
import { createAdminClient } from "@/lib/tasks/supabaseAdmin";

const escapeXml = (unsafe: string) => {
    return unsafe.replace(/[<>&"']/g, (c) => {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '"': return '&quot;';
            case "'": return '&apos;';
            default: return c;
        }
    });
};
import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";

// --- VOICE CATALOG ---
const EDGE_VOICES = [
    // English (Popular & Professional - 20 Voices)
    { id: "en-US-AndrewNeural",       name: "Andrew",       lang: "en", gender: "male",   accent: "US",         desc: "Professional, News" },
    { id: "en-US-BrianNeural",        name: "Brian",        lang: "en", gender: "male",   accent: "US",         desc: "Deep, Authoritative" },
    { id: "en-US-ChristopherNeural",  name: "Christopher",  lang: "en", gender: "male",   accent: "US",         desc: "Energetic, Commercial" },
    { id: "en-US-AvaNeural",          name: "Ava",          lang: "en", gender: "female", accent: "US",         desc: "Natural, Warm" },
    { id: "en-US-EmmaNeural",         name: "Emma",         lang: "en", gender: "female", accent: "US",         desc: "Friendly, Upbeat" },
    { id: "en-US-JennyNeural",        name: "Jenny",        lang: "en", gender: "female", accent: "US",         desc: "Assistant, Smooth" },
    { id: "en-US-AriaNeural",         name: "Aria",         lang: "en", gender: "female", accent: "US",         desc: "Confident, Clear" },
    { id: "en-US-GuyNeural",          name: "Guy",          lang: "en", gender: "male",   accent: "US",         desc: "Narrator, Calming" },
    { id: "en-US-SteffanNeural",      name: "Steffan",      lang: "en", gender: "male",   accent: "US",         desc: "Dynamic, Young" },
    { id: "en-US-MichelleNeural",     name: "Michelle",     lang: "en", gender: "female", accent: "US",         desc: "Soft, Conversational" },
    { id: "en-GB-RyanNeural",         name: "Ryan",         lang: "en", gender: "male",   accent: "UK",         desc: "Standard British, News" },
    { id: "en-GB-SoniaNeural",        name: "Sonia",        lang: "en", gender: "female", accent: "UK",         desc: "Elegant, British" },
    { id: "en-GB-LibbyNeural",        name: "Libby",        lang: "en", gender: "female", accent: "UK",         desc: "Warm, UK Assistant" },
    { id: "en-GB-ThomasNeural",       name: "Thomas",       lang: "en", gender: "male",   accent: "UK",         desc: "Clear, English Male" },
    { id: "en-AU-WilliamNeural",      name: "William",      lang: "en", gender: "male",   accent: "AU",         desc: "Natural, Australian" },
    { id: "en-AU-NatashaNeural",      name: "Natasha",      lang: "en", gender: "female", accent: "AU",         desc: "Friendly, AU Female" },
    { id: "en-CA-LiamNeural",         name: "Liam",         lang: "en", gender: "male",   accent: "CA",         desc: "Standard Canadian" },
    { id: "en-CA-ClaraNeural",        name: "Clara",        lang: "en", gender: "female", accent: "CA",         desc: "Clear, CA Female" },
    { id: "en-IE-ConnorNeural",       name: "Connor",       lang: "en", gender: "male",   accent: "IE",         desc: "Irish accent, Warm" },
    { id: "en-IN-PrabhatNeural",      name: "Prabhat",      lang: "en", gender: "male",   accent: "IN",         desc: "International English" },

    // Spanish (Popular & Professional - 20 Voices)
    { id: "es-MX-JorgeNeural",        name: "Jorge",        lang: "es", gender: "male",   accent: "Mexico",     desc: "Dynamic, News" },
    { id: "es-MX-DaliaNeural",        name: "Dalia",        lang: "es", gender: "female", accent: "Mexico",     desc: "Natural, Storytelling" },
    { id: "es-ES-AlvaroNeural",       name: "Álvaro",       lang: "es", gender: "male",   accent: "Spain",      desc: "Castilian, Strong" },
    { id: "es-ES-ElviraNeural",       name: "Elvira",       lang: "es", gender: "female", accent: "Spain",      desc: "Calm, Professional" },
    { id: "es-CO-GonzaloNeural",      name: "Gonzalo",      lang: "es", gender: "male",   accent: "Colombia",   desc: "Neutral Colombian" },
    { id: "es-CO-SalomeNeural",       name: "Salomé",       lang: "es", gender: "female", accent: "Colombia",   desc: "Soft, Warm" },
    { id: "es-AR-TomasNeural",        name: "Tomas",        lang: "es", gender: "male",   accent: "Argentina",  desc: "Friendly, Argentina" },
    { id: "es-AR-ElenaNeural",        name: "Elena",        lang: "es", gender: "female", accent: "Argentina",  desc: "Clear, Argentinian" },
    { id: "es-CL-LorenzoNeural",      name: "Lorenzo",      lang: "es", gender: "male",   accent: "Chile",      desc: "Professional, Chile" },
    { id: "es-CL-CatalinaNeural",     name: "Catalina",     lang: "es", gender: "female", accent: "Chile",      desc: "Natural, Chilean" },
    { id: "es-US-AlonsoNeural",       name: "Alonso",       lang: "es", gender: "male",   accent: "US",         desc: "US Spanish, Casual" },
    { id: "es-PE-AlexNeural",         name: "Alex",         lang: "es", gender: "male",   accent: "Peru",       desc: "Standard Peruvian" },
    { id: "es-VE-SebastianNeural",    name: "Sebastian",    lang: "es", gender: "male",   accent: "Venezuela",  desc: "Clear, Venezuelan" },
    { id: "es-CU-BelkysNeural",       name: "Belkys",       lang: "es", gender: "female", accent: "Cuba",       desc: "Caribbean, Warm" },
    { id: "es-DO-EmilioNeural",       name: "Emilio",       lang: "es", gender: "male",   accent: "Dominican",  desc: "Caribbean, Clear" },
    { id: "es-GT-AndresNeural",       name: "Andrés",       lang: "es", gender: "male",   accent: "Guatemala",  desc: "Clear, Guatemalan" },
    { id: "es-GT-MartaNeural",        name: "Marta",        lang: "es", gender: "female", accent: "Guatemala",  desc: "Friendly, Guatemalan" },
    { id: "es-SV-RodrigoNeural",      name: "Rodrigo",      lang: "es", gender: "male",   accent: "El Salvador",desc: "Dynamic, Salvadoran" },
    { id: "es-SV-LorenaNeural",       name: "Lorena",       lang: "es", gender: "female", accent: "El Salvador",desc: "Warm, Salvadoran" },
    { id: "es-EC-LuisNeural",         name: "Luis",         lang: "es", gender: "male",   accent: "Ecuador",    desc: "Neutral, Ecuadorian" },
    { id: "es-EC-AndreaNeural",       name: "Andrea",       lang: "es", gender: "female", accent: "Ecuador",    desc: "Clear, Ecuadorian" },
    { id: "es-BO-MarceloNeural",      name: "Marcelo",      lang: "es", gender: "male",   accent: "Bolivia",    desc: "Warm, Bolivian" },
    { id: "es-BO-SofiaNeural",        name: "Sofia",        lang: "es", gender: "female", accent: "Bolivia",    desc: "Friendly, Bolivian" },
    { id: "es-PY-MarioNeural",        name: "Mario",        lang: "es", gender: "male",   accent: "Paraguay",   desc: "Clear, Paraguayan" },
    { id: "es-PY-TaniaNeural",        name: "Tania",        lang: "es", gender: "female", accent: "Paraguay",   desc: "Bright, Paraguayan" },
    { id: "es-UY-MateoNeural",        name: "Mateo",        lang: "es", gender: "male",   accent: "Uruguay",    desc: "Conversational, Uruguayan" },
    { id: "es-PR-KarinaNeural",       name: "Karina",       lang: "es", gender: "female", accent: "Puerto Rico",desc: "Energetic, Puerto Rican" },
    { id: "es-HN-CarlosNeural",       name: "Carlos",       lang: "es", gender: "male",   accent: "Honduras",   desc: "Clear, Honduran" },
    { id: "es-HN-KarlaNeural",        name: "Karla",        lang: "es", gender: "female", accent: "Honduras",   desc: "Warm, Honduran" },
    { id: "es-NI-FedericoNeural",     name: "Federico",     lang: "es", gender: "male",   accent: "Nicaragua",  desc: "Standard, Nicaraguan" },
    { id: "es-NI-YolandaNeural",      name: "Yolanda",      lang: "es", gender: "female", accent: "Nicaragua",  desc: "Clear, Nicaraguan" },
    { id: "es-CR-JuanNeural",         name: "Juan",         lang: "es", gender: "male",   accent: "Costa Rica", desc: "Friendly, Costa Rican" },
    { id: "es-CR-MariaNeural",        name: "María",        lang: "es", gender: "female", accent: "Costa Rica", desc: "Professional, Costa Rican" },
    { id: "es-PA-RobertoNeural",      name: "Roberto",      lang: "es", gender: "male",   accent: "Panama",     desc: "Dynamic, Panamanian" },
    { id: "es-PA-MargaritaNeural",    name: "Margarita",    lang: "es", gender: "female", accent: "Panama",     desc: "Clear, Panamanian" }
];

// GET: Return the catalog of available voices
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const lang = searchParams.get("lang") || "en";

    const filtered = lang === "all"
        ? EDGE_VOICES
        : EDGE_VOICES.filter(v => v.lang === lang);

    const voices = filtered.map(v => ({
        id: v.id,
        name: v.name,
        gender: v.gender,
        accent: v.accent,
        age: "adult",
        descriptive: v.desc,
        use_case: "general",
        category: "premade",
        description: v.desc,
        preview_url: `/voices/previews/${v.id}.webm`,
        is_multilingual: true,
    }));

    return NextResponse.json({ voices, language: lang });
}

// POST: Generate speech with Edge TTS — always saves to file (most reliable)
export async function POST(request: Request) {
    const { text, voice = "en-US-AndrewNeural", rate = 1.0 } = await request.json();

    if (!text) {
        return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const voiceId = EDGE_VOICES.find(v => v.id === voice) ? voice : "es-SV-RodrigoNeural";
    
    // Map 1.0 to '+0%', 1.2 to '+20%', 0.8 to '-20%'
    const rateOffset = `${Math.round((rate - 1.0) * 100)}%`;
    const finalRate = rateOffset.startsWith('-') ? rateOffset : `+${rateOffset}`;

    let finalDuration = 0;
    let wordTimestamps: { word: string; start: number; end: number }[] = [];
    let finalFilePath = "";
    let rawMp3Path = "";
    let metadataFilePath = "";
    let tempBase = "";

    try {
        const voicesDir = path.join(os.tmpdir(), "ha_voices_temp");
        if (!fs.existsSync(voicesDir)) {
            fs.mkdirSync(voicesDir, { recursive: true });
        }
        
        // msedge-tts toFile() writes `audio.mp3` inside the provided directory when using MP3 format
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 10000);
        tempBase = path.join(voicesDir, `voice_temp_${timestamp}_${random}`);
        fs.mkdirSync(tempBase, { recursive: true });

        rawMp3Path = path.join(tempBase, "audio.mp3");
        const finalFileName = `voice_${timestamp}_${random}.mp3`;
        finalFilePath = path.join(voicesDir, finalFileName);

        console.log(`[EdgeTTS] Generating voice with ${voiceId}, text length: ${text.length} chars`);

        const tts = new MsEdgeTTS();
        // MP3 format: natively seekable, no FFmpeg required, works identically in local + production
        await tts.setMetadata(voiceId, OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3, {
            wordBoundaryEnabled: true,
            rate: finalRate
        } as any);
        
        // Generating audio
        const textToSpeak = escapeXml(text);
        const result = await tts.toFile(tempBase, textToSpeak);
        metadataFilePath = result?.metadataFilePath || "";
        
        if (!fs.existsSync(rawMp3Path)) {
            throw new Error("Edge TTS did not generate the internal MP3 file.");
        }

        // --- DURATION AND METADATA PROCESSING ---
        let logicalDuration = 0;
        
        try {
            if (metadataFilePath && fs.existsSync(metadataFilePath)) {
                const rawMeta = fs.readFileSync(metadataFilePath, "utf-8");
                const metaJson = JSON.parse(rawMeta);
                
                if (metaJson && metaJson.Metadata) {
                    metaJson.Metadata.forEach((m: any) => {
                        if (m.Type === "WordBoundary" && m.Data) {
                            const startSec = m.Data.Offset / 10000000;
                            const durSec = m.Data.Duration / 10000000;
                            
                            wordTimestamps.push({
                                word: m.Data.text?.Text || '',
                                start: startSec,
                                end: startSec + durSec
                            });
                        }
                    });
                }
            }
            if (wordTimestamps.length > 0) {
                logicalDuration = wordTimestamps[wordTimestamps.length - 1].end;
            }
        } catch (metaErr: any) {
            console.warn(`[EdgeTTS] Metadata processing error:`, metaErr.message);
        }

        // --- DURATION & FILE ---
        // MP3 files are natively seekable (no FFmpeg needed). Copy directly.
        fs.copyFileSync(rawMp3Path, finalFilePath);
        
        // Use word boundary metadata for duration + 0.1s buffer for trailing audio
        finalDuration = logicalDuration > 0 ? logicalDuration + 0.1 : 0;
        
        if (finalDuration === 0) {
           console.warn("[EdgeTTS] Metadata duration unavailable. Estimating from file size.");
           const fallbackStats = fs.statSync(finalFilePath);
           // MP3 at 96kbps: ~12KB per second
           finalDuration = Math.max((fallbackStats.size / 12000), 1.0);
        }
        
        console.log(`[EdgeTTS] MP3 generated, duration: ${finalDuration.toFixed(3)}s`);

        // Cleanup temp files
        if (fs.existsSync(rawMp3Path)) fs.unlinkSync(rawMp3Path);
        if (metadataFilePath && fs.existsSync(metadataFilePath)) {
            fs.unlinkSync(metadataFilePath);
        }
        if (fs.existsSync(tempBase)) fs.rmdirSync(tempBase);

        const stats = fs.statSync(finalFilePath);
        if (stats.size < 100) {
            throw new Error(`Generated audio file is too small (${stats.size} bytes). API blocked.`);
        }

        // Upload to Supabase Storage
        const supabase = createAdminClient();
        const buffer = fs.readFileSync(finalFilePath);
        const storagePath = `temp_audio/${finalFileName}`;
        
        const { error: uploadError } = await supabase.storage
            .from("images")
            .upload(storagePath, buffer, {
                contentType: "audio/mpeg",
                upsert: true,
            });
            
        if (uploadError) {
            throw new Error(`Supabase upload failed: ${uploadError.message}`);
        }

        const { data: urlData } = supabase.storage
            .from("images")
            .getPublicUrl(storagePath);

        const url = urlData.publicUrl;
        
        // Cleanup the final file from /tmp now that it's in Supabase
        if (fs.existsSync(finalFilePath)) fs.unlinkSync(finalFilePath);

        return NextResponse.json({ 
            url, 
            duration: finalDuration,
            wordTimestamps: wordTimestamps
        });

    } catch (err: any) {
        console.error(`[EdgeTTS] Fatal Error:`, err.message);

        // Cleanup any remaining temp files in case of an error
        if (rawMp3Path && fs.existsSync(rawMp3Path)) fs.unlinkSync(rawMp3Path);
        if (metadataFilePath && fs.existsSync(metadataFilePath)) {
            fs.unlinkSync(metadataFilePath);
        }
        if (typeof tempBase !== 'undefined' && fs.existsSync(tempBase)) {
            fs.rmdirSync(tempBase, { recursive: true });
        }
        // If finalFilePath was created but an error occurred before returning, try to clean it up
        if (finalFilePath && fs.existsSync(finalFilePath)) {
            fs.unlinkSync(finalFilePath);
        }

        // Provide helpful error message
        const is403 = err.message?.includes("403") || err.message?.includes("Forbidden");
        const details = is403
            ? `Microsoft Edge TTS API returned 403 Forbidden for voice "${voiceId}". Try a different voice.`
            : `Voice "${voiceId}" failed: ${err.message}`;

        return NextResponse.json({ error: details, details }, { status: 500 });
    }
}
