import { email, _password } from "$lib/schema.fields.js"
import * as v from "valibot"

// schemas
export const signin_email = v.object({ email, _password })
export const signup_email = v.object({ email, _password })
