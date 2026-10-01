"use client";

import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

import { chartMargin, formatCompact, xAxisProps, yAxisProps } from "./chart-palette";

/**
 * One bar per category. Vertical bars suit short labels; `horizontal` suits
 * long ones and narrow cards. Bars are clickable when `onSelect` is set.
 */
export function CategoryBarChart<T extends Record<string, unknown>>({
  data,
  categoryKey,
  valueKey = "count",
  label,
  color = "var(--primary)",
  colorFor,
  orientation = "vertical",
  categoryWidth = 96,
  onSelect,
}: {
  data: readonly T[];
  categoryKey: keyof T & string;
  valueKey?: keyof T & string;
  /** Tooltip label for the value. */
  label: string;
  color?: string;
  colorFor?: (row: T) => string;
  orientation?: "vertical" | "horizontal";
  /** Label column width for horizontal bars. */
  categoryWidth?: number;
  onSelect?: (row: T) => void;
}) {
  const horizontal = orientation === "horizontal";
  const rows: Record<string, unknown>[] = [...data];
  const category: string = categoryKey;
  const value: string = valueKey;

  return (
    <ChartContainer
      config={{ [value]: { label, color } }}
      className="aspect-auto h-full w-full"
    >
      <BarChart
        accessibilityLayer
        data={rows}
        layout={horizontal ? "vertical" : "horizontal"}
        margin={horizontal ? { ...chartMargin, left: 4, right: 16 } : chartMargin}
      >
        <CartesianGrid vertical={horizontal} horizontal={!horizontal} />
        {horizontal ? (
          <>
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey={category}
              {...yAxisProps}
              tickFormatter={undefined}
              width={categoryWidth}
              interval={0}
            />
          </>
        ) : (
          <>
            <XAxis dataKey={category} {...xAxisProps} minTickGap={4} />
            <YAxis {...yAxisProps} tickFormatter={formatCompact} />
          </>
        )}
        <ChartTooltip
          cursor={{ fill: "var(--muted)", opacity: 0.6 }}
          content={<ChartTooltipContent />}
        />
        <Bar
          dataKey={value}
          fill={`var(--color-${value})`}
          radius={horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0]}
          maxBarSize={horizontal ? 22 : 40}
          isAnimationActive={false}
          cursor={onSelect ? "pointer" : undefined}
        >
          {data.map((row, index) => (
            <Cell
              key={String(row[categoryKey] ?? index)}
              {...(colorFor ? { fill: colorFor(row) } : {})}
              onClick={onSelect ? () => onSelect(row) : undefined}
            />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}
