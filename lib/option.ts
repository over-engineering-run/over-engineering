import type { Fn } from "./types.ts";

export interface OptionHandler<A, B, C> {
  some: Fn<A, B>;
  none: Fn<A, C>;
}
export interface Option<A> {
  isNone(): boolean;
  map<B>(fn: Fn<A, B>): Option<NonNullable<B>>;
  unwrap(): A | undefined | null;
  match<B, C>(handler: OptionHandler<A, B, C>): B | C;
}

export const always =
  <A>(x: A) =>
  () =>
    x;
export const isNone = <A>(value: A) => value === undefined || value === null;

export const Option = <A>(value: A): Option<A> => ({
  map: <B>(fn: Fn<A, B>) =>
    (isNone(value) ? Option(value) : Option(fn(value))) as unknown as Option<
      NonNullable<B>
    >,

  match: <B, C>(handler: OptionHandler<A, B, C>) =>
    isNone(value) ? handler.none(value) : handler.some(value),

  isNone: always(isNone(value)),
  unwrap: always(value),
});

Option.isNone = isNone;
Option.of = <A>(x: A) => Option(x as NonNullable<A>);
Option.match =
  <A, B, C>(handler: OptionHandler<A, B, C>) =>
  (option: Option<A>) =>
    option.match(handler);

export default Option;
