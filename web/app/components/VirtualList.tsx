import {
  cloneElement,
  ComponentPropsWithoutRef,
  isValidElement,
  ReactNode,
  useEffect,
  useRef,
} from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import clsx from "clsx";
import { useDebounce, useThrottle } from "react-use";

type Props = Omit<ComponentPropsWithoutRef<"div">, "children"> & {
  count: number;
  size: number;
  children: (index: number) => ReactNode;
  onReachEnd?: () => void;
};
function VirtualList({
  children,
  count,
  size,
  className,
  onReachEnd,
  ...props
}: Props) {
  const parentRef = useRef<HTMLDivElement>(null);
  const rowVirtualizer = useVirtualizer({
    count,
    getScrollElement: () => parentRef.current,
    estimateSize: () => size,
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
        {items.map((virtualRow) => {
          const element = children(virtualRow.index);
          return (
            isValidElement(element) &&
            cloneElement(element, {
              key: virtualRow.key,
              style: {
                position: "absolute",
                top: 0,
                left: 0,
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              },
            })
          );
        })}
      </div>
    </div>
  );
}

export default VirtualList;
