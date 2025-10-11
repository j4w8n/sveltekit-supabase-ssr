import { form } from "$app/server"
import { createServerClient } from "$lib/supabase/server.js"
import { getSession } from "$lib/supabase/supabase.remote.js"
import { redirect } from "@sveltejs/kit"
import * as v from "valibot"
import * as f from "$lib/schema.fields.js"

// None of these remote functions require an auth check
// because the supabase client functions should only
// take effect on the logged in user - which is driven
// by the cookie the server receives.

export const convertEmail = form(v.object({ email: f.email }), async ({ email }) => {
  if (!email) 
    return { message: 'Please provide your email address.' }

  const supabase = createServerClient()

  const { error: user_error } = await supabase.auth.updateUser({ email })

  if (user_error)
    return { message: user_error.message }

  return { 
    message: 'Please check your email for the OTP code and enter it below, along with your new password.', 
    email,
    verify: true,
  }
})

export const convertProvider = form(v.object({ provider: f.provider }), async ({ provider }) => {
  if (!provider) 
    return { message: 'Please pass a provider.' }

  const supabase = createServerClient()

  const { data: res_data, error: link_error } = await supabase.auth.linkIdentity({ provider, options: { redirectTo: 'http:/localhost:5173/self' } })

  if (link_error)
    return { message: link_error.message }

  if (res_data.url) redirect(303, res_data.url)
})

export const updateNickname = form(v.object({ nickname: v.string() }), async ({ nickname }) => {
  if (!nickname)
    return { message: 'Please enter a nickname.' }

  const supabase = createServerClient()

  const { error: user_error } = await supabase.auth.updateUser({
    data: { nickname }
  })

  if (user_error)
    return { message: user_error.message }

  /* Refresh tokens, so we can display the new nickname. */
  await supabase.auth.refreshSession()

  /* Refresh data on the page. */
  await getSession().refresh()

  return { message: 'Nickname updated!' }
})

export const deleteNickname = form("unchecked", async () => {
  const supabase = createServerClient()

  const { error: user_error } = await supabase.auth.updateUser({
    data: { nickname: null }
  })

  if (user_error)
    return { message: user_error.message }

  /* Refresh tokens, so we can see the nickname is undefined. */
  await supabase.auth.refreshSession()
  
  /* Refresh data on the page. */
  await getSession().refresh()

  return { message: 'Nickname deleted!' }
})

export const updatePassword = form(v.object({ _password: f._password}), async ({ _password }) => {
  if (!_password) 
    return { message: 'Please enter a new password' }

  const supabase = createServerClient()

  const { error: user_error } = await supabase.auth.updateUser({
    password: _password
  })

  if (user_error)
    return { message: user_error.message }

  return { message: 'Password updated!' }
})

export const updatePhone = form(v.object({ phone: f.phone }), async ({ phone }) => {
  if (!phone) 
    return { message: 'Please enter a phone number.' }

  const supabase = createServerClient()

  /* Sends an OTP to phone number. */
  const { error: phone_error } = await supabase.auth.updateUser({
    phone
  })

  if (phone_error)
    return { message: phone_error.message }

  return { 
    message: 'Please check your phone for the OTP code and enter it below.',
    phone,
    verify: true
  }
})

export const verifyOtp = form(v.object({ 
  otp: f.otp, 
  phone: v.optional(f.phone), 
  email: v.optional(f.email), 
  _password: v.optional(f._password) 
}), async ({
  otp, phone, email, _password
}) => {
  /**
   * This function is used to update a phone number or 
   * update an email address when converting an anonymous user.
   */

  if (!otp) 
    return { message: 'Please enter an OTP.' }

  const supabase = createServerClient()

  if (phone) {
    const { error: otp_error } = await supabase.auth.verifyOtp({
      phone,
      type: 'phone_change',
      token: otp
    })

    if (otp_error)
      return { message: otp_error.message }

  } else if (email && _password) {
    const { error: otp_error } = await supabase.auth.verifyOtp({
      email,
      type: 'email_change',
      token: otp
    })

    if (otp_error)
      return { message: otp_error.message }

    const { error: update_error } = await supabase.auth.updateUser({
      password: _password
    })

    if (update_error)
      return { message: update_error.message }
  } else {
    return { message: 'No phone or email/password received.' }
  }

  return { message: 'Success!' }
})
