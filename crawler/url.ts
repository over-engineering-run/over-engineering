type SearchParamValue = number | string | string[] | boolean | null | undefined;
type URLProps = {
  pathname: string;
  origin?: string;
  search?: Record<string, SearchParamValue>;
  hash?: string;
};

type Props = string | URLProps;

// ===========================================================

const is = {
  string: (value: unknown): value is string => typeof value === "string",
  number: (value: unknown): value is number => typeof value === "number",
  boolean: (value: unknown): value is boolean => typeof value === "boolean",
  array: Array.isArray,
};

export default function url(props: Props): URL {
  if (is.string(props)) {
    return new URL(props);
  }

  const { pathname, origin, search, hash } = props;
  const it = new URL(pathname, origin);

  if (search) {
    for (const [key, value] of Object.entries(search)) {
      if (is.array(value)) {
        value.forEach((value) => it.searchParams.append(key, value));
      }
      if (is.string(value) || is.number(value) || is.boolean(value)) {
        it.searchParams.set(key, String(value));
      }
    }
  }

  if (hash) {
    it.hash = hash;
  }

  return it;
}

export const url_string = (props: Props) => url(props).toString();
