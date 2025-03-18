import { getRequestEvent } from "$app/server" 

export const getFormData = async <T = string, K extends string = string>(...items: K[]): Promise<{ [key in K]: T }> => {
  const { request } = getRequestEvent()
  const data = await request.formData()
  const result: { [key: string]: T } = {}

  for (const i of items.values()) {
    result[i] = data.get(i) as T
  }

  return result as { [key in K]: T }
}
