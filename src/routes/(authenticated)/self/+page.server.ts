import { fail } from "@sveltejs/kit"

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
