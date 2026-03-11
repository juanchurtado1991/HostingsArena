/**
 * generate-previews.js — One-time script to generate voice preview clips.
 * 
 * Generates a short preview .webm for each voice in the EDGE_VOICES catalog.
 * Saves to public/voices/previews/{voiceId}.webm
 * 
 * Usage: node scripts/generate-previews.js
 * 
 * Idempotent: skips voices that already have a preview file.
 * Requires: msedge-tts (npm), ffmpeg (system)
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Dynamic import for ESM module
async function main() {
    const { MsEdgeTTS, OUTPUT_FORMAT } = await import('msedge-tts');

    const PREVIEW_DIR = path.join(__dirname, '..', 'public', 'voices', 'previews');
    fs.mkdirSync(PREVIEW_DIR, { recursive: true });

    const SAMPLE_TEXT = {
        en: 'Hello, I am one of the available voices for your video. Here is a quick preview of how I sound.',
        es: 'Hola, soy una de las voces disponibles para tu video. Aquí tienes un adelanto de cómo sueno.',
    };

    // Full voice catalog (same as voice/route.ts)
    const EDGE_VOICES = [
        // English (22 voices)
        { id: "en-US-AndrewNeural", lang: "en" },
        { id: "en-US-BrianNeural", lang: "en" },
        { id: "en-US-ChristopherNeural", lang: "en" },
        { id: "en-US-AvaNeural", lang: "en" },
        { id: "en-US-EmmaNeural", lang: "en" },
        { id: "en-US-JennyNeural", lang: "en" },
        { id: "en-US-AriaNeural", lang: "en" },
        { id: "en-US-GuyNeural", lang: "en" },
        { id: "en-US-SaraNeural", lang: "en" },
        { id: "en-US-SteffanNeural", lang: "en" },
        { id: "en-US-MichelleNeural", lang: "en" },
        { id: "en-US-NathanNeural", lang: "en" },
        { id: "en-GB-RyanNeural", lang: "en" },
        { id: "en-GB-SoniaNeural", lang: "en" },
        { id: "en-GB-LibbyNeural", lang: "en" },
        { id: "en-GB-ThomasNeural", lang: "en" },
        { id: "en-AU-WilliamNeural", lang: "en" },
        { id: "en-AU-NatashaNeural", lang: "en" },
        { id: "en-CA-LiamNeural", lang: "en" },
        { id: "en-CA-ClaraNeural", lang: "en" },
        { id: "en-IE-ConnorNeural", lang: "en" },
        { id: "en-IN-PrabhatNeural", lang: "en" },
        // Spanish (46 voices)
        { id: "es-MX-JorgeNeural", lang: "es" },
        { id: "es-MX-DaliaNeural", lang: "es" },
        { id: "es-MX-BeatrizNeural", lang: "es" },
        { id: "es-MX-CecilioNeural", lang: "es" },
        { id: "es-MX-LarissaNeural", lang: "es" },
        { id: "es-MX-PelayoNeural", lang: "es" },
        { id: "es-ES-AlvaroNeural", lang: "es" },
        { id: "es-ES-ElviraNeural", lang: "es" },
        { id: "es-ES-AbrilNeural", lang: "es" },
        { id: "es-ES-ArnauNeural", lang: "es" },
        { id: "es-ES-EstrellaNeural", lang: "es" },
        { id: "es-CO-GonzaloNeural", lang: "es" },
        { id: "es-CO-SalomeNeural", lang: "es" },
        { id: "es-AR-TomasNeural", lang: "es" },
        { id: "es-AR-ElenaNeural", lang: "es" },
        { id: "es-CL-LorenzoNeural", lang: "es" },
        { id: "es-CL-CatalinaNeural", lang: "es" },
        { id: "es-US-AlonsoNeural", lang: "es" },
        { id: "es-PE-AlexNeural", lang: "es" },
        { id: "es-VE-SebastianNeural", lang: "es" },
        { id: "es-CU-BelkysNeural", lang: "es" },
        { id: "es-DO-EmilioNeural", lang: "es" },
        { id: "es-GT-AndresNeural", lang: "es" },
        { id: "es-GT-MartaNeural", lang: "es" },
        { id: "es-SV-RodrigoNeural", lang: "es" },
        { id: "es-SV-LorenaNeural", lang: "es" },
        { id: "es-EC-LuisNeural", lang: "es" },
        { id: "es-EC-AndreaNeural", lang: "es" },
        { id: "es-BO-MarceloNeural", lang: "es" },
        { id: "es-BO-SofiaNeural", lang: "es" },
        { id: "es-PY-MarioNeural", lang: "es" },
        { id: "es-PY-TaniaNeural", lang: "es" },
        { id: "es-UY-MateoNeural", lang: "es" },
        { id: "es-UY-BelenNeural", lang: "es" },
        { id: "es-PR-JulioNeural", lang: "es" },
        { id: "es-PR-KarinaNeural", lang: "es" },
        { id: "es-HN-CarlosNeural", lang: "es" },
        { id: "es-HN-KarlaNeural", lang: "es" },
        { id: "es-NI-FedericoNeural", lang: "es" },
        { id: "es-NI-YolandaNeural", lang: "es" },
        { id: "es-CR-JuanNeural", lang: "es" },
        { id: "es-CR-MariaNeural", lang: "es" },
        { id: "es-PA-RobertoNeural", lang: "es" },
        { id: "es-PA-MargaritaNeural", lang: "es" },
    ];

    const escapeXml = (unsafe) => {
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

    let generated = 0;
    let skipped = 0;
    let failed = 0;

    for (const voice of EDGE_VOICES) {
        const outputFile = path.join(PREVIEW_DIR, `${voice.id}.webm`);

        // Skip if already exists
        if (fs.existsSync(outputFile)) {
            const stat = fs.statSync(outputFile);
            if (stat.size > 100) {
                skipped++;
                continue;
            }
        }

        const text = SAMPLE_TEXT[voice.lang] || SAMPLE_TEXT.en;
        const tempDir = path.join(PREVIEW_DIR, `_temp_${voice.id}`);

        try {
            fs.mkdirSync(tempDir, { recursive: true });

            const tts = new MsEdgeTTS();
            await tts.setMetadata(voice.id, OUTPUT_FORMAT.WEBM_24KHZ_16BIT_MONO_OPUS);

            const safeText = escapeXml(text);
            await tts.toFile(tempDir, safeText);

            const rawWebm = path.join(tempDir, 'audio.webm');
            if (!fs.existsSync(rawWebm)) {
                throw new Error('Edge TTS did not generate audio.webm');
            }

            // Trim silence + re-encode
            try {
                execSync(`ffmpeg -y -i "${rawWebm}" -af "silenceremove=start_periods=1:start_silence=0:start_threshold=-45dB:stop_periods=-1:stop_duration=0:stop_threshold=-45dB" -c:a libopus -b:a 48k "${outputFile}"`, { stdio: 'ignore' });
            } catch {
                // Fallback: just copy without trimming
                execSync(`ffmpeg -y -i "${rawWebm}" -c:a libopus -b:a 48k "${outputFile}"`, { stdio: 'ignore' });
            }

            generated++;
            console.log(`✅ [${generated + skipped}/${EDGE_VOICES.length}] ${voice.id}`);

        } catch (err) {
            failed++;
            console.error(`❌ [${voice.id}] ${err.message}`);
        } finally {
            // Cleanup temp dir
            try { fs.rmSync(tempDir, { recursive: true, force: true }); } catch { }
        }

        // Small delay to avoid rate limiting
        await new Promise(r => setTimeout(r, 500));
    }

    console.log(`\n🎙️ Preview generation complete: ${generated} generated, ${skipped} skipped, ${failed} failed.`);
    console.log(`   Total preview files: ${fs.readdirSync(PREVIEW_DIR).filter(f => f.endsWith('.webm')).length}`);
}

main().catch(console.error);
