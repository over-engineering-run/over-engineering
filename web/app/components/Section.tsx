import clsx from "clsx";
import { isValidElement, Children } from "react";
import type { ReactNode, ReactElement } from "react";
import type { CommonProps } from "~/types";

type Level = 1 | 2 | 3 | 4 | 5 | 6;
const isHeading = (child: ReactNode): child is ReactElement<any, `h${Level}`> =>
  isValidElement(child) &&
  typeof child.type === "string" &&
  /^h/.test(child.type);

type SectionProps = CommonProps & {
  id?: string;
};

function Section(props: SectionProps) {
  const children = Children.map(props.children, (child) => {
    if (isHeading(child)) {
      return child;
    }

    return child;
  });

  return (
    <section
      className={clsx("relative flex flex-col px-4 lg:p-8", props.className)}
      id={props.id}
    >
      {children}
    </section>
  );
}
export default Section;
