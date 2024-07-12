import { redirect } from '@sveltejs/kit'
import { type Provider } from '@supabase/supabase-js'
import { Fail } from '$lib/utils.js'

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
  signin_email: async ({ request, locals: { supabase } }) => {
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
  signin_otp: async ({ request, locals: { supabase }}) => {
    const formData = await request.formData()
    const phone = formData.get('phone') as string

    if (!phone) {
      return Fail(
        { message: 'Please enter a phone number.' }
      )
    }

    const { error } = await supabase.auth.signInWithOtp({
      phone,
    })

    if (error)
      return Fail({ message: error.message, phone })

    return { message: 'Please check your phone for the OTP code and enter it below.' , verify: true, phone }

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
  reset: async({ request, locals: { supabase } }) => {
    const formData = await request.formData()
    const email = formData.get('email') as string

    if (!email)
      return Fail({ message: 'Please enter an email.' })

    const { error } = await supabase.auth.resetPasswordForEmail(email)

    if (error)
      return Fail(error, { email })
    else
      return { message: 'Please check your email to reset your password.' }
  },
  signout: async ({ locals: { supabase } }) => {
    await supabase.auth.signOut()
    redirect(303, '/')
  },
  verify_otp: async ({ request, locals: { supabase } }) => {
    const formData = await request.formData()
    const otp = formData.get('otp') as string
    const phone = formData.get('phone') as string

    if (!otp) {
      return Fail(
        { message: 'Please enter an OTP.', verify: true, phone }
      )
    }

    const { error } = await supabase.auth.verifyOtp({
      phone,
      type: 'sms',
      token: otp,
      options: { redirectTo: 'http://localhost:5173/app' }
    })

    if (error)
      return Fail({ message: error.message, verify: true, phone })
  }
}
