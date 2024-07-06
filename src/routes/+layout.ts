import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from '$env/static/public'
import { createBrowserClient, createServerClient, isBrowser } from '@supabase/ssr'

export const load = async ({ fetch, data, depends }) => {
  depends('supabase:auth')

  const supabase = isBrowser()
    ? createBrowserClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
        global: { fetch },
        cookies: {
          async getAll() {
            try {
              const res = await fetch('/cookies')
              return await res.json()
            } catch (err) {
              console.error(err)
              return null
            }
          },
          async setAll(cookies) {
            try {
              await fetch('/cookies', { method: 'POST', body: JSON.stringify(cookies) })
            } catch (err) {
              console.error(err)
            }
          }
        }
      })
    : createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
        global: { fetch },
        cookies: {
          getAll() { 
            return data.cookies
          }
        }
      })

  const session = isBrowser() ? (await supabase.auth.getSession()).data.session : data.session

  return { supabase, session }
}
