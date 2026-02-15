import { createBrowserClient } from '@supabase/ssr'
import { logger } from "@/lib/logger";

let client: ReturnType<typeof createBrowserClient> | undefined;

export function createClient() {
    if (client) return client;

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
        logger.error("[Supabase] Missing env vars!", { url, key });
    }

    client = createBrowserClient(url!, key!);
    return client;
}
