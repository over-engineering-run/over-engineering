import Section from "~/components/Section";
import Search from "~/components/Search";
import clsx from "clsx";

const Index = () => (
  <>
    <img
      className="fixed inset-0 opacity-60"
      src="https://resources.github.com/assets/images/dark-pixel-grid.svg"
      alt="background image"
      role="presentation"
    />

    <Section className="mx-auto grid h-screen max-w-screen-md content-center md:max-w-screen-lg md:place-content-center">
      <h1
        className={clsx(
          "text-gradient font-semibold",
          "text-5xl",
          "-mt-32 mb-16 flex flex-col justify-center gap-2",
          "md:hidden"
        )}
      >
        <span>Searching</span>
        <span>Made</span>
        <span>For</span>
        <span>Developers</span>
      </h1>

      <h1
        className={clsx(
          "text-gradient font-semibold",
          "text-7xl",
          "hidden md:grid",
          "my-16 place-content-center gap-4"
          //
        )}
      >
        <div className="flex justify-center gap-4">
          <span>Searching</span>
          <span>Made</span>
        </div>

        <div className="flex justify-center gap-4">
          <span>For</span>
          <span>Developers</span>
        </div>
      </h1>

      <div>
        <p className="pb-4 font-semibold md:text-xl">
          Here, Let me search that for you
        </p>

        <Search />
      </div>
    </Section>
  </>
);

export default Index;
