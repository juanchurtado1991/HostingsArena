import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { logger } from '@/lib/logger';

const SCOPES = ['https://www.googleapis.com/auth/indexing'];

export async function GET() {
    try {
        let clientEmail = process.env.GOOGLE_SA_CLIENT_EMAIL;
        let privateKey = process.env.GOOGLE_SA_PRIVATE_KEY;

        if (clientEmail) clientEmail = clientEmail.replace(/^"|"$/g, '');
        if (privateKey) {
            privateKey = privateKey.replace(/^"|"$/g, '');
            privateKey = privateKey.replace(/\\n/g, '\n');
        }

        if (!clientEmail || !privateKey) {
            return NextResponse.json({ 
                status: 'disconnected', 
                message: 'Missing credentials' 
            });
        }

        const jwtClient = new google.auth.JWT({
            email: clientEmail,
            key: privateKey,
            scopes: SCOPES
        });

        await jwtClient.authorize();

        return NextResponse.json({ 
            status: 'connected', 
            email: clientEmail.substring(0, 10) + '...'
        });

    } catch (e: any) {
        logger.error('Indexing Status Check Failed', e);
        return NextResponse.json({ 
            status: 'error', 
            message: e.message 
        });
    }
}
