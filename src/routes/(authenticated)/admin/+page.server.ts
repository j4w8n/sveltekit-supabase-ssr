import { redirect } from '@sveltejs/kit'

export const load = async ({ locals: { getSession }, depends }) => {
  depends('supabase:auth')
  
  const session = await getSession()

  if (!session) redirect(307, '/auth');

  return { session }
}