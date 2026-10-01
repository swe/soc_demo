"use client";

import { Cell, Pie, PieChart } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { cn } from "@/lib/utils";

import { formatCompact } from "./chart-palette";

export type BreakdownItem = {
  key: string;
  label: string;
  value: number;
  color: string;
};

/**
 * Donut with the total in the centre and a legend that doubles as the
 * accessible, tappable control for each slice.
 */
export function DonutBreakdown({
  items,
  totalLabel,
  onSelect,
  className,
}: {
  items: readonly BreakdownItem[];
  totalLabel: string;
  onSelect?: (key: string) => void;
  className?: string;
}) {
  const total = items.reduce((sum, item) => sum + item.value, 0);
  const config = Object.fromEntries(
    items.map((item) => [item.key, { label: item.label, color: item.color }]),
  );

  return (
    <div className={cn("flex h-full items-center gap-4 sm:gap-6", className)}>
      <div className="relative aspect-square w-[min(12rem,40%)] shrink-0">
        <ChartContainer config={config} className="aspect-square h-full w-full">
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent hideLabel nameKey="key" />} />
            <Pie
              data={[...items]}
              dataKey="value"
              nameKey="key"
              innerRadius="64%"
              outerRadius="92%"
              paddingAngle={items.length > 1 ? 2 : 0}
              cornerRadius={3}
              strokeWidth={0}
              isAnimationActive={false}
            >
              {items.map((item) => (
                <Cell
                  key={item.key}
                  fill={item.color}
                  className={cn("outline-none", onSelect && "cursor-pointer")}
                  onClick={onSelect ? () => onSelect(item.key) : undefined}
                />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-title-2 tabular-nums">{formatCompact(total)}</span>
          <span className="text-muted-foreground text-xs">{totalLabel}</span>
        </div>
      </div>

      <ul className="flex min-w-0 flex-1 flex-col gap-0.5">
        {items.map((item) => {
          const percent = total > 0 ? Math.round((item.value / total) * 100) : 0;
          const content = (
            <>
              <span
                aria-hidden
                className="size-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="min-w-0 flex-1 truncate">{item.label}</span>
              <span className="tabular-nums">{formatCompact(item.value)}</span>
              <span className="text-muted-foreground w-9 text-right tabular-nums">
                {percent}%
              </span>
            </>
          );
          const rowClass =
            "flex min-h-8 w-full items-center gap-2 rounded-md px-2 text-left text-sm pointer-coarse:min-h-11";

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
    </div>
  );
}
