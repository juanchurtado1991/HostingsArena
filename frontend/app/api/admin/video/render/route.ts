import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/tasks/supabaseAdmin";

export const dynamic = "force-dynamic";
export const maxDuration = 300; 

/**
 * Video Render API
 * 
 * ALIGNMENT POLICY: 
 * This API now EXCLUSIVELY proxies to the Remote Rendering Service (Home Lab).
 * Local FFmpeg rendering has been deprecated to ensure environment parity.
 */
export async function POST(request: Request) {
    const body = await request.json();
    const { 
        title, scenes, layers, format,
        bgMusicUrl, bgMusicVolume, transitionSfxUrl, outroSfxUrl,
        exportSettings,
        durationInFrames = 1800
    } = body;

    // 1. Mandatory Remote Proxy Check
    if (!process.env.HOME_LAB_RENDER_URL) {
        console.error("[VideoRender] ERROR: HOME_LAB_RENDER_URL is not configured.");
        return NextResponse.json({ 
            error: "Rendering Service Not Configured", 
            details: "Please set HOME_LAB_RENDER_URL in your .env.local to enable video generation."
        }, { status: 501 });
    }

    console.log(`[VideoRender] PROXYING to remote renderer: ${process.env.HOME_LAB_RENDER_URL}`);
    
    // Determine bundle URL (must be public or reachable by the home lab)
    const protocol = request.headers.get("x-forwarded-proto") || "https";
    const host = request.headers.get("host") || "localhost:3000";
    
    let bundleUrl = "";
    
    // Override logic for local development reachability
    if (process.env.VIDEO_BUNDLE_URL_OVERRIDE) {
        bundleUrl = process.env.VIDEO_BUNDLE_URL_OVERRIDE;
    } else if (host.includes("localhost")) {
        const publicHost = process.env.NEXT_PUBLIC_SITE_URL || "https://hostingsarena.com";
        bundleUrl = `${publicHost.replace(/\/$/, '')}/video-bundle`;
        console.log(`[VideoRender] Localhost detected. Forcing public bundle URL: ${bundleUrl}`);
    } else {
        bundleUrl = `${protocol}://${host}/video-bundle`;
    }

    try {
        const remoteResponse = await fetch(`${process.env.HOME_LAB_RENDER_URL}/render`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                bundleUrl,
                compositionId: format === "9:16" ? "HostingShort" : "HostingLandscape",
                inputProps: {
                    title, scenes, layers, format,
                    bgMusicUrl, bgMusicVolume, 
                    transitionSfxUrl, outroSfxUrl,
                    baseUrl: bundleUrl.includes('/video-bundle') 
                        ? bundleUrl.split('/video-bundle')[0] 
                        : bundleUrl.replace(/\/$/, '')
                },
                durationInFrames,
                width: format === "9:16" ? 1080 : 1920,
                height: format === "9:16" ? 1920 : 1080,
                crf: exportSettings?.quality === 'max' ? 18 : (exportSettings?.quality === 'draft' ? 28 : 23)
            })
        });

        if (!remoteResponse.ok) {
            const errorText = await remoteResponse.text();
            throw new Error(`Remote renderer failed: ${errorText}`);
        }

        // Pipe the SSE response back to our client for real-time progress
        return new Response(remoteResponse.body, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache, no-transform',
                'Connection': 'keep-alive',
                'Content-Encoding': 'none',
                'X-Accel-Buffering': 'no',
            },
        });
    } catch (remoteError: any) {
        console.error("[VideoRender] Remote Proxy Error:", remoteError);
        return NextResponse.json({ 
            error: "Remote render proxy failed", 
            details: remoteError.message 
        }, { status: 502 });
    }
}
