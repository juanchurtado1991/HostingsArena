import { createBrowserClient } from '@supabase/ssr'
import { logger } from "@/lib/logger";

export function createClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
        logger.error("[Supabase] Missing env vars!", { url, key });
    }

    return createBrowserClient(url!, key!)
}
