import {
  createClient,
  SupabaseClient,
} from "https://esm.sh/@supabase/supabase-js@1.35.4";
import { config } from "https://deno.land/x/dotenv@v3.2.0/mod.ts";
import { parse } from "https://deno.land/std@0.136.0/flags/mod.ts";
import { extract, fetchDOM, random, delay } from "./lib.ts";

config({ safe: true, export: true });

const db = createClient(
  // Supabase API URL - env var exported by default when deployed.
  Deno.env.get("SUPABASE_URL")!,
  // Supabase API ANON KEY - env var exported by default when deployed.
  Deno.env.get("SUPABASE_API_KEY")!
);

const insert =
  (db: SupabaseClient, table: string) => async (record: Partial<any>) => {
    const { data, error } = await db.from(table).upsert(record);

    if (error) {
      throw error;
    }
    return data;
  };

interface Args {
  from: string;
  to: string;
  href: string;
}
async function main({ from, to, href }: Args) {
  const _from = Number(from);
  const _to = Number(to);

  console.log(`start processing page from ${_from} to ${_to} ...`);

  for (let page = _from; page <= _to; page++) {
    const url_instance = new URL(href);
    url_instance.searchParams.set("page", String(page));

    const document = await fetchDOM(url_instance.href);
    await extract(document, {
      user: insert(db, "users"),
      series: insert(db, "series"),
      article: insert(db, "articles"),
    });

    await delay(random(300, 700));
  }

  console.log(`finished processing page from ${_from} to ${_to} ...`);
}

//@ts-ignore
main(parse(Deno.args));
