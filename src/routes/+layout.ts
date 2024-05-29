import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from '$env/static/public'
import { createBrowserClient, isBrowser, parse } from '@supabase/ssr'

export const load = async ({ fetch, data, depends }) => {
  depends('supabase:auth')

  const supabase = createBrowserClient(
    PUBLIC_SUPABASE_URL,
    PUBLIC_SUPABASE_ANON_KEY,
    {
      global: { fetch },
      cookies: {
        async get() {
          if (!isBrowser()) {
            return JSON.stringify(data.session)
          }
  
          try {
            const res = await fetch('/session')
            return await res.json()
          } catch (err) {
            console.error(err)
            return null
          }
          
        }
      }
    }
  )

  const {
    data: { session }
  } = await supabase.auth.getSession()

  return { supabase, session }
}