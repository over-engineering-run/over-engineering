import db from "../_shared/supabase_client.ts";
import { scan, extract, User, Series, Article } from "./lib.ts";

async function insertUser(record: Partial<User>) {
  const { data, error } = await db.from("users").upsert(record);

  if (error) {
    console.error(error);
    throw error;
  }

  return data;
}
async function insertSeries(record: Partial<Series>) {
  const { data, error } = await db.from("series").upsert(record);

  if (error) {
    console.error(error);
    throw error;
  }

  return data;
}
async function insertArticle(record: Partial<Article>) {
  const { data, error } = await db.from("articles").upsert(record);

  if (error) {
    console.error(error);
    throw error;
  }

  return data;
}

/** target website href for scraping */
const href = "https://ithelp.ithome.com.tw/articles?tab=ironman";

interface Args {
  /** authentication for database access */
  auth: string;
}
async function main({ auth }: Args) {
  db.auth.setAuth(auth);

  // start from href and get back document per page
  for await (const document of scan(href)) {
    // extract information from document
    extract(document, {
      user: insertUser,
      series: insertSeries,
      article: insertArticle,
    });
  }
}

export default main;
