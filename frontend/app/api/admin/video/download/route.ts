import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get("url");
    const filename = searchParams.get("filename") || "video.mp4";

    if (!url) {
        return NextResponse.json({ error: "Missing URL parameter" }, { status: 400 });
    }

    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Failed to fetch video: ${response.statusText}`);
        }

        const blob = await response.blob();
        
        return new Response(blob, {
            headers: {
                "Content-Type": response.headers.get("Content-Type") || "video/mp4",
                "Content-Disposition": `attachment; filename="${filename}"`,
                "Cache-Control": "no-cache",
            },
        });
    } catch (error: any) {
        console.error("[DownloadProxy] Error:", error);
        return NextResponse.json({ 
            error: "Failed to download video", 
            details: error.message 
        }, { status: 500 });
    }
}
