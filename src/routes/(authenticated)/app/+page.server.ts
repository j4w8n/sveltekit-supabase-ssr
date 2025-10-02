/**
 * Auth validation happens in hooks.server.ts, so there's
 * no need to check anything here. Plus, we aren't returning 
 * server data to the /app page; so, this file only exists 
 * to trigger a server call for client-side routing, to check authentication.
 * 
 * If you have a one-off situation for authentication, 
 * or you'd rather be more explicit, check for a session and redirect.
 * 
 * import { redirect } from '@sveltejs/kit'
 * 
 * export const load = async ({ locals: { getSession } }) => {
 *  const session = await getSession()
 *  if (!session) redirect(307, '/auth')
 * }
 */
