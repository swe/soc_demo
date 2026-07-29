"use client";

import { cn } from "@/lib/utils";

/**
 * Canonical module page chrome (layers 2–3 under the app header).
 * - Optional sticky toolbar (search left, filters/actions right) — layer 2
 * - Scroll body with StatsStrip + content — layer 3 (tiles are never pinned)
 */
export function ModuleShell({
  toolbar,
  children,
  className,
}: {
  toolbar?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <main
      id="main-content"
      className={cn(
        "bg-background flex min-h-0 flex-1 flex-col overflow-hidden",
        className,
      )}
    >
      {toolbar ? (
        <div className="bg-background shrink-0 border-b">
          <div className="flex flex-col gap-2 px-4 py-3 sm:px-6 lg:min-h-14 lg:flex-row lg:items-center lg:justify-between lg:gap-4 lg:py-2">
            {toolbar}
          </div>
        </div>
      ) : null}
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 pb-6 sm:px-6">
        <div className="mx-auto flex w-full flex-col gap-4">{children}</div>
      </div>
    </main>
  );
}

/** Left slot of the sticky toolbar — typically the search InputGroup. */
export function ModuleToolbarSearch({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("min-w-0 flex-1", className)}>{children}</div>;
}

/** Right slot of the sticky toolbar — filters and actions. */
export function ModuleToolbarActions({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex min-w-0 flex-wrap items-center gap-2 lg:justify-end",
        className,
      )}
    >
      {children}
    </div>
  );
}
