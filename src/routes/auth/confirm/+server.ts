import type { EmailOtpType } from '@supabase/supabase-js'
import { redirect } from '@sveltejs/kit'

export const GET = async (event) => {
	const {
		url,
		locals: { supabase }
	} = event
	const token_hash = url.searchParams.get('token_hash') as string
	const type = url.searchParams.get('type') as EmailOtpType
	const next = url.searchParams.get('next') ?? '/'

  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash, type })
    if (!error) {
      throw redirect(303, `/${next.slice(1)}`)
    }
  }

  /* Return the user to an error page with some instructions */
  throw redirect(303, '/')
}