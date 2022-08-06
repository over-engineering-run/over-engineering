import Section from "~/components/Section";
import Search from "~/components/Search";
import clsx from "clsx";

const Index = () => (
  <Section className="mx-auto grid h-[70vh] max-w-screen-md lg:max-w-screen-lg lg:place-content-center">
    <h1
      className={clsx(
        "my-16 flex flex-col justify-center gap-2 text-5xl font-semibold",
        "lg:hidden"
      )}
    >
      <span>Searching</span>
      <span>Made</span>
      <span>For</span>
      <span>Developers</span>
    </h1>

    <h1
      className={clsx(
        "hidden lg:flex",
        "my-16 flex-col justify-center gap-4 text-6xl"
        //
      )}
    >
      <div className="flex gap-4">
        <span>Searching</span>
        <span>Made</span>
      </div>

      <div className="flex gap-4">
        <span>For</span>
        <span>Developers</span>
      </div>
    </h1>

    <div>
      <p className="pb-4">Here, Let me search that for you</p>

      <Search />
    </div>
  </Section>
);

export default Index;
