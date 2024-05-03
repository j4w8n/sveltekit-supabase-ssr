export const load = async ({ locals: { getSession } }) => {
  /**
   * Auth validation happens in hooks.server.ts, so there's
   * no need to check anything here.
   * 
   * If you have a one-off situation, or you'd rather be
   * more explicit, check for a session and redirect.
   * 
   * import { redirect } from '@sveltejs/kit'
   * if (!session) redirect(307, '/auth')
   */

  const session = await getSession()

  return { session }
}
