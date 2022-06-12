import * as R from "https://x.nest.land/rambda@7.1.4/mod.ts";
import { Fn } from "./types.ts";

export interface TaskHandler<A, B, C> {
  ok: (v: A) => B;
  err: (err: Error) => C;
}

export const Task = <A>(taskFn: () => A | Promise<A>) => ({
  map: <B>(fn: Fn<A, B | Promise<B>>) =>
    Task(
      () =>
        Promise.resolve(taskFn())
          .then(fn)
          .then(
            R.when(
              R.is(Error),
              Promise.reject.bind(Promise)
              //
            )
          ) as Promise<Exclude<B, Error>>
    ),

  fork: <B, C>(handler: TaskHandler<A, B, C>): Promise<B | C> =>
    Promise.resolve(taskFn())
      //
      .then(handler.ok)
      .catch(handler.err),
});

Task.of = <A>(x?: A) => Task(() => x);

export default Task;
