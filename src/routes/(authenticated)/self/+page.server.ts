import type { Provider } from "@supabase/supabase-js"
import { redirect } from "@sveltejs/kit"
import { PUBLIC_SUPABASE_URL } from '$env/static/public'
import { SUPABASE_SERVICE_ROLE_KEY } from '$env/static/private'
import { createClient } from '@supabase/supabase-js'
import { Fail } from "$lib/utils.js"

export const load = async ({ locals: { getSession } }) => {
  /**
   * Auth validation happens in hooks.server.ts, so there's
   * no need to check anything here.
   * 
   * If you have a one-off situation, or you'd rather be
   * more explicit, check for a session and redirect.
   * 
   * import { redirect } from '@sveltejs/kit' // Would be added in with the `fail` import above.
   * if (!session) redirect(307, '/auth') // Would be added after the `const session...` below.
   */

  const session = await getSession()

  return { session }
}

export const actions = {
  convert_email: async({ request, locals: { supabase } }) => {
    const formData = await request.formData()
    const email = formData.get('email') as string

    if (!email) {
      return Fail({
        message: 'Please provide your email address.'
      })
    }

    const { error } = await supabase.auth.updateUser({ email }, { emailRedirectTo: 'http://localhost:5173/self '})

    if (error)
      return Fail(error)

    return { message: 'Please check your email to continue.' }
  },
  convert_provider: async({ request, locals: { supabase } }) => {
    const formData = await request.formData()
    const provider = formData.get('provider') as Provider

    if (!provider) {
      return Fail({
        message: 'Please pass a provider.'
      })
    }

    const { data, error } = await supabase.auth.linkIdentity({ provider, options: { redirectTo: 'http:/localhost:5173/self' } })

    if (error)
      return Fail(error)

    if (data.url) redirect(303, data.url)
  },
  delete_nickname: async ({ locals: { supabase } }) => {
    const { error } = await supabase.auth.updateUser({
      data: { nickname: null }
    })

    if (error)
      return Fail(error, { nickname: '' })

    /* Refresh tokens, so we can display the new nickname. */
    await supabase.auth.refreshSession()
  },
  delete_user: async({ request}) => {
    const formData = await request.formData()
    const user = formData.get('user') as string

    if (!user) {
      return Fail({
        message: 'Please enter a user id.'
      })
    }

    const supabase = createClient(PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    const { error } = await supabase.auth.admin.deleteUser(user)
    
    if (error)
      return Fail(error)

    return { message: 'User deleted.' }
  },
  update_nickname: async ({ request, locals: { supabase } }) => {
    const formData = await request.formData()
    const nickname = formData.get('nickname') as string

    if (!nickname) {
      return Fail(
        { message: 'Please enter a nickname.' },
        { nickname: '' }
      )
    }

    const { error } = await supabase.auth.updateUser({
      data: { nickname }
    })

    if (error)
      return Fail(error, { nickname })

    /* Refresh tokens, so we can display the new nickname. */
    await supabase.auth.refreshSession()
  },
  update_password: async({ request, locals: { supabase } }) => {
    const formData = await request.formData()
    const password = formData.get('password') as string

    if (!password) {
      return Fail({
        message: 'Please enter a new password'
      })
    }

    const { error } = await supabase.auth.updateUser({
      password
    })

    if (error)
      return Fail(error)

    return { message: 'Password updated!' }
  },
  update_phone: async ({ request, locals: { supabase } }) => {
    const formData = await request.formData()
    const phone = formData.get('phone') as string

    if (!phone) {
      return Fail(
        { message: 'Please enter a phone number.' }
      )
    }

    /* Sends an OTP to phone number. */
    const { error } = await supabase.auth.updateUser({
      phone
    })

    if (error)
      return Fail({ message: error.message })

    return { message: 'Please check your phone for the OTP code and enter it below.' , verify: true, phone }
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
      type: 'phone_change',
      token: otp
    })

    if (error)
      return Fail({ message: error.message, verify: true, phone })

    return { message: 'Your phone number has been changed.' , verify: false }
  }
}
