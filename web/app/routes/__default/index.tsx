import Section from "~/components/Section";
import Search from "~/components/Search";
import clsx from "clsx";
import { Form } from "@remix-run/react";

const Index = () => (
  <Section className="mx-auto grid h-[80vh] max-w-screen-lg place-content-center">
    <h1
      className={clsx(
        "my-16 flex flex-col gap-2 text-5xl font-semibold",
        "lg:hidden"
      )}
    >
      <span className="first-letter:text-red">Searching</span>
      <span className="first-letter:text-orange">Made</span>
      <span className="first-letter:text-sky">For</span>
      <span className="first-letter:text-blue">Developers</span>
    </h1>

    <h1
      className={clsx(
        "my-16 flex flex-col justify-center gap-4 text-6xl"
        //
      )}
    >
      <div className="flex gap-4">
        <span className="first-letter:text-red">Searching</span>
        <span className="first-letter:text-orange">Made</span>
      </div>

      <div className="flex gap-4">
        <span className="first-letter:text-sky">For</span>
        <span className="first-letter:text-blue">Developers</span>
      </div>
    </h1>

    <div>
      <p className="pb-4">Here, Let me search that for you</p>

      <Search />
    </div>
  </Section>
);

export default Index;
