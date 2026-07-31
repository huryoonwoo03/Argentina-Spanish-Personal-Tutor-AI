import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  // eslint-disable-next-line no-console
  console.warn(
    "VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are not set — auth and data features will not work until they are.",
  );
}

// createClient throws synchronously on an invalid URL, which would crash
// the whole app at import time before any UI can render. Fall back to a
// placeholder so the app loads; actual auth calls will simply fail (and
// are already handled as errors in the sign-in/sign-up forms) until real
// credentials are set.
export const supabase = createClient(url || "https://placeholder.supabase.co", anonKey || "placeholder-anon-key");
