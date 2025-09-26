import type { RemoteFormInput } from "@sveltejs/kit"

/**
 * Returns the formData items you request.
 * 
 * @example const { email, password } = await getFormData(data, 'email', 'password')
 */
export const getFormData = async <
T = string, 
K extends string = string
>(data: RemoteFormInput, ...items: K[]): Promise<{ [key in K]: T | null }> => {
  const result: { [key: string]: T | null } = {}

  for (const i of items.values()) {
    result[i] = data[i] as T
  }

  return result as { [key in K]: T | null }
}
