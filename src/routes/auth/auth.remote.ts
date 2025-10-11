import { redirect } from "@sveltejs/kit"
import { form, getRequestEvent } from "$app/server"
import { createServerClient } from "$lib/supabase/server.js"
import * as v from "valibot"
import * as s from "./auth.schemas.js"
import * as f from "$lib/schema.fields.js"

export const signupEmail = form(s.signup_email, async ({ email, _password}) => {
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

export const signinEmail = form(s.signin_email, async ({ email, _password}) => {
  if (!email || !_password)
    return { message: 'Please enter an email and password' }

  if (_password.length < 7)
    return { message: 'Password must be at least seven characters long' }
  
  const supabase = createServerClient()
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password: _password
  })

  if (error)
    return { message: error.message }

  /* Login successful, redirect. */
  redirect(303, '/app')
})

export const signinOtp = form(v.object({ phone: f.phone }), async ({ phone }) => {
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

export const signinOAuth = form(v.object({ provider: f.provider }), async ({ provider }) => {
  const { url } = getRequestEvent()

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

export const signinMagicLink = form(v.object({ email: f.email }), async ({ email }) => {
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

export const resetPassword = form(v.object({ email: f.email }), async({ email }) => {
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

export const verifyOtp = form(v.object({ otp: f.otp, phone: f.phone }), async ({ otp, phone }) => {
  if (!otp) {
    return { message: 'Please enter an OTP.', verify: true, phone }
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
    return { message: error.message, verify: true, phone }
})
