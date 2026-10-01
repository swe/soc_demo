"use client";

import { cn } from "@/lib/utils";

export type RankedItem = {
  key: string;
  label: string;
  value: number;
  /** Secondary text under or beside the label. */
  meta?: string;
  color?: string;
};

/** Ranked rows with inline proportional bars — for workloads and top-N lists. */
export function RankedBarList({
  items,
  onSelect,
  emptyLabel = "Nothing to show",
  formatValue = (value) => value.toLocaleString("en-US"),
  max,
}: {
  items: readonly RankedItem[];
  onSelect?: (key: string) => void;
  emptyLabel?: string;
  formatValue?: (value: number) => string;
  /** Scale bars against this value instead of the largest item. */
  max?: number;
}) {
  if (items.length === 0) {
    return <p className="text-muted-foreground py-8 text-center text-sm">{emptyLabel}</p>;
  }

  const scale = max ?? Math.max(...items.map((item) => item.value), 1);

  return (
    <ul className="-mx-2 flex flex-col">
      {items.map((item) => {
        const width = Math.max(4, Math.round((item.value / scale) * 100));
        const content = (
          <>
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="min-w-0 truncate font-medium">
                {item.label}
                {item.meta ? (
                  <span className="text-muted-foreground ml-1.5 font-normal">{item.meta}</span>
                ) : null}
              </span>
              <span className="text-muted-foreground shrink-0 tabular-nums">
                {formatValue(item.value)}
              </span>
            </div>
            <div className="bg-muted mt-1.5 h-1.5 overflow-hidden rounded-full">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${width}%`,
                  backgroundColor: item.color ?? "var(--primary)",
                }}
              />
            </div>
          </>
        );
        const rowClass = "block w-full rounded-md px-2 py-2 text-left";

        return (
          <li key={item.key}>
            {onSelect ? (
              <button
                type="button"
                onClick={() => onSelect(item.key)}
                className={cn(rowClass, "pressable hover:bg-accent/60")}
              >
                {content}
              </button>
            ) : (
              <div className={rowClass}>{content}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
