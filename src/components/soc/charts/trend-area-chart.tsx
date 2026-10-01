"use client";

import { useId } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

import {
  chartMargin,
  formatCompact,
  gridProps,
  xAxisProps,
  yAxisProps,
} from "./chart-palette";

type Series = {
  key: string;
  /** Dashed outline with no fill, e.g. a target line. */
  dashed?: boolean;
};

/**
 * Area chart over time. Series render in order, so list the stack from the
 * bottom up (e.g. low → critical) to keep the most severe band on top.
 */
export function TrendAreaChart<T extends Record<string, unknown>>({
  data,
  xKey,
  series,
  config,
  stacked = true,
  showTotal = stacked,
  xInterval = "preserveStartEnd",
  yDomain,
  yTickFormatter = formatCompact,
  legend = true,
}: {
  data: readonly T[];
  xKey: keyof T & string;
  series: readonly Series[];
  config: ChartConfig;
  stacked?: boolean;
  /** Adds the stack total under the tooltip label. */
  showTotal?: boolean;
  xInterval?: number | "preserveStartEnd";
  yDomain?: [number, number];
  yTickFormatter?: (value: unknown) => string;
  legend?: boolean;
}) {
  const gradientId = useId().replace(/:/g, "");
  const rows: Record<string, unknown>[] = [...data];

  return (
    <ChartContainer config={config} className="aspect-auto h-full w-full">
      <AreaChart accessibilityLayer data={rows} margin={chartMargin}>
        <defs>
          {series.map(({ key }) => (
            <linearGradient
              key={key}
              id={`${gradientId}-${key}`}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="0%" stopColor={`var(--color-${key})`} stopOpacity={0.4} />
              <stop offset="100%" stopColor={`var(--color-${key})`} stopOpacity={0.04} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid {...gridProps} />
        <XAxis dataKey={xKey as string} {...xAxisProps} interval={xInterval} />
        <YAxis {...yAxisProps} domain={yDomain} tickFormatter={yTickFormatter} />
        <ChartTooltip
          content={
            <ChartTooltipContent
              indicator="dot"
              labelFormatter={
                showTotal
                  ? (label, payload) => {
                      const point = payload?.[0]?.payload as T | undefined;
                      const total = point
                        ? series.reduce((sum, { key }) => sum + Number(point[key] ?? 0), 0)
                        : 0;
                      return (
                        <div className="flex flex-col gap-0.5">
                          <span>{label}</span>
                          <span className="text-muted-foreground font-normal">
                            Total {formatCompact(total)}
                          </span>
                        </div>
                      );
                    }
                  : undefined
              }
            />
          }
        />
        {legend ? <ChartLegend content={<ChartLegendContent />} /> : null}
        {series.map(({ key, dashed }) => (
          <Area
            key={key}
            type="monotone"
            dataKey={key}
            stackId={stacked ? "stack" : undefined}
            stroke={`var(--color-${key})`}
            strokeDasharray={dashed ? "4 4" : undefined}
            fill={dashed ? "transparent" : `url(#${gradientId}-${key})`}
            strokeWidth={dashed ? 1.5 : 2}
            dot={false}
            isAnimationActive={false}
          />
        ))}
      </AreaChart>
    </ChartContainer>
  );
}
