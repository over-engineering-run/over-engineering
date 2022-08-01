import type { ReactNode, CSSProperties } from "react";

export type CommonProps = Partial<{
  className: string;
  children: ReactNode;
  style: CSSProperties;
}>;
