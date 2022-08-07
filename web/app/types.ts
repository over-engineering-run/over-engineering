import type { ReactNode, CSSProperties } from "react";

export type CommonProps = Partial<{
  className: string;
  children: ReactNode;
  style: CSSProperties;
}>;

export type RenderProps<Props> = Omit<CommonProps, "children"> & {
  children: (props: Props, index: number) => ReactNode;
};
