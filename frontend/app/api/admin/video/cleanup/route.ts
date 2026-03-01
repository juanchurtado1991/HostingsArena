import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

/**
 * API Endpoint to clean up generated assets.
 * Deletes all files in public/renders and public/temp.
 * Also cleans up public/uploads/ of files older than 24 hours.
 */
export async function POST() {
    try {
        const publicDir = path.join(process.cwd(), "public");
        const foldersToClear = ["renders", "temp"];
        const stats = {
            deletedFiles: 0,
            deletedFolders: 0,
            errors: [] as string[]
        };

        for (const folder of foldersToClear) {
            const targetPath = path.join(publicDir, folder);
            
            if (!fs.existsSync(targetPath)) continue;

            const items = fs.readdirSync(targetPath);
            
            for (const item of items) {
                const itemPath = path.join(targetPath, item);
                try {
                    const itemStats = fs.statSync(itemPath);
                    if (itemStats.isDirectory()) {
                        fs.rmSync(itemPath, { recursive: true, force: true });
                        stats.deletedFolders++;
                    } else {
                        fs.unlinkSync(itemPath);
                        stats.deletedFiles++;
                    }
                } catch (err: any) {
                    stats.errors.push(`Failed to delete ${item}: ${err.message}`);
                }
            }
        }

        // Optional: Clean up uploads older than 24 hours
        const uploadsPath = path.join(publicDir, "uploads");
        if (fs.existsSync(uploadsPath)) {
            const now = Date.now();
            const oneDay = 24 * 60 * 60 * 1000;
            const uploadItems = fs.readdirSync(uploadsPath);
            
            for (const item of uploadItems) {
                const itemPath = path.join(uploadsPath, item);
                try {
                    const itemStats = fs.statSync(itemPath);
                    if (now - itemStats.mtimeMs > oneDay) {
                        if (itemStats.isDirectory()) {
                            fs.rmSync(itemPath, { recursive: true, force: true });
                        } else {
                            fs.unlinkSync(itemPath);
                        }
                        stats.deletedFiles++;
                    }
                } catch (err) {
                    // Ignore individual upload deletion errors
                }
            }
        }

        return NextResponse.json({
            success: true,
            message: "Cleanup completed",
            stats
        });
    } catch (error: any) {
        console.error("[Cleanup API] Error:", error);
        return NextResponse.json(
            { error: "Cleanup failed", details: error.message },
            { status: 500 }
        );
    }
}
