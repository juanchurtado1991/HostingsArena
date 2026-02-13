
import dotenv from 'dotenv';
import path from 'path';
import { requestIndexing } from '../lib/google-indexing';

// Load .env.local manually since we are running a standalone script
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function verify() {
    console.log('🔍 Verifying Google Indexing Credentials...');

    const email = process.env.GOOGLE_SA_CLIENT_EMAIL;
    const key = process.env.GOOGLE_SA_PRIVATE_KEY;

    if (!email) {
        console.error('❌ Missing GOOGLE_SA_CLIENT_EMAIL in .env.local');
        return;
    }
    if (!key) {
        console.error('❌ Missing GOOGLE_SA_PRIVATE_KEY in .env.local');
        return;
    }

    const hasRealNewlines = key.includes('\n');
    const hasLiteralNewlines = key.includes('\\n');
    console.log(`🔑 Key format check: Real Newlines=${hasRealNewlines}, Literal Newlines=${hasLiteralNewlines}`);

    // Create the final key exactly as the helper does
    const finalKey = key.replace(/\\n/g, '\n');
    console.log(`🔑 Configured Key Lines: ${finalKey.split('\n').length} (Should be > 1)`);

    console.log(`✅ Credentials found for: ${email}`);
    console.log('🚀 Attempting to index: https://www.hostingsarena.com (Test)');

    try {
        const result = await requestIndexing('https://www.hostingsarena.com');
        console.log('\n✅ SUCCESS! Google API responded:');
        console.log(JSON.stringify(result, null, 2));
    } catch (error: any) {
        console.error('\n❌ FAILED. Error details:');
        console.error(error.message);

        if (error.message.includes('403') || error.message.includes('Permission denied')) {
            console.log('\n👉 TIP: Ensure the service account email is added as an OWNER in Google Search Console.');
        }
    }
}

verify();
