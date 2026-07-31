import { createClient } from "@supabase/supabase-js";
import { config } from "../config/index.js";

/**
 * Service-role client for server-side operations. RLS is still the
 * authorization boundary for anything user-scoped — this client is used
 * by repositories that explicitly filter by the authenticated user's id,
 * or for public-catalog reads (vocabulary, achievements).
 */
export const supabaseAdmin =
  config.SUPABASE_URL && config.SUPABASE_SERVICE_ROLE_KEY
    ? createClient(config.SUPABASE_URL, config.SUPABASE_SERVICE_ROLE_KEY, {
        auth: { persistSession: false },
      })
    : null;
