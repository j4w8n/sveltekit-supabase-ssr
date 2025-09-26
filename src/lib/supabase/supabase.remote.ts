import { query } from "$app/server"
import type { Session } from "@supabase/supabase-js"
import { getValidatedSession } from "./shared.js"
import { createLimitedClient } from "./server.js"

/**
 * Get validated session from cookie JWT claims.
 */
export const getSession = query(
  async (): Promise<Session | null> => {
    return await getValidatedSession(createLimitedClient())
  }
)

/**
 * Check for a valid user via network request to Supabase instance.
 * 
 * Returns validated session.
 * 
 * Good for additional user checks, like:
 * - banned?
 * - deleted?
 * - logged out globally?
 * - etc
 */
export const checkUser = query(
  async (): Promise<Session | null> => {
    const supabase = createLimitedClient()
    let session = await getValidatedSession(supabase)

    if (!session) return null

    const { error } = await supabase.auth.getUser(session.access_token)

    if (error) {
      console.error('Error getting user:', error)

      /* Only return for certain errors? */
      return null
    }

    return session
  }
)
