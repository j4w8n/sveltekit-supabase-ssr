import * as v from "valibot"
import { Providers } from "./constants.js"

export const email = v.pipe(v.string(), v.rfcEmail())
export const _password = v.pipe(v.string(), v.minLength(7))
export const phone = v.string()
export const provider = v.pipe(v.string(), v.picklist(Providers))
export const otp = v.string()
