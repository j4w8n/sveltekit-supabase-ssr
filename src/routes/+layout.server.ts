export const load = async ({ locals: { getSession }, cookies }) => {
  const session = await getSession()

  return { session, cookies: cookies.getAll() }
}
