import { form } from "$app/server"
import { isRoleAuthorized } from "$lib/server/event.js"
import { createServerClient } from "$lib/supabase/server.js"
import { getSession } from "$lib/supabase/supabase.remote.js"
import { error } from "@sveltejs/kit"
import * as v from "valibot"

export const deleteUser = form(v.object({ user: v.string() }), async ({ user }) => {
  // fail fast
  const session = await getSession()
  if (!session) error(401)

  // fail fast
  // set fallback to 'none' for demo, but it's better to use a Supabase custom access token hook to set this.
  // https://supabase.com/docs/guides/auth/auth-hooks/custom-access-token-hook
  // change 'none' to 'admin' in order to make user authorized for this function.
  const authorized = isRoleAuthorized('admin', session?.user.app_metadata.role ?? 'none')
  if (!authorized) error(403)

  if (!user) return { message: 'Please enter a user id.' }

  const supabase = createServerClient()

  try {
    const { error: user_error } = await supabase.auth.admin.deleteUser(user)
  
    if (user_error)
      return { message: user_error.message }
  } catch (error: any) {
    return { message: error.message }
  }

  return { message: 'User deleted.' }
})
