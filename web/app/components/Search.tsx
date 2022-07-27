import { Combobox, ComboboxInput } from "@reach/combobox";
import Icon from "./Icon";

const Search = () => {
  return (
    <Combobox>
      <div className="flex items-center gap-1 rounded-xl bg-gray/60 p-2 text-gray-light/60">
        <Icon.Search className="h-6 w-6" />
        <ComboboxInput
          type="search"
          name="search"
          className="bg-transparent placeholder:text-current focus:text-white"
          placeholder="Search"
        />
        <button type="reset" aria-label="clear">
          <Icon.Close className="h-6 w-6" />
        </button>
      </div>
    </Combobox>
  );
};

export default Search;
