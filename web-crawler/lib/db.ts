import { DB } from "https://deno.land/x/sqlite@v3.4.0/mod.ts";

const db = new DB("test.db");

const query = (db: DB) => (input: string) => db.query(input);

const decode = (() => {
  const decoder = new TextDecoder("utf-8");

  return (buffer: Uint8Array) => decoder.decode(buffer);
})();

// init table
const tables = ["articles", "users"];
await Promise.all(
  tables.map((table) =>
    Deno.readFile(Deno.cwd() + `/db/${table}.sql`)
      .then(decode)
      .then(query(db))
  )
);

export default db;
