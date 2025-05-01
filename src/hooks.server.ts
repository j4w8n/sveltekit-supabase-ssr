import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public'
import { createServerClient } from '@supabase/ssr'
import { redirect, type Handle } from '@sveltejs/kit'
import type { Session } from '@supabase/supabase-js'

export const handle: Handle = async ({ event, resolve }) => {
  event.locals.supabase = createServerClient(
    PUBLIC_SUPABASE_URL,
    PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () => event.cookies.getAll(),
        setAll: (cookies) => {
          cookies.forEach(({ name, value, options }) => {
            event.cookies.set(name, value, { ...options, path: '/' })
          })
        }
      }
    }
  )

  /**
   * We use getSession, as a function, rather than a static object
   * like `session`, in order to make reactivity work for some
   * features of our pages. For example, if this wasn't a function,
   * things like the `update_nickname` form action in /self 
   * wouldn't correctly update data on its page.
   */
  event.locals.getSession = async (): Promise<Session | null> => {
    const { data: { session } } = await event.locals.supabase.auth.getSession()

    if (!session) return null

    /* We wrap getClaims in a try/catch, because it could throw. */
    try {
      /**
       * If your project is using symmetric JWTs,
       * getClaims makes a network call to your Supabase instance.
       * To avoid this, see our hooks code in v0.13.0 to validate
       * and get claims using your JWT secret.
       * 
       * We pass the access_token into getClaims, otherwise it
       * would call getSession itself - which we've already done above.
       */
      const { data, error } = await event.locals.supabase.auth.getClaims(session.access_token)

      if (error || !data) return null

      const { claims } = data

      /**
       * Return a Session, created from validated claims.
       * 
       * For security, the only items you should use from `session` are the access and refresh tokens.
       * 
       * Most of these properties are required for functionality or typing.
       * Add any data needed for your layouts or pages.
       * 
       * Here are the properties which aren't required, but we use them in the demo:
       * `user.user_metadata.avatar_url`
       * `user.user_metadata.nickname`
       * `user.email`
       * `user.phone`
       */
      return {
        access_token: session.access_token,
        refresh_token: session.refresh_token,
        expires_at: claims.exp,
        expires_in: claims.exp - Math.round(Date.now() / 1000),
        token_type: 'bearer',
        user: {
          app_metadata: claims.app_metadata ?? {},
          aud: 'authenticated',
          created_at: '',
          id: claims.sub,
          email: claims.email,
          phone: claims.phone,
          user_metadata: claims.user_metadata ?? {},
          is_anonymous: claims.is_anonymous
        }
      }
    } catch (err) {
      console.error(err)
      return null
    }
  }

  const session = await event.locals.getSession()

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
