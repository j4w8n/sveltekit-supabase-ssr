import { createServerClient } from "$lib/supabase/server.js"
import { getValidatedSession } from "$lib/supabase/shared.js"
import { redirect } from "@sveltejs/kit"

export const handle = async ({ event, resolve }) => {
  /* Only check auth for non-remote-function calls. */
  // should we even continue doing auth checks here?
  if (!event.isRemoteRequest) {
    // call directly, so we can refresh the session and update the auth cookie if needed
    const session = await getValidatedSession(createServerClient())

    /**
     * Only authenticated users can access these paths and their sub-paths.
     * 
     * If you'd rather do this in your routes, see (authenticated)/app/+page.server.ts
     * for an example.
     * 
     * If you don't use a layout group for auth-protected paths, then you can use
     * new Set(['app', 'self']) or whatever your top-level path segments are, and
     * .has(event.url.pathname.split('/')[1])
     */
    const auth_protected_paths = new Set(['(authenticated)'])
    if (!session && auth_protected_paths.has(event.route.id?.split('/')[1] || '')) 
      redirect(307, '/auth')
  }

  return resolve(event, {
    filterSerializedResponseHeaders(name) {
      return name === 'content-range' || name === 'x-supabase-api-version'
    },
  })
}
