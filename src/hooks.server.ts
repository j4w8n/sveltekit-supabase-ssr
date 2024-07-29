import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public'
import { createServerClient } from '@supabase/ssr'
import { redirect, type Handle } from '@sveltejs/kit'
import { JWT_SECRET } from '$env/static/private'
import * as jose from 'jose'
import type { Session } from '@supabase/supabase-js'
import type { SupabaseJwt } from './types.js'

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

  event.locals.getSession = async (): Promise<Session | null> => {
    const {
      data: { session },
    } = await event.locals.supabase.auth.getSession()

    if (!session) return null

    /**
     * Ensures the session is fully validated. See README Security section for details.
     * 
     * !!! Simply verifying the JWT does not validate the `session.user` object for use. !!!
     * See "False Security" in https://github.com/orgs/supabase/discussions/23224
     * The safest and easiest way to validate the session is by calling `getUser()`
     * and using it's returned data. An alternative, which does not make a network call, 
     * is to create a validated session; which we do below. 
     */
    try {
      const { payload: decoded }: { payload: SupabaseJwt } = await jose.jwtVerify(session.access_token, new TextEncoder().encode(JWT_SECRET))

      /**
       * Create a validated session.
       * 
       * Most of these properties are required for functionality or typing.
       * Add any data needed for your layouts or pages.
       * 
       * Here are the properties which aren't required:
       * `user.user_metadata.avatar_url`
       * `user.user_metadata.nickname`
       * `user.email`
       * `user.phone`
       * 
       * If not used, `user.user_metadata` should be an empty object.
       * 
       * If possible, avoid using anything from `session.user` to populate these,
       * especially unique user data like `id`, an email address, or any other
       * user-unique data for queries.
       */
      const validated_session: Session = {
        access_token: session.access_token,
        refresh_token: session.refresh_token,
        expires_at: decoded.exp,
        expires_in: decoded.exp - Math.round(Date.now() / 1000),
        token_type: 'bearer',
        user: {
          app_metadata: decoded.app_metadata ?? {},
          aud: 'authenticated',
          created_at: '',
          id: decoded.sub,
          email: decoded.email,
          phone: decoded.phone,
          user_metadata: {
            avatar_url: decoded.user_metadata?.avatar_url,
            nickname: decoded.user_metadata?.nickname
          },
          is_anonymous: decoded.is_anonymous
        }
      }

      return validated_session
    } catch (err) {
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
