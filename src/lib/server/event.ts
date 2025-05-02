import { getRequestEvent } from "$app/server" 

/**
 * Returns the formData items you request,
 * from an `event`.
 * 
 * @example const { email, password } = await getFormData('email', 'password')
 */
export const getFormData = async <
T = string, 
K extends string = string
>(...items: K[]): Promise<{ [key in K]: T | null }> => {
  const { request } = getRequestEvent()
  const data = await request.formData()
  const result: { [key: string]: T | null } = {}

  for (const i of items.values()) {
    result[i] = data.get(i) as T
  }

  return result as { [key in K]: T | null }
}
