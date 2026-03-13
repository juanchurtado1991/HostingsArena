import express from 'express';
import { renderMedia, getCompositions } from '@remotion/renderer';
import { createClient } from '@supabase/supabase-js';
import path from 'path';
import fs from 'fs';
import os from 'os';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json({ limit: '50mb' }));

const port = process.env.PORT || 3001;

app.post('/render', async (req, res) => {
    const { 
        bundleUrl, 
        compositionId, 
        inputProps, 
        outputFilename = `render-${Date.now()}.mp4`,
        durationInFrames,
        width,
        height,
        crf = 23
    } = req.body;

    if (!bundleUrl || !compositionId || !inputProps) {
        return res.status(400).json({ error: 'Missing required parameters: bundleUrl, compositionId, inputProps' });
    }

    // Set headers for SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const sendEvent = (data: any) => {
        res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    const outputLocation = path.join(os.tmpdir(), outputFilename);

    try {
        // 1. Extract compositions - Use bundleUrl DIRECTLY as serveUrl
        // Remotion handles remote URLs perfectly, avoiding filesystem issues on the host.
        sendEvent({ status: 'initializing', message: 'Extracting compositions from remote bundle...' });
        const comps = await getCompositions(bundleUrl, { inputProps });
        const composition = comps.find(c => c.id === compositionId);
        
        if (!composition) {
            throw new Error(`Composition ${compositionId} not found in bundle`);
        }

        // 2. Render
        sendEvent({ status: 'rendering', rawProgress: 0, message: 'Starting render...' });
        
        await renderMedia({
            composition: {
                ...composition,
                durationInFrames: durationInFrames || composition.durationInFrames,
                width: width || composition.width,
                height: height || composition.height,
            },
            serveUrl: bundleUrl,
            outputLocation,
            codec: 'h264',
            crf,
            onProgress: ({ progress }) => {
                sendEvent({ status: 'rendering', rawProgress: progress, message: 'Rendering frames...' });
            },
        });

        // 4. Upload to Supabase
        sendEvent({ status: 'uploading', message: 'Uploading to Supabase...' });
        
        const supabase = createClient(
            process.env.SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        const buffer = fs.readFileSync(outputLocation);
        const storagePath = `renders/${outputFilename}`;
        
        const { error: uploadError } = await supabase.storage
            .from('images')
            .upload(storagePath, buffer, {
                contentType: 'video/mp4',
                upsert: true,
            });

        if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

        const { data: urlData } = supabase.storage
            .from('images')
            .getPublicUrl(storagePath);

        sendEvent({ 
            status: 'complete', 
            videoUrl: urlData.publicUrl,
            message: 'Render complete!' 
        });

    } catch (error: any) {
        console.error('Render error:', error);
        sendEvent({ error: true, details: error.message });
    } finally {
        // [CLEANUP] Remove temporary files to prevent disk filling
        try {
            if (fs.existsSync(outputLocation)) {
                fs.unlinkSync(outputLocation);
                console.log(`[Cleanup] Deleted temporary output: ${outputLocation}`);
            }
        } catch (e) {
            console.error('[Cleanup Error] Failed to remove temporary files:', e);
        }
        res.end();
    }
});

app.listen(port, () => {
    console.log(`🚀 Renderer listening on port ${port}`);
});
