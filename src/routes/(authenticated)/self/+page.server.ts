import type { Provider } from "@supabase/supabase-js"
import { fail, redirect } from "@sveltejs/kit"
import { PUBLIC_SUPABASE_URL } from '$env/static/public'
import { SUPABASE_SERVICE_ROLE_KEY } from '$env/static/private'
import { createClient } from '@supabase/supabase-js'
import { getFormData } from "$lib/server/event.js"

export const load = async ({ locals: { getSession } }) => {
  return { session: await getSession() }
}

export const actions = {
  convert_email: async({ locals: { supabase } }) => {
    const { email } = await getFormData('email')

    if (!email) {
      return fail(400, {
        error: 'Please provide your email address.'
      })
    }

    const { error } = await supabase.auth.updateUser({ email })

    if (error)
      return fail(error.status ?? 400, { error: error.message })

    return { 
      message: 'Please check your email for the OTP code and enter it below, along with your new password.' , 
      verify: true, 
      password_prompt: true, 
      email 
    }
  },
  convert_provider: async({ locals: { supabase } }) => {
    const { provider } = await getFormData<Provider>('provider')

    if (!provider) {
      return fail(400, {
        error: 'Please pass a provider.'
      })
    }

    const { data, error } = await supabase.auth.linkIdentity({ provider, options: { redirectTo: 'http:/localhost:5173/self' } })

    if (error)
      return fail(error.status ?? 400, { error: error.message })

    if (data.url) redirect(303, data.url)
  },
  delete_nickname: async ({ locals: { supabase } }) => {
    const { error } = await supabase.auth.updateUser({
      data: { nickname: null }
    })

    if (error)
      return fail(error.status ?? 400, { error: error.message, nickname: '' })

    /* Refresh tokens, so we can display the new nickname. */
    await supabase.auth.refreshSession()
  },
  delete_user: async() => {
    const { user } = await getFormData('user')

    if (!user) {
      return fail(400, {
        error: 'Please enter a user id.'
      })
    }

    const supabase = createClient(PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    const { error } = await supabase.auth.admin.deleteUser(user)
    
    if (error)
      return fail(error.status ?? 400, { error: error.message })

    return { message: 'User deleted.' }
  },
  update_nickname: async ({ locals: { supabase } }) => {
    const { nickname } = await getFormData('nickname')

    if (!nickname) {
      return fail(400,
        { error: 'Please enter a nickname.' }
      )
    }

    const { error } = await supabase.auth.updateUser({
      data: { nickname }
    })

    if (error)
      return fail(error.status ?? 400, { error: error.message, nickname })

    /* Refresh tokens, so we can display the new nickname. */
    await supabase.auth.refreshSession()
  },
  update_password: async({ locals: { supabase } }) => {
    const { password } = await getFormData('password')

    if (!password) {
      return fail(400, {
        error: 'Please enter a new password'
      })
    }

    const { error } = await supabase.auth.updateUser({
      password
    })

    if (error)
      return fail(error.status ?? 400, { error: error.message })

    return { message: 'Password updated!' }
  },
  update_phone: async ({ locals: { supabase } }) => {
    const { phone } = await getFormData('phone')

    if (!phone) {
      return fail(400,
        { error: 'Please enter a phone number.' }
      )
    }

    /* Sends an OTP to phone number. */
    const { error } = await supabase.auth.updateUser({
      phone
    })

    if (error)
      return fail(error.status ?? 400, { error: error.message })

    return { message: 'Please check your phone for the OTP code and enter it below.' , verify: true, phone }
  },
  verify_otp: async ({ locals: { supabase } }) => {
    /**
     * This action is used to update a phone number or 
     * update an email address when converting an anonymous user.
     */
    const { otp, phone, email, password } = await getFormData('otp', 'phone', 'email', 'password')

    if (!otp) {
      return fail(400,
        { message: 'Please enter an OTP.', verify: true, phone, email, password_prompt: password ? false : true }
      )
    }

    if (phone) {
      const { error } = await supabase.auth.verifyOtp({
        phone,
        type: 'phone_change',
        token: otp
      })

      if (error)
        return fail(error.status ?? 400, { error: error.message, verify: true, phone })

    } else if (email && password) {
      const { error } = await supabase.auth.verifyOtp({
        email,
        type: 'email_change',
        token: otp
      })

      if (error)
        return fail(400, { error: error.message, verify: true, email, password_prompt: true })

      const { error: updateError } = await supabase.auth.updateUser({
        password
      })

      if (updateError)
        return fail(updateError.status ?? 400, { error: updateError.message, verify: true, email, password_prompt: true })
    } else {
      return fail(400, { error: 'No phone or email/password received.'})
    }

    return { message: 'Success!' , verify: false, password_prompt: false }
  }
}
