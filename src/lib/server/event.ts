import { getRequestEvent } from "$app/server"

/**
 * Returns the called Remote Function's name.
 */
export const getRFName = (): string | null => {
  const { request } = getRequestEvent()

  if (!request.url.includes('_app/remote'))
    return null

  return request.url.split("/").filter(Boolean).at(-1) ?? null
}
