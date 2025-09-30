import { redirect } from "@sveltejs/kit"
import { form, getRequestEvent } from "$app/server"
import { type Provider } from "@supabase/supabase-js"
import { getFormData } from "$lib/server/utils.js"
import { createServerClient } from "$lib/supabase/server.js"

export const signup = form('unchecked', async (data) => {
  const { email, _password } = await getFormData(data, 'email', '_password')

  if (!email || !_password)
    return { message: 'Please enter an email and password' }

  const supabase = createServerClient()
  const { error } = await supabase.auth.signUp({
    email,
    password: _password
  })

  if (error)
    return { message: error.message }
  else
    return { message: 'Please check email to confirm your signup.' }
})

export const signinEmail = form('unchecked', async (data) => {
  const { email, password } = await getFormData(data, 'email', 'password')

  if (!email || !password)
    return { message: 'Please enter an email and password' }
  
  const supabase = createServerClient()
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error)
    return { message: error.message }

  /* Login successful, redirect. */
  redirect(303, '/app')
})

export const signinOtp = form('unchecked', async (data) => {
  const { phone } = await getFormData(data, 'phone')

  if (!phone)
    return { message: 'Please enter a phone number.' }

  const supabase = createServerClient()
  const { error } = await supabase.auth.signInWithOtp({
    phone,
  })

  if (error)
    return { message: error.message }

  return { 
    message: 'Please check your phone for the OTP code and enter it below.',
    verify: true,
    phone
  }
})

export const signinOAuth = form('unchecked', async (data) => {
  const { url } = getRequestEvent()
  const { provider } = await getFormData<Provider>(data, 'provider')

  if (!provider)
    return { message: 'No provider found.' }

  const supabase = createServerClient()
  /**
   * Sign-in will not happen yet, because we're on the server-side, 
   * but we need the returned url.
   */
  const { data: o_auth_data, error } = await supabase.auth.signInWithOAuth({ 
    provider,
    options: {
      redirectTo: `${url.origin}/auth/callback?next=/app`
    }
  })

  if (error)
    return { message: error.message }

  /* Now authorize sign-in on browser. */
  if (o_auth_data.url) redirect(303, o_auth_data.url)
})

export const signinMagicLink = form('unchecked', async (data) => {
  const { email } = await getFormData(data, 'email')

  if (!email)
    return { message: 'Please enter an email.' }

  const supabase = createServerClient()
  const { error } = await supabase.auth.signInWithOtp({
    email
  })

  if (error)
    return { message: error.message }
  else
    return { message: 'Please check your email to login.' }
})

export const signinAnonymously = form('unchecked', async () => {
  const supabase = createServerClient()
  const { error } = await supabase.auth.signInAnonymously()

  if (error)
    return { message: error.message }

  /* Login successful, redirect. */
  redirect(303, '/app')
})

export const resetPassword = form('unchecked', async(data) => {
  const { email } = await getFormData(data, 'email')

  if (!email)
    return { message: 'Please enter an email.' }

  const supabase = createServerClient()
  const { error } = await supabase.auth.resetPasswordForEmail(email)

  if (error)
    return { message: error.message }
  else
    return { message: 'Please check your email to reset your password.' }
})

export const signout = form('unchecked', async () => {
  const supabase = createServerClient()
  await supabase.auth.signOut()
  redirect(303, '/')
})

export const verifyOtp = form('unchecked', async (data) => {
  const { otp, phone } = await getFormData(data, 'otp', 'phone')

  if (!otp) {
    return { message: 'Please enter an OTP.', verify: true }
  }

  if (!phone) {
    return { message: 'No phone number found.', verify: true }
  }

  const supabase = createServerClient()
  const { error } = await supabase.auth.verifyOtp({
    phone,
    type: 'sms',
    token: otp,
    options: { redirectTo: 'http://localhost:5173/app' }
  })

  if (error)
    return { message: error.message, verify: true }
})
