import {
  createClient,
  SupabaseClient,
} from "https://esm.sh/@supabase/supabase-js@1.35.4";
import { scan, extract } from "./lib.ts";
import { config } from "https://deno.land/x/dotenv@v3.2.0/mod.ts";

const insert =
  (db: SupabaseClient, table: string) => async (record: Partial<any>) => {
    const { data, error } = await db.from(table).upsert(record);

    if (error) {
      throw error;
    }
    return data;
  };

/** target website href for scraping */
const href = "https://ithelp.ithome.com.tw/articles?tab=ironman";

async function main() {
  config({ safe: true, export: true });

  const db = createClient(
    // Supabase API URL - env var exported by default when deployed.
    Deno.env.get("SUPABASE_URL")!,
    // Supabase API ANON KEY - env var exported by default when deployed.
    Deno.env.get("SUPABASE_API_KEY")!
  );

  // start from href and get back document per page
  for await (const document of scan(href)) {
    // extract information from document
    extract(document, {
      user: insert(db, "users"),
      series: insert(db, "series"),
      article: insert(db, "articles"),
    });
  }
}

main();
