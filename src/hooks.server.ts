import { redirect } from "@sveltejs/kit"
import { getSession } from "$lib/supabase/supabase.remote.js"

export const handle = async ({ event, resolve }) => {
  const session = await getSession()

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

  return resolve(event, {
    filterSerializedResponseHeaders(name) {
      return name === 'content-range' || name === 'x-supabase-api-version'
    },
  })
}
