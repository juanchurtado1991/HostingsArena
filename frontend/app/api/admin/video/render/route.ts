import { NextResponse } from "next/server";
import { getCompositions, renderMedia } from "@remotion/renderer";
import path from "path";
import fs from "fs";
import os from "os";
import { createAdminClient } from "@/lib/tasks/supabaseAdmin";

export const dynamic = "force-dynamic";
export async function POST(request: Request) {
    const body = await request.json();
    const { 
        title, script, scenes, layers, format,
        bgMusicUrl, bgMusicVolume, transitionSfxUrl, outroSfxUrl,
        exportSettings,
        durationInFrames = 1800
    } = body;

    if (!title || !script) {
        return NextResponse.json({ error: "Title and script are required" }, { status: 400 });
    }

    try {
        console.log(`[VideoRender] Starting production render for: ${title}`);
        
        const entryPoint = path.join(process.cwd(), "components/video/entry.ts");
        const timestamp = Date.now();
        const outputFilename = `news-${timestamp}.mp4`;
        const outputLocation = path.join(os.tmpdir(), outputFilename);

        // Helper to resolve local paths - REVERTED to relative paths for Chromium security
        const resolveRelativePath = (url?: string) => {
            if (!url) return "";
            if (url.startsWith("http")) return url;
            // Ensure path starts with / for staticFile resolution
            if (url.startsWith("/")) return url;
            return "/" + url;
        };

        const relBgMusicUrl = resolveRelativePath(bgMusicUrl);
        const relTransitionSfxUrl = resolveRelativePath(transitionSfxUrl);
        const relOutroSfxUrl = resolveRelativePath(outroSfxUrl);

        // Sanitize scene voice URLs
        const sanitizedScenes = (scenes || []).map((scene: any) => ({
            ...scene,
            voiceUrl: resolveRelativePath(scene.voiceUrl)
        }));

        const compositionId = format === "9:16" ? "HostingShort" : "HostingLandscape";
        
        console.log(`[VideoRender] Using pre-built bundle from public/video-bundle/bundle.js`);
        const bundleLocation = path.join(process.cwd(), "public", "video-bundle", "bundle.js");
        
        if (!fs.existsSync(bundleLocation)) {
            throw new Error("Video bundle not found. Ensure 'npm run build' or 'node scripts/bundle-video.js' has been run.");
        }

        console.log(`[VideoRender] Using relative assets for secure browser rendering: 
          Music: ${relBgMusicUrl}
          SFX: ${relTransitionSfxUrl}
          Outro: ${relOutroSfxUrl}`);

        // Determine base URL for proxy
        const protocol = request.headers.get("x-forwarded-proto") || "http";
        const host = request.headers.get("host") || "localhost:3000";
        const baseUrl = `${protocol}://${host}`;

        const comps = await getCompositions(bundleLocation, {
            inputProps: {
                title: title || "Tech News Summary",
                scenes: sanitizedScenes,
                layers,
                format: format || "9:16",
                bgMusicUrl: relBgMusicUrl,
                bgMusicVolume,
                transitionSfxUrl: relTransitionSfxUrl,
                outroSfxUrl: relOutroSfxUrl,
                baseUrl,
            },
        });

        const composition = comps.find((c) => c.id === compositionId);
        if (!composition) {
            throw new Error(`Composition ${compositionId} not found`);
        }

        console.log(`[VideoRender] Rendering ${compositionId} with duration ${durationInFrames}...`);

        // Apply Phase 6 Export Settings
        let crf = 23; // Default Balanced
        if (exportSettings?.quality === 'draft') crf = 28;
        if (exportSettings?.quality === 'max') crf = 18;

        let scaleMultiplier = 1; // 1080p equivalent base
        if (exportSettings?.resolution === '720p') scaleMultiplier = 0.66;
        if (exportSettings?.resolution === '4k') scaleMultiplier = 2.0;

        const { readable, writable } = new TransformStream();
        const writer = writable.getWriter();
        const encoder = new TextEncoder();

        // Start render async without blocking the stream return
        (async () => {
            try {
                const sendEvent = async (data: any) => {
                    await writer.write(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
                };

                let lastProgressTime = Date.now();
                await sendEvent({ status: "initializing", rawProgress: 0, steps: ["Initializing Video News Engine"] });

                await renderMedia({
                    composition: {
                        ...composition,
                        durationInFrames: durationInFrames,
                        width: Math.round(composition.width * scaleMultiplier),
                        height: Math.round(composition.height * scaleMultiplier)
                    },
                    serveUrl: bundleLocation,
                    outputLocation,
                    codec: "h264",
                    crf,
                    pixelFormat: "yuv420p",
                    timeoutInMilliseconds: 300000, // 5 mins failsafe for Vercel
                    concurrency: 1, // Vercel strict limits: 1 CPU core, avoid multi-threading RAM spikes
                    chromiumOptions: {
                        disableWebSecurity: true, // Crucial for direct Pexels/Jamendo fetching
                        gl: "angle", // better compatibility with headless linux
                    },
                    inputProps: {
                        title: title || "Tech News Summary",
                        scenes: sanitizedScenes,
                        layers,
                        format: format || "9:16",
                        bgMusicUrl: relBgMusicUrl,
                        bgMusicVolume,
                        transitionSfxUrl: relTransitionSfxUrl,
                        outroSfxUrl: relOutroSfxUrl,
                        durationInFrames,
                        baseUrl,
                    },
                    onProgress: ({ progress }) => {
                        const now = Date.now();
                        // 500ms max update frequency
                        if (now - lastProgressTime > 500) {
                            lastProgressTime = now;
                            console.log(`[SSE Server] ${new Date().toISOString()} - Emitting progress: ${progress}`);
                            sendEvent({ 
                                status: "rendering", 
                                rawProgress: progress,
                                steps: ["Compositing News Scenes", "Encoding Final Stream"] 
                            }).catch(() => {});
                        }
                    },
                });

                console.log(`[VideoRender] Render complete: ${outputLocation}. Uploading to Supabase...`);
                await sendEvent({ status: "rendering", rawProgress: 1, steps: ["Uploading Final Video to Cloud Storage"] });

                const supabase = createAdminClient();
                const buffer = fs.readFileSync(outputLocation);
                const storagePath = `renders/${outputFilename}`;
                
                const { error: uploadError } = await supabase.storage
                    .from("images")
                    .upload(storagePath, buffer, {
                        contentType: "video/mp4",
                        upsert: true,
                    });

                if (uploadError) {
                    throw new Error(`Upload failed: ${uploadError.message}`);
                }

                const { data: urlData } = supabase.storage
                    .from("images")
                    .getPublicUrl(storagePath);

                const cloudUrl = urlData.publicUrl;
                
                // Cleanup temp file
                if (fs.existsSync(outputLocation)) fs.unlinkSync(outputLocation);
                
                await sendEvent({ 
                    status: "complete", 
                    videoUrl: cloudUrl,
                    jobId: `vid_${Math.random().toString(36).substring(7)}`,
                    steps: ["Finished: Ready to share!"] 
                });
                
                await writer.close();
            } catch (error: any) {
                console.error("Video Render Streaming Error Details:", error);
                const errorMsg = error.stack || error.message || String(error);
                await writer.write(encoder.encode(`data: ${JSON.stringify({ error: true, details: errorMsg })}\n\n`));
                await writer.close();
            }
        })();

        return new Response(readable, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache, no-transform',
                'Connection': 'keep-alive',
                'Content-Encoding': 'none',
                'X-Accel-Buffering': 'no',
            },
        });

    } catch (error: any) {
        console.error("Video Render API Init Error:", error);
        return NextResponse.json({ 
            error: "Failed to initialize render stream", 
            details: error.stack || error.message || String(error)
        }, { status: 500 });
    }
}
