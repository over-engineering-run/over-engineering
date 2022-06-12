import {
  assertSpyCall,
  spy,
  stub,
  resolvesNext,
  assertSpyCalls,
} from "https://deno.land/std@0.143.0/testing/mock.ts";
import { describe, it } from "https://deno.land/std@0.143.0/testing/bdd.ts";

import extractPageOn from "../extract-page-on.ts";
import { assertEquals } from "https://deno.land/std@0.143.0/testing/asserts.ts";

const mockFetch = <T extends Response>(fn: (this: any) => Promise<T>) =>
  stub(globalThis, "fetch", fn);

const url = "https://ithelp.ithome.com.tw/articles/10281700";

const tests = describe("Test extractPageOn");

const when_fetch_rejected = describe(tests, "when fetch rejected");
it({
  suite: when_fetch_rejected,
  name: "print Extract Page: fetch on {url}",
  async fn() {
    const log_spy = spy(console, "log");
    const stub = mockFetch(() => Promise.reject());

    await extractPageOn(url);

    assertSpyCalls(stub, 1);
    assertSpyCall(log_spy, 0, {
      args: [`Extract Page: fetch on ${url}`],
    });
    assertSpyCalls(log_spy, 2);

    log_spy.restore();
    stub.restore();
  },
});
it({
  suite: when_fetch_rejected,
  name: "print Extract Page: failed on {url}",
  async fn() {
    const log_spy = spy(console, "log");
    const stub = mockFetch(() => Promise.reject());

    await extractPageOn(url);

    assertSpyCalls(stub, 1);
    assertSpyCall(log_spy, 1, {
      args: [`Extract Page: failed on ${url}`],
    });

    log_spy.restore();
    stub.restore();
  },
});

const when_fetch_success = describe(tests, "when fetch success");
it({
  suite: when_fetch_success,
  name: "response with empty string",
  async fn() {
    const log_spy = spy(console, "log");
    const stub = mockFetch(resolvesNext([new Response("")]));

    await extractPageOn(url);

    assertSpyCalls(stub, 1);
    assertSpyCall(log_spy, 1, {
      args: [`Extract Page: failed on ${url}`],
    });

    log_spy.restore();
    stub.restore();
  },
});
it({
  suite: when_fetch_success,
  name: "response with html",
  async fn() {
    const stub = mockFetch(resolvesNext([new Response(`<div></div>`)]));
    const result = await extractPageOn(url);

    assertEquals(result, {
      article: {
        tag: undefined,
        series: undefined,
        series_no: undefined,
        title: undefined,
        publish_at: undefined,
        content: undefined,
      },

      user: {
        name: undefined,
        href: undefined,
      },
    });

    stub.restore();
  },
});
