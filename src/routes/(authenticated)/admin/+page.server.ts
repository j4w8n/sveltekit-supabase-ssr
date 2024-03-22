import { JWT_SECRET } from '$env/static/private'
import { redirect } from '@sveltejs/kit'
import jwt from 'jsonwebtoken'

export const load = async ({ locals: { getSession } }) => {
  const session = await getSession()

  if (!session) redirect(307, '/auth');

  /* Ensures the session, sourced from a cookie, is not fake. See README for details. */
  jwt.verify(session.access_token, JWT_SECRET, (err) => { if (err) redirect(307, '/auth') })

  return { session }
}