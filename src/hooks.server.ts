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

    /* Ensures the session is valid. See README Security section for details. */
    try {
      jwt.verify(session.access_token, JWT_SECRET, (err) => { 
        if (err) throw new Error()
      })
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