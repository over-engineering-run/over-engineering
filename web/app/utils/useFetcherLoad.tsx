import { useFetcher } from "@remix-run/react";
import { useEffect } from "react";

function useFetcherLoad(href: string) {
  const fetcher = useFetcher();

  <fetcher.Form />;

  useEffect(() => void fetcher.load(href), [href]);

  return fetcher.data;
}

export default useFetcherLoad;
