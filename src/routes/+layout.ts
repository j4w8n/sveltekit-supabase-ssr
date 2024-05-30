import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from '$env/static/public'
import { createBrowserClient, createServerClient, isBrowser, parse } from '@supabase/ssr'

export const load = async ({ fetch, data, depends }) => {
  depends('supabase:auth')

  const supabase = isBrowser()
    ? createBrowserClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
        global: { fetch },
        cookies: {
          async get() {
            try {
              const res = await fetch('/session')
              return await res.json()
            } catch (err) {
              console.error(err)
              return null
            }
          }
        }
      })
    : createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
        global: { fetch },
        cookies: {
          get() { 
            return JSON.stringify(data.session)
          }
        }
      })

  const session = isBrowser() ? (await supabase.auth.getSession()).data.session : data.session

  return { supabase, session }
}