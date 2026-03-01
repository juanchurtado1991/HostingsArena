import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        
        // Use public/uploads for easy access in frontend and Remotion
        const uploadDir = join(process.cwd(), "public/uploads");
        
        // Ensure directory exists
        await mkdir(uploadDir, { recursive: true });

        // Generate unique filename to avoid collisions
        const fileExtension = file.name.split('.').pop();
        const fileName = `${randomUUID()}.${fileExtension}`;
        const filePath = join(uploadDir, fileName);

        await writeFile(filePath, buffer);

        // Return the relative URL from public root
        const fileUrl = `/uploads/${fileName}`;

        return NextResponse.json({ 
            message: "File uploaded successfully",
            url: fileUrl,
            name: file.name
        });

    } catch (error: any) {
        console.error("Upload API Error:", error);
        return NextResponse.json({ 
            error: "Upload failed", 
            details: error.message 
        }, { status: 500 });
    }
}
