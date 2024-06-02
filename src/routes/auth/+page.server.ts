import { fail, redirect } from '@sveltejs/kit'
import { AuthApiError, type Provider } from '@supabase/supabase-js'

export const load = async ({ locals: { getSession } }) => {
  const session = await getSession()

  /* User is already logged in. */
  if (session) redirect(303, '/app')
}

export const actions = {
  signup: async ({ request, url, locals: { supabase } }) => {
    const formData = await request.formData()
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    if (!email || !password) {
      return fail(400, {
        error: 'Please enter an email and password',
        data: {
          email
        }
      })
    }

    const { error } = await supabase.auth.signUp({
      email,
      password
    })

    if (error) {
      return fail(400, {
        error: error.message,
        data: {
          email
        }
      })
    } else {
      return { message: 'Please check your email to confirm your signup.' }
    }
  },
  signin: async ({ request, locals: { supabase } }) => {
    const formData = await request.formData()
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    if (!email || !password) {
      return fail(400, {
        error: 'Please enter an email and password',
        data: {
          email
        }
      })
    }
    
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
    redirect(303, '/app')
  },
  oauth: async ({ request, url, locals: { supabase }}) => {
    const formData = await request.formData()
    const provider = formData.get('provider') as Provider

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
    if (data.url) redirect(303, data.url)
  },
  magic: async ({ request, locals: { supabase }}) => {
    const formData = await request.formData()
    const email = formData.get('email') as string

    const { error } = await supabase.auth.signInWithOtp({
      email
    })

    if (!email) {
      return fail(400, {
        error: 'Please enter an email'
      })
    }

    if (error) 
      console.error(error)
    else
      return { message: 'Please check your email to login.' }
  },
  anon: async ({ locals: { supabase }}) => {
    const { error } = await supabase.auth.signInAnonymously()

    if (error) {
      return fail(500, {
        error: 'Server error. Try again later.'
      })
    }

    /* Login successful, redirect. */
    redirect(303, '/app')
  },
  signout: async ({ locals: { supabase } }) => {
    await supabase.auth.signOut()
    redirect(303, '/')
  }
}