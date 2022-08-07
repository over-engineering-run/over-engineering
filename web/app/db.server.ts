import { createClient } from "@supabase/supabase-js";

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      SUPABASE_URL: string;
      SUPABASE_API_KEY: string;
    }
  }
}

export default createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_API_KEY
);
