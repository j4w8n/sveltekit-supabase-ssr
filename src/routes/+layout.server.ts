export const load = async ({ locals: { getSession }, cookies }) => {
  return { session: await getSession(), cookies: cookies.getAll() }
}
