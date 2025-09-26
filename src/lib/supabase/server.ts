import { PUBLIC_SUPABASE_PUBLISHABLE_KEY, PUBLIC_SUPABASE_URL } from "$env/static/public"
import { SUPABASE_SECRET_KEY } from "$env/static/private"
import { getRequestEvent } from "$app/server"
import { createClient, type SupabaseClientOptions } from "@supabase/supabase-js"
import { 
  createServerClient as _createServerClient,
  type CookieMethodsServer,
  type CookieOptionsWithName
} from "@supabase/ssr"

/**
 * Create a Supabase server client. 
 */
export const createServerClient = (options?: SupabaseClientOptions<"public"> & {
    cookieEncoding?: "raw" | "base64url";  
    cookieOptions?: CookieOptionsWithName;
    cookies: CookieMethodsServer;
  }) => {
  const event = getRequestEvent()
  
  return _createServerClient(
    PUBLIC_SUPABASE_URL,
    PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll: () => event.cookies.getAll(),
        setAll: (cookies) => {
          cookies.forEach(({ name, value, options }) => {
            event.cookies.set(name, value, { ...options, path: '/' })
          })
        }
      },
      ...options
    }
  )
}

/**
 * Create a Supabase admin client.
 * 
 * Bypasses RLS.
 */
export const createAdminClient = (options?: SupabaseClientOptions<"public">) => {
  return createClient(PUBLIC_SUPABASE_URL, SUPABASE_SECRET_KEY, { ...options })
}

/**
 * Supabase server client for SvelteKit 
 * query and prerender remote functions.
 * 
 * This client cannot set headers, which includes cookies, per SvelteKit.
 */
export const createLimitedClient = (options?: SupabaseClientOptions<"public"> & {
    cookieOptions?: CookieOptionsWithName;
    cookies: CookieMethodsServer;
    cookieEncoding?: "raw" | "base64url";
  }) => {
  const event = getRequestEvent()
  
  return _createServerClient(
    PUBLIC_SUPABASE_URL,
    PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll: () => event.cookies.getAll(),
        setAll: (cookies) => {
          cookies.forEach(({ name }) => {
            console.log(`Error: Attempted to write cookie ${name}, but operation not supported in this client.`)
          })
        }
      },
      ...options
    }
  )
}
