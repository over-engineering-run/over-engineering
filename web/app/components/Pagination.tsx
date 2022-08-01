import { createContext, forwardRef, useContext, useId } from "react";
import type { AriaAttributes, ComponentPropsWithRef } from "react";
import type { ForwardRefComponent } from "@reach/utils";

const PaginationContext = createContext<[] | undefined>(undefined);

type PaginationProps = ComponentPropsWithRef<"ul">;
function Pagination({ children, ...props }: PaginationProps) {
  const id = useId();

  return (
    <PaginationContext.Provider value={[]}>
      <ul aria-label={`Pagination ${id}`} {...props} role="navigation">
        {children}
      </ul>
    </PaginationContext.Provider>
  );
}

type ItemProps = {
  current?: boolean;
  page?: number;
  prev?: boolean;
  next?: boolean;
};
const Item = forwardRef(({ as: Comp = "a", current, ...props }, ref) => {
  const context = useContext(PaginationContext);

  if (!context) {
    throw new Error(`<Pagination.Item> should be rendered within <Pagination>`);
  }

  function getLabel() {
    if (props["aria-label"]) {
      return props["aria-label"];
    }

    if (props.page) {
      return `Page ${props.page}`;
    }

    if (props.prev) {
      return `Previous Page`;
    }

    if (props.next) {
      return `Next Page`;
    }

    return undefined;
  }

  const ariaLabel = getLabel();
  const ariaCurrent = current ? "page" : undefined;
  const aria: AriaAttributes = {
    "aria-label": ariaLabel,
    "aria-current": ariaCurrent,
  };

  return (
    <li>
      <Comp ref={ref} {...props} {...aria}>
        {props.children}
      </Comp>
    </li>
  );
}) as ForwardRefComponent<"a", ItemProps>;

Pagination.Item = Item;
export default Pagination;
