import { fail, redirect } from '@sveltejs/kit'
import { type Provider } from '@supabase/supabase-js'

const Fail = (error: { message: string, status?: number, name?: string }, data?: { email?: string }) => {
  return fail(error.status ?? 400, {
    error: error.message,
    data: {
      email: data?.email
    }
  })
}

export const load = async ({ locals: { getSession } }) => {
  const session = await getSession()

  /* User is already logged in. */
  if (session) redirect(303, '/app')
}

export const actions = {
  signup: async ({ request, locals: { supabase } }) => {
    const formData = await request.formData()
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    if (!email || !password)
      return Fail(
        { message: 'Please enter an email and password' }, 
        { email }
      )

    const { error } = await supabase.auth.signUp({
      email,
      password
    })

    if (error)
      return Fail(error, { email })
    else
      return { message: 'Please check your email to confirm your signup.' }
  },
  signin: async ({ request, locals: { supabase } }) => {
    const formData = await request.formData()
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    if (!email || !password)
      return Fail(
        { message: 'Please enter an email and password' }, 
        { email }
      )
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
  
    if (error)
      return Fail(error, { email })

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

    if (error)
      return Fail(error)

    /* Now authorize sign-in on browser. */
    if (data.url) redirect(303, data.url)
  },
  magic: async ({ request, locals: { supabase }}) => {
    const formData = await request.formData()
    const email = formData.get('email') as string

    if (!email)
      return Fail({ message: 'Please enter an email.' })

    const { error } = await supabase.auth.signInWithOtp({
      email
    })

    if (error)
      return Fail(error, { email })
    else
      return { message: 'Please check your email to login.' }
  },
  anon: async ({ locals: { supabase }}) => {
    const { error } = await supabase.auth.signInAnonymously()

    if (error)
      return Fail(error)

    /* Login successful, redirect. */
    redirect(303, '/app')
  },
  signout: async ({ locals: { supabase } }) => {
    await supabase.auth.signOut()
    redirect(303, '/')
  }
}