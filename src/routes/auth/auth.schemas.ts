import * as v from "valibot"

const Providers = [ "apple", "azure", "bitbucket", "discord", "facebook", "figma", "github", "gitlab", "google", "kakao", "keycloak", "linkedin", "linkedin_oidc", "notion", "slack", "slack_oidc", "spotify", "twitch", "twitter", "workos", "zoom", "fly" ] as const

export const email = v.pipe(v.string(), v.rfcEmail())
export const _password = v.string()
export const phone = v.string()
export const provider = v.pipe(v.string(), v.picklist(Providers))
export const otp = v.pipe(v.string(), v.transform((s) => Number(s)),v.number())
