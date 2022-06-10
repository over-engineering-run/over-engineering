import { Fn } from "./types.ts";

export default {
  map:
    <A, B>(fn: Fn<A, B>) =>
    (list: A[]) =>
      list.map(fn),

  head: <A>(list: A[]) => list[0],
};
