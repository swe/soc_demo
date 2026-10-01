import type { ChartConfig } from "@/components/ui/chart";

export type SeverityKey = "critical" | "high" | "medium" | "low";

/** Severity fills; each var swaps its light/dark value in globals.css. */
export const severityColor: Record<SeverityKey | "info", string> = {
  critical: "var(--severity-critical)",
  high: "var(--severity-high)",
  medium: "var(--severity-medium)",
  low: "var(--severity-low)",
  info: "var(--severity-info)",
};

export const severityChartConfig = {
  critical: { label: "Critical", color: severityColor.critical },
  high: { label: "High", color: severityColor.high },
  medium: { label: "Medium", color: severityColor.medium },
  low: { label: "Low", color: severityColor.low },
} satisfies ChartConfig;

/** Incident priorities share the severity ramp (P1 = critical … P4 = low). */
export const priorityColor = {
  P1: severityColor.critical,
  P2: severityColor.high,
  P3: severityColor.medium,
  P4: severityColor.low,
} as const;

export const priorityChartConfig = {
  p1: { label: "P1", color: priorityColor.P1 },
  p2: { label: "P2", color: priorityColor.P2 },
  p3: { label: "P3", color: priorityColor.P3 },
  p4: { label: "P4", color: priorityColor.P4 },
} satisfies ChartConfig;

export const statusColor = {
  success: "var(--success)",
  warning: "var(--warning)",
  info: "var(--info)",
  destructive: "var(--destructive)",
  neutral: "var(--muted-foreground)",
  track: "var(--muted)",
} as const;

export const compactNumber = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

export const formatCompact = (value: unknown) => compactNumber.format(Number(value));

/** Axis defaults: no rules, 12px ticks (the type floor), labels thinned by gap. */
export const xAxisProps = {
  axisLine: false,
  tickLine: false,
  tickMargin: 8,
  minTickGap: 16,
  tick: { fontSize: 12 },
} as const;

export const yAxisProps = {
  axisLine: false,
  tickLine: false,
  tickMargin: 4,
  width: 40,
  allowDecimals: false,
  tick: { fontSize: 12 },
  tickFormatter: formatCompact,
} as const;

export const gridProps = { vertical: false } as const;

export const chartMargin = { top: 8, right: 8, left: 0, bottom: 0 } as const;
