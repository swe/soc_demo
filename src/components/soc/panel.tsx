"use client";

import { cn } from "@/lib/utils";

export function Panel({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={cn("bg-card rounded-lg border p-4", className)}>
      {children}
    </section>
  );
}

export function PanelHeading({
  title,
  description,
  action,
}: {
  title: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0">
        <h2 className="text-sm font-semibold">{title}</h2>
        {description ? (
          <div className="text-muted-foreground mt-1 text-xs">{description}</div>
        ) : null}
      </div>
      {action}
    </div>
  );
}

/** Two-up overview row: primary chart + secondary panel. */
export function OverviewSplit({
  primary,
  secondary,
  wide = "primary",
  className,
}: {
  primary: React.ReactNode;
  secondary: React.ReactNode;
  /** Which child takes ~2/3 width at xl. */
  wide?: "primary" | "secondary";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid items-start gap-4",
        wide === "primary"
          ? "xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]"
          : "xl:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]",
        className,
      )}
    >
      <div className="min-w-0 self-start">{primary}</div>
      <div className="min-w-0 self-start">{secondary}</div>
    </div>
  );
}

/** Equal panel grid that sizes columns to the number of children (1–4). */
export function PanelGrid({
  children,
  columns,
  className,
}: {
  children: React.ReactNode;
  /** Override auto count when children are not a simple array. */
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}) {
  const colClass =
    columns === 1
      ? "sm:grid-cols-1 xl:grid-cols-1"
      : columns === 2
        ? "sm:grid-cols-2 xl:grid-cols-2"
        : columns === 3
          ? "sm:grid-cols-2 xl:grid-cols-3"
          : columns === 4
            ? "sm:grid-cols-2 xl:grid-cols-4"
            : undefined;

  return (
    <div
      className={cn(
        "grid items-start gap-4",
        colClass ?? "sm:grid-cols-2 xl:grid-cols-3",
        className,
      )}
    >
      {children}
    </div>
  );
}
