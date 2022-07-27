type SearchParams =
  | string[][]
  | Record<string, string>
  | string
  | URLSearchParams;

export function qs(params: SearchParams): URLSearchParams {
  return new URLSearchParams(params);
}

type URLPatternParam = Omit<URLPatternInit, "search"> & {
  search?: SearchParams;
};
export function of(input: string | URLPatternParam): URL {
  if (typeof input === "string") {
    return new URL(input);
  }

  if (typeof input.pathname !== "string") {
    throw new Error("pathname is required");
  }
  if (typeof input.hostname !== "string") {
    throw new Error("hostname is required");
  }

  const url = new URL(input.pathname, input.hostname);

  if (typeof input.search === "string") {
    url.search = qs(input.search).toString();
  }

  return url;
}

export default of;
