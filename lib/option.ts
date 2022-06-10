import type { Fn } from "./types.ts";

export interface Option<A> {
  isNone(): boolean;
  map<B>(fn: Fn<A, B>): Option<NonNullable<B>>;
  unwrap(): A;
}

export const Some = <A>(value: A): Option<A> => ({
  isNone: () => false,
  map: <B>(fn: Fn<A, B>) => Option.of(fn(value)),
  unwrap: () => value,
});

export const None = <A>(value: A): Option<A> => ({
  isNone: () => true,
  map: <B>(_fn: Fn<A, B>) => Option.of(value as unknown as B),
  unwrap: () => value,
});

export const Option = {
  isNone: <A>(value: A) => value === undefined || value === null,

  of: <A>(value: A) =>
    (Option.isNone(value) ? None(value) : Some(value)) as Option<
      NonNullable<A>
    >,

  match:
    <A, B>(handle: { none: Fn<A, void>; some: Fn<A, B> }) =>
    (option: Option<A>): B =>
      (option.isNone()
        ? handle.none(option.unwrap())
        : handle.some(option.unwrap())) as B,
};

export default Option;
