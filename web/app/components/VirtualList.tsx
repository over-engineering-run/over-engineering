import {
  cloneElement,
  ComponentPropsWithoutRef,
  isValidElement,
  ReactNode,
  useRef,
} from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import clsx from "clsx";
import { useDebounce } from "react-use";
import safeCloneElement from "~/utils/safeCloneElement";

type Props = Omit<ComponentPropsWithoutRef<"div">, "children"> & {
  count: number;
  size: number;
  children: (index: number) => ReactNode;
  loading?: ReactNode;
  loadingSize?: number;
  onReachEnd?: () => void;
  hasNext?: boolean;
};
function VirtualList({
  children,
  count,
  size,
  className,
  onReachEnd,
  loading,
  loadingSize,
  hasNext,
  ...props
}: Props) {
  const parentRef = useRef<HTMLDivElement>(null);
  const rowVirtualizer = useVirtualizer({
    count: loading && hasNext ? count + 1 : count,
    getScrollElement: () => parentRef.current,
    estimateSize: (index: number) => {
      const isLoading = loadingSize && index >= count - 1;
      return isLoading ? loadingSize : size;
    },
  });

  const items = rowVirtualizer.getVirtualItems();

  useDebounce(
    () => {
      const lastItem = items[items.length - 1];
      if (!lastItem) {
        return;
      }

      if (count - 1 <= lastItem.index) {
        return onReachEnd?.();
      }
    },
    60,
    [items, onReachEnd]
  );

  return (
    <div
      ref={parentRef}
      className={clsx(className, "overflow-auto")}
      {...props}
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          position: "relative",
        }}
      >
        {items.map((virtualRow: any) => {
          const isLoading = loading && virtualRow.index >= count - 1;

          if (isLoading && isValidElement(loading)) {
            return cloneElement(loading, {
              key: virtualRow.key,
              style: {
                position: "absolute",
                top: 0,
                left: 0,
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              },
            });
          }

          return safeCloneElement(children(virtualRow.index), {
            key: virtualRow.key,
            style: {
              position: "absolute",
              top: 0,
              left: 0,
              height: `${virtualRow.size}px`,
              transform: `translateY(${virtualRow.start}px)`,
            },
          });
        })}
      </div>
    </div>
  );
}

export default VirtualList;
