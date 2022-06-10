interface Url {
  hostname?: string;
  pathname: string;
  query: Record<string, number | string>;
}

const Url = {
  of: ({ pathname, hostname, query }: Url) => {
    const url = new URL(pathname, hostname);

    for (const [key, value] of Object.entries(query)) {
      url.searchParams.append(key, value.toString());
    }

    return url;
  },
};

export default {
  /**
   * print argument, and by pass argument
   * for traceing value
   */
  trace: <T>(arg: T) => (console.log(arg), arg),

  /**
   * print message out, and by pass argument
   * for taging process
   */
  tag:
    (msg: string) =>
    <T>(arg: T) => (console.log(msg), arg),

  /**
   * pring message and arg and then by pass argument
   * for tracing value with custom message
   */
  log:
    (msg: string) =>
    <T>(arg: T) => (console.log(msg, arg), arg),

  /**
   * thunkify native fetch function
   */
  fetch: (url: string | Url) => () => {
    if (typeof url === "string") return fetch(url);

    return fetch(Url.of(url).toString());
  },

  /**
   * response invoker for text method
   */
  text: (res: Response) => res.text(),
};
