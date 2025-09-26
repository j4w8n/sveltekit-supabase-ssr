import { form } from "$app/server"
import { getFormData } from "$lib/server/event.js"
import { createAdminClient, createServerClient } from "$lib/supabase/server.js"
import type { Provider } from "@supabase/supabase-js"
import { redirect } from "@sveltejs/kit"

export const convertEmail = form('unchecked', async (data) => {
  const { email } = await getFormData(data, 'email')

  if (!email) 
    return { message: 'Please provide your email address.' }

  const supabase = createServerClient()

  const { error: user_error } = await supabase.auth.updateUser({ email })

  if (user_error)
    return { message: user_error.message }

  return { 
    message: 'Please check your email for the OTP code and enter it below, along with your new password.', 
    password_prompt: true,
  }
})

export const convertProvider = form('unchecked', async (data) => {
  const { provider } = await getFormData<Provider>(data, 'provider')

  if (!provider) 
    return { message: 'Please pass a provider.' }

  const supabase = createServerClient()

  const { data: res_data, error: link_error } = await supabase.auth.linkIdentity({ provider, options: { redirectTo: 'http:/localhost:5173/self' } })

  if (link_error)
    return { message: link_error.message }

  if (res_data.url) redirect(303, res_data.url)
})

export const updateNickname = form('unchecked', async (data) => {
  const { nickname } = await getFormData(data, 'nickname')

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

  return { message: 'Nickname updated!' }
})

// Without setting "unchecked" here, the return type is a Promise, 
// which throws a type error for "deleteNickname.result?.message" in +page.svelte
export const deleteNickname = form("unchecked", async () => {
  const supabase = createServerClient()

  const { error: user_error } = await supabase.auth.updateUser({
    data: { nickname: null }
  })

  if (user_error)
    return { message: user_error.message }

  /* Refresh tokens, so we can see the nickname is undefined. */
  await supabase.auth.refreshSession()

  return { message: 'Nickname deleted!' }
})

export const deleteUser = form("unchecked", async (data) => {
  const { user } = await getFormData(data, 'user')

  if (!user) 
    return { message: 'Please enter a user id.' }

  const supabase = createAdminClient()

  const { error: user_error } = await supabase.auth.admin.deleteUser(user)
  
  if (user_error)
    return { message: user_error.message }

  return { message: 'User deleted.' }
})

export const updatePassword = form('unchecked', async (data) => {
  const { password } = await getFormData(data, 'password')

  if (!password) 
    return { message: 'Please enter a new password' }

  const supabase = createServerClient()

  const { error: user_error } = await supabase.auth.updateUser({
    password
  })

  if (user_error)
    return { message: user_error.message }

  return { message: 'Password updated!' }
})

export const updatePhone = form('unchecked', async (data) => {
  const { phone } = await getFormData(data, 'phone')

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
    verify: true
  }
})

export const verifyOtp = form('unchecked', async (data) => {
  /**
   * This function is used to update a phone number or 
   * update an email address when converting an anonymous user.
   */
  const { otp, phone, email, password } = await getFormData(data, 'otp', 'phone', 'email', 'password')

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

  } else if (email && password) {
    const { error: otp_error } = await supabase.auth.verifyOtp({
      email,
      type: 'email_change',
      token: otp
    })

    if (otp_error)
      return { message: otp_error.message }

    const { error: update_error } = await supabase.auth.updateUser({
      password
    })

    if (update_error)
      return { message: update_error.message }
  } else {
    return { message: 'No phone or email/password received.' }
  }

  return { message: 'Success!' }
})
