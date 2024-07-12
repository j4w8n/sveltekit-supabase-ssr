import { fail } from "@sveltejs/kit"

export const Fail = (
  error: { 
    message: string; 
    status?: number; 
    name?: string;
    phone?: string;
    verify?: boolean;
  }, 
  data?: { 
    email?: string;
    nickname?: string;
    phone?: string;
    verify?: boolean;
  }
) => {
  return fail(error.status ?? 400, {
    error: error.message,
    data: { ...data }
  })
}
