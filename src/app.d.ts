import { SupabaseClient, Session } from "@supabase/supabase-js"
import type { Database } from "./DatabaseDefinitions"

declare global {
  namespace App {
    interface Locals {
      supabase: SupabaseClient<Database, "public", Database.public>
      getSession(): Promise<Session | null>
    }
    interface PageData {
      session: Session | null
    }
    // interface Error {}
    // interface Platform {}
  }
}

export {}
