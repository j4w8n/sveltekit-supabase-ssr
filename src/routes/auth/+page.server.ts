import { getSession } from "$lib/supabase/supabase.remote.js"
import { redirect } from "@sveltejs/kit"

export const load = async () => {
  const session = await getSession()

  /* User is already logged in. */
  if (session) redirect(303, '/app')
}
