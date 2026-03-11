import { NextResponse } from "next/server";
import { bundle } from "@remotion/bundler";
import { getCompositions, renderMedia } from "@remotion/renderer";
import path from "path";
import fs from "fs";

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
        const outputLocation = path.join(process.cwd(), "public", "temp", outputFilename);
        const publicUrl = `/temp/${outputFilename}`;

        // Ensure directory exists
        const tempDir = path.join(process.cwd(), "public", "temp");
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }

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

        console.log("[VideoRender] Bundling composition with publicDir...");
        const bundleLocation = await bundle({
            entryPoint,
            publicDir: path.join(process.cwd(), "public") // Crucial for staticFile resolution
        });

        const compositionId = format === "9:16" ? "HostingShort" : "HostingLandscape";
        
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
                    timeoutInMilliseconds: 60000, // 60s failsafe for slow CDNs
                    chromiumOptions: {
                        disableWebSecurity: true, // Crucial for direct Pexels/Jamendo fetching
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

                console.log(`[VideoRender] Render complete: ${outputLocation}`);
                
                await sendEvent({ 
                    status: "complete", 
                    videoUrl: publicUrl,
                    jobId: `vid_${Math.random().toString(36).substring(7)}`,
                    steps: ["Finished: Final MP4 Encoding"] 
                });
                
                await writer.close();
            } catch (error: any) {
                console.error("Video Render Streaming Error:", error);
                await writer.write(encoder.encode(`data: ${JSON.stringify({ error: true, details: error.message })}\n\n`));
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
            details: error.message 
        }, { status: 500 });
    }
}
