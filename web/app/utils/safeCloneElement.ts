import { isValidElement, cloneElement } from "react";
import type { Attributes, ReactNode } from "react";

export const safeCloneElement = <P>(
  element: ReactNode,
  props?: Partial<P> & Attributes,
  children?: ReactNode[]
) => (isValidElement(element) ? cloneElement(element, props, children) : null);

export default safeCloneElement;
