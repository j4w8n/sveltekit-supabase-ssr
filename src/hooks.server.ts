import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public'
import { createServerClient } from '@supabase/ssr'
import type { Handle } from '@sveltejs/kit'
import { JWT_SECRET } from '$env/static/private'
import jwt from 'jsonwebtoken'

export const handle: Handle = async ({ event, resolve }) => {
  event.locals.supabase = createServerClient(
    PUBLIC_SUPABASE_URL,
    PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get: (key) => event.cookies.get(key),
        set: (key, value, options) => {
          event.cookies.set(key, value, { ...options, path: '/' })
        },
        remove: (key, options) => {
          event.cookies.delete(key, { ...options, path: '/' })
        }
      }
    }
  )

  /**
   * We do not call `getUser()` here,
   * since we're validating the JWT.
   */
  event.locals.getSession = async () => {
    const {
      data: { session },
    } = await event.locals.supabase.auth.getSession()

    if (!session) return null

    /**
     * Ensures the session is valid. See README Security section for details.
     * 
     * !!! Verifying the JWT is not enough to validate using session.user info to render sensitive user data on the server-side. !!!
     * See "False Security" in https://github.com/orgs/supabase/discussions/23224
     * The safest and easiest way to do this is by calling `getUser()` and using the returned data.
     * An alternative, which doesn't make a network call, is to extract information from the decoded JWT. 
     */
    try {
      jwt.verify(session.access_token, JWT_SECRET)
    } catch (err) {
      return null
    }
    
    return session
  }

  return resolve(event, {
    filterSerializedResponseHeaders(name) {
      return name === 'content-range'
    },
  })
}