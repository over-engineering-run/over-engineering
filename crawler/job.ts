import {
  createClient,
  SupabaseClient,
} from "https://esm.sh/@supabase/supabase-js@1.35.4";
import { config } from "https://deno.land/x/dotenv@v3.2.0/mod.ts";
import { parse } from "https://deno.land/std@0.136.0/flags/mod.ts";
import { extract, fetchDOM, random, delay } from "./lib.ts";
import { url_string } from "./url.ts";

config({ safe: true, export: true });

const db = createClient(
  // Supabase API URL - env var exported by default when deployed.
  Deno.env.get("SUPABASE_URL")!,
  // Supabase API ANON KEY - env var exported by default when deployed.
  Deno.env.get("SUPABASE_API_KEY")!
);

const insert =
  (db: SupabaseClient, table: string) => async (record: Partial<unknown>) => {
    const { data, error } = await db.from(table).upsert(record);

    if (error) {
      throw error;
    }
    return data;
  };

interface Args {
  from: number;
  to: number;
  href: string;
}
async function main({ from, to, href }: Args) {
  console.log(`start processing page from ${from} to ${to} ...`);

  for (let page = from; page <= to; page++) {
    const page_href = url_string({ pathname: href, search: { page } });

    const document = await fetchDOM(page_href);
    await extract(document, {
      user: insert(db, "users"),
      series: insert(db, "series"),
      article: insert(db, "articles"),
    });

    await delay(random(300, 700));
  }

  console.log(`finished processing page from ${from} to ${to} ...`);
}

const args = parse(Deno.args);
main({
  from: Number(args.from),
  to: Number(args.to),
  href: String(args.href),
});
