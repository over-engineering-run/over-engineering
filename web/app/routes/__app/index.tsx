import Section from "~/components/Section";
import Search from "~/components/Search";

const SearchForm = () => {
  return (
    <form>
      <label>
        <p className="pb-4">Here, Let me search that for you</p>

        <Search />
      </label>

      <div className="mt-4 flex">
        <button className="button-underline arrow ml-auto" type="submit">
          run search
        </button>
      </div>
    </form>
  );
};

const Index = () => (
  <Section>
    <h1 className="my-16 flex flex-col gap-2 text-5xl font-semibold">
      <span className="first-letter:text-red">Searching</span>
      <span className="first-letter:text-orange">Only</span>
      <span className="first-letter:text-sky">For</span>
      <span className="first-letter:text-blue">Developers</span>
    </h1>

    <SearchForm />
  </Section>
);

export default Index;
