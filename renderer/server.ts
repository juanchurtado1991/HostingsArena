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

// Path for outputs
const OUTPUT_DIR = os.tmpdir();

// Serve static files from the output directory
app.use('/outputs', express.static(OUTPUT_DIR));

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
});

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
            inputProps,
            chromiumOptions: {
                disableWebSecurity: true,
                gl: 'angle',
            },
            onProgress: ({ progress }) => {
                sendEvent({ status: 'rendering', rawProgress: progress, message: 'Rendering frames...' });
            },
        });

        // 3. Complete - Absolute Download URL
        const publicBase = process.env.PUBLIC_URL || `${req.protocol}://${req.get('host')}`;
        sendEvent({ 
            status: 'complete', 
            videoUrl: `${publicBase}/outputs/${outputFilename}`,
            message: 'Render complete! Video is ready for download.' 
        });

    } catch (error: any) {
        console.error('Render error:', error);
        sendEvent({ error: true, details: error.message });
    } finally {
        // [DELAYED CLEANUP] Remove temporary files after 10 minutes
        // This gives the user time to download via the local static route
        setTimeout(() => {
            try {
                if (fs.existsSync(outputLocation)) {
                    fs.unlinkSync(outputLocation);
                    console.log(`[Cleanup] Deleted rendered file: ${outputLocation}`);
                }
            } catch (e) {
                console.error('[Cleanup Error] Failed to remove file:', e);
            }
        }, 10 * 60 * 1000); 

        res.end();
    }
});

app.listen(port, () => {
    console.log(`🚀 Renderer listening on port ${port}`);
});
