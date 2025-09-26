import { PUBLIC_SUPABASE_PUBLISHABLE_KEY, PUBLIC_SUPABASE_URL } from "$env/static/public"
import type { SupabaseClientOptions } from "@supabase/supabase-js"
import { 
  createBrowserClient as _createBrowserClient,
  type CookieMethodsBrowser,
  type CookieOptionsWithName
} from "@supabase/ssr"

/**
 * Create a Supabase browser client.
 */
export const createBrowserClient = (options?: SupabaseClientOptions<"public"> & {
    cookieEncoding?: "raw" | "base64url";
    cookieOptions?: CookieOptionsWithName; 
    cookies?: CookieMethodsBrowser;
    isSingleton?: boolean;
  }) => {
  return _createBrowserClient(
    PUBLIC_SUPABASE_URL,
    PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    { ...options }
  )
}
