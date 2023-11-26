import { fail, redirect } from '@sveltejs/kit'
import { AuthApiError, type Provider } from '@supabase/supabase-js'

export const load = async ({ locals: { getSession } }) => {
  const session = await getSession()

  /* User is already logged in. */
  if (session) throw redirect(303, '/app')
}

export const actions = {
  signup: async ({ request, url, locals: { supabase } }) => {
    const formData = await request.formData()
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    if (email && password) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${url.origin}/app` }
      })

      if (error) 
        console.error(error)
      else
        return { message: 'Please check your email to confirm your signup.' }
    }
  },
  signin: async ({ request, url, locals: { supabase } }) => {
    const formData = await request.formData()
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const provider = formData.get('provider') as Provider

    if (email && password) {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
    
      if (error) {
        if (error instanceof AuthApiError && error.status === 400) {
          return fail(400, {
            error: 'Invalid credentials.',
            data: {
              email
            }
          })
        }
        return fail(500, {
          error: 'Server error. Try again later.',
          data: {
            email
          }
        })
      }

      /* Login successful, redirect. */
      throw redirect(303, '/app')
      
    } else if (provider) {
      /* OAuth sign-in. */

      /**
       * Sign-in will not happen yet, because we're on the server-side, 
       * but we need the returned url.
       */
      const { data, error } = await supabase.auth.signInWithOAuth({ 
        provider,
        options: {
          redirectTo: `${url.origin}/auth/callback?next=/app`
        }
      })

      if (error) throw error

      /* Now authorize sign-in on browser. */
      if (data.url) throw redirect(303, data.url)

    } else {
      return fail(400, {
        error: 'Please enter an email and password',
        data: {
          email
        }
      })
    }
  },
  signout: async ({ locals: { supabase } }) => {
    await supabase.auth.signOut()
    throw redirect(303, '/')
  }
}