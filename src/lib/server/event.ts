import { getRequestEvent } from "$app/server" 

export const getFormData = async <T = string>(...items: string[]): Promise<{ [key: string]: T }> => {
  const { request } = getRequestEvent()
  const data = await request.formData()
  const result: { [key: string]: T } = {}

  for (const i of items.values()) {
    result[i] = data.get(i) as T
  }

  return result
}
