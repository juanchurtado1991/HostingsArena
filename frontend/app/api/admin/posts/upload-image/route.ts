import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/tasks/supabaseAdmin";

/**
 * POST /api/admin/posts/upload-image
 * Uploads an image to Supabase Storage for a post cover image.
 * Accepts multipart/form-data with a "file" field.
 * Returns the public URL of the uploaded image.
 */
export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json(
                { error: "Invalid file type. Allowed: JPEG, PNG, WebP, GIF, SVG" },
                { status: 400 }
            );
        }

        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            return NextResponse.json(
                { error: "File too large. Maximum size: 5MB" },
                { status: 400 }
            );
        }

        const supabase = createAdminClient();

        const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
        const filename = `posts/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const { data, error: uploadError } = await supabase.storage
            .from("images")
            .upload(filename, buffer, {
                contentType: file.type,
                upsert: false,
            });

        if (uploadError) {
            console.error("Upload error:", uploadError);
            return NextResponse.json(
                { error: `Upload failed: ${uploadError.message}` },
                { status: 500 }
            );
        }

        const { data: urlData } = supabase.storage
            .from("images")
            .getPublicUrl(data.path);

        return NextResponse.json({
            url: urlData.publicUrl,
            path: data.path,
            filename: file.name,
            size: file.size,
        });
    } catch (error) {
        console.error("Image upload error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
