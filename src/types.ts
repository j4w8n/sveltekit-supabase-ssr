import type { CookieOptions } from "@supabase/ssr"

export type SupabaseJwt = {
  aal: string;
  aud: string;
  email: string;
  exp: number;
  iat: number;
  phone: string;
  role: string;
  session_id: string;
  sub: string;
  amr?: { method: string; timestamp: number; }[];
  app_metadata?: { 
    provider?: string;
    providers?: string[];
    [key: string]: any;
  };
  is_anonymous?: boolean;
  iss?: string;
  jti?: string;
  nbf?: string;
  user_metadata?: {
    [key: string]: any;
  };
}

export type CookieArray = {
  name: string;
  value: string;
  options: CookieOptions
}[]
