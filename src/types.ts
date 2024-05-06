export type SupabaseJwt = {
  aud: string;
  exp: number;
  iat: number;
  iss: string;
  sub: string;
  email: string;
  phone: string;
  app_metadata: { 
    provider?: string;
    providers?: string[];
    [key: string]: any;
  },
  user_metadata: {
    [key: string]: any;
  },
  role: string;
  aal: string;
  amr: { method: string; timestamp: number; }[],
  session_id: string;
  is_anonymous: boolean;
}