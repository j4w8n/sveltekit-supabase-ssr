import type { Provider } from "@supabase/supabase-js"
import { fail, redirect } from "@sveltejs/kit"
import { PUBLIC_SUPABASE_URL } from '$env/static/public'
import { SUPABASE_SERVICE_ROLE_KEY } from '$env/static/private'
import { createClient } from '@supabase/supabase-js'

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
      return fail(400, {
        error: 'Please provide your email address.'
      })
    }

    const { error } = await supabase.auth.updateUser({ email }, { emailRedirectTo: 'http://localhost:5173/self '})

    if (error) {
      return fail(400, {
        error
      })
    }

    return { message: 'Please check your email to continue.' }
  },
  convert_provider: async({ request, locals: { supabase } }) => {
    const formData = await request.formData()
    const provider = formData.get('provider') as Provider

    if (!provider) {
      return fail(400, {
        error: 'Please pass a provider.'
      })
    }

    const { data, error } = await supabase.auth.linkIdentity({ provider })

    if (error) {
      return fail(400, {
        error: error.message
      })
    }

    if (data.url) redirect(303, data.url)
  },
  delete_user: async({ request}) => {
    const formData = await request.formData()
    const user = formData.get('user') as string

    if (!user) {
      return fail(400, {
        error: 'Please enter a user id.'
      })
    }

    const supabase = createClient(PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    const { error } = await supabase.auth.admin.deleteUser(user)
    
    if (error)
      return fail(400, { error: error.message })

    return { message: 'User deleted.' }
  },
  password: async({ request, locals: { supabase } }) => {
    const formData = await request.formData()
    const password = formData.get('password') as string

    if (!password) {
      return fail(400, {
        error: 'Please enter a new password'
      })
    }

    const { error } = await supabase.auth.updateUser({
      password
    })

    if (error) {
      return fail(400, {
        error: error.message
      })
    }

    return { message: 'Password updated!' }
  },
  update: async ({ request, locals: { supabase } }) => {
    const formData = await request.formData()
    const nickname = formData.get('nickname') as string

    if (!nickname) {
      return fail(400, {
        error: 'Please enter a nickname.',
        data: { nickname: '' }
      })
    }

    const { error } = await supabase.auth.updateUser({
      data: { nickname }
    })

    if (error)
      return fail(error.status ?? 400, {
        error: error.message,
        data: { nickname }
      })

    /* Refresh tokens, so we can display the new nickname. */
    await supabase.auth.refreshSession()
  },
  delete: async ({ locals: { supabase } }) => {
    const { error } = await supabase.auth.updateUser({
      data: { nickname: null }
    })

    if (error)
      return fail(error.status ?? 400, {
        error: error.message,
        data: { nickname: '' }
      })

    /* Refresh tokens, so we can display the new nickname. */
    await supabase.auth.refreshSession()
  }
}
