import { fail } from "@sveltejs/kit"

export const Fail = (
  error: { 
    message: string; 
    status?: number; 
    name?: string;
  }, 
  data?: { 
    email?: string;
    nickname?: string;
  }
) => {
  return fail(error.status ?? 400, {
    error: error.message,
    data: {
      email: data?.email,
      nickname: data?.nickname
    }
  })
}
