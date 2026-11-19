import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Every page reads the Supabase session cookie, so pages render per request and
// no incremental cache (R2/KV) is needed. Add one here if you add ISR or `use cache`.
export default defineCloudflareConfig();
