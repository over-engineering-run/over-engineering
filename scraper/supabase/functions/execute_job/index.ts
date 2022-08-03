import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
import corsHeaders from "../_shared/cors.ts";
import scrape_itman_articles from "./scrape_itman_articles.ts";

function json<Data = unknown>(data: Data, config: ResponseInit) {
  return new Response(JSON.stringify(data), {
    ...config,
    headers: { ...config.headers, "Content-Type": "application/json" },
  });
}

function bad_request<Data = unknown>(
  data: Data,
  init?: Omit<ResponseInit, "status">
) {
  return json<Data>(data, { ...init, status: 400 });
}

function unauthorized<Data = unknown>(
  data: Data,
  init?: Omit<ResponseInit, "status">
) {
  return json<Data>(data, { ...init, status: 401 });
}

function ok<Data = unknown>(data: Data, init?: Omit<ResponseInit, "status">) {
  return json<Data>(data, { ...init, status: 200 });
}

console.log(`Function ${execute_job.name} up and running!`);

async function execute_job(req: Request) {
  const response_init = {
    headers: corsHeaders,
  };

  if (req.method === "OPTIONS") {
    return new Response("ok", response_init);
  }

  const auth = req.headers.get("Authorization");
  if (!auth) {
    return unauthorized({ error: "Unauthorized" }, response_init);
  }

  const { job } = await req.json();

  if (job === "scrape_itman_articles") {
    scrape_itman_articles({ auth: auth.replace("Bearer ", "") });

    return ok(undefined, response_init);
  }

  return bad_request({ error: `job ${job} not found` }, response_init);
}

serve(execute_job);
