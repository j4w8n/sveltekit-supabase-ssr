import { redirect } from '@sveltejs/kit'

export const GET = async ({ url, locals: { supabase } }) => {
  const code = url.searchParams.get('code') as string
  const next = url.searchParams.get('next') ?? '/'

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      redirect(303, `/${next.slice(1)}`)
    }
  }

  /* Return the user to an error page with instructions */
  redirect(303, '/')
}
