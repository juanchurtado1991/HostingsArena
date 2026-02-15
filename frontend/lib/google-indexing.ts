
import { google } from 'googleapis';
import { logger } from './logger';

const SCOPES = ['https://www.googleapis.com/auth/indexing'];

export async function requestIndexing(url: string) {
    const clientEmail = process.env.GOOGLE_SA_CLIENT_EMAIL;
    let privateKey = process.env.GOOGLE_SA_PRIVATE_KEY;

    if (privateKey) {
        // Remove surrounding quotes if they exist
        privateKey = privateKey.replace(/^"|"$/g, '');
        // Handle escaped newlines
        privateKey = privateKey.replace(/\\n/g, '\n');
    }

    if (!clientEmail || !privateKey) {
        logger.warn('Google Indexing skipped: Missing service account credentials');
        return null;
    }

    try {
        const jwtClient = new google.auth.JWT({
            email: clientEmail,
            key: privateKey,
            scopes: SCOPES
        });

        await jwtClient.authorize();

        const indexing = google.indexing({
            version: 'v3',
            auth: jwtClient
        });

        const res = await indexing.urlNotifications.publish({
            requestBody: {
                url: url,
                type: 'URL_UPDATED'
            }
        });

        logger.log('SYSTEM', `Google Indexing successful for ${url}`, {
            status: res.status,
            data: res.data
        });

        return res.data;

    } catch (error: any) {
        logger.error('Google Indexing failed', error);
        throw new Error(error.message);
    }
}
