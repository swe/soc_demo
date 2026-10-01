"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";

export function Panel({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      data-slot="panel"
      className={cn(
        "bg-card text-card-foreground shadow-card min-w-0 rounded-xl border p-4 sm:p-5",
        className,
      )}
    >
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
    <div className="mb-4 flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
      <div className="min-w-0">
        <h2 className="text-headline">{title}</h2>
        {description ? (
          <div className="text-muted-foreground mt-0.5 text-callout">
            {description}
          </div>
        ) : null}
      </div>
      {action ? <div className="flex min-w-0 flex-wrap items-center gap-2">{action}</div> : null}
    </div>
  );
}

const panelLinkClassName =
  "text-primary text-callout inline-flex items-center gap-0.5 rounded-sm font-medium hover:underline underline-offset-4 pointer-coarse:min-h-11";

/** "View all"-style action in a panel heading: a link, or a button when `onClick` is set. */
export function PanelLink({
  href,
  onClick,
  children,
}: {
  href?: string;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  const content = (
    <>
      {children}
      <ChevronRight className="size-3.5" aria-hidden />
    </>
  );
  if (href) {
    return (
      <Link href={href} className={panelLinkClassName}>
        {content}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className={panelLinkClassName}>
      {content}
    </button>
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
        "grid grid-cols-1 gap-4",
        wide === "primary"
          ? "xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]"
          : "xl:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]",
        className,
      )}
    >
      <div className="min-w-0 [&>*]:h-full">{primary}</div>
      <div className="min-w-0 [&>*]:h-full">{secondary}</div>
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
        ? "md:grid-cols-2 xl:grid-cols-2"
        : columns === 3
          ? "md:grid-cols-2 xl:grid-cols-3"
          : columns === 4
            ? "md:grid-cols-2 xl:grid-cols-4"
            : undefined;

  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-4",
        colClass ?? "md:grid-cols-2 xl:grid-cols-3",
        className,
      )}
    >
      {children}
    </div>
  );
}
