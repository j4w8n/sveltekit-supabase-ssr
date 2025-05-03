import type { SupabaseClient, Session } from "@supabase/supabase-js"

/**
 * Validate a session on the client or server side.
 */
export const getValidatedSession = async (supabase: SupabaseClient): Promise<Session | null> => {
  const session = (await supabase.auth.getSession()).data.session

  if (!session) return null

  /* We wrap getClaims in a try/catch, because it could throw. */
  try {
    /**
     * If your project is using symmetric JWTs,
     * getClaims makes a network call to your Supabase instance.
     * 
     * We pass the access_token into getClaims, otherwise it
     * would call getSession itself - which we've already done above.
     * 
     * If you need data that is only returned from `getUser`,
     * then you can substitute it here and assign accordingly in the return statement.
     */
    const { data, error } = await supabase.auth.getClaims(session.access_token)

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
        created_at: '', // only found in session.user or getUser
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
