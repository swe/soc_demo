"use client";

import { cn } from "@/lib/utils";

/**
 * Canonical module page chrome (layers 2–3 under the app header).
 * - Optional toolbar (search left, filters/actions right) — layer 2, pinned
 * - Scroll body on the grouped canvas with StatsStrip + cards — layer 3
 * The mobile tab bar sits in flow below this, so no bottom inset is needed.
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
        "bg-canvas flex min-h-0 flex-1 flex-col overflow-hidden",
        className,
      )}
    >
      {toolbar ? (
        <div className="bg-background border-separator shrink-0 border-b">
          <div className="px-gutter flex flex-col gap-2 py-2.5 lg:min-h-14 lg:flex-row lg:items-center lg:justify-between lg:gap-4 lg:py-2">
            {toolbar}
          </div>
        </div>
      ) : null}
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain">
        <div className="px-gutter mx-auto flex w-full max-w-[1600px] flex-col gap-4 pt-4 pb-6 sm:pt-5 md:gap-5 xl:pb-8">
          {children}
        </div>
      </div>
    </main>
  );
}

/** Left slot of the toolbar — typically the search InputGroup. */
export function ModuleToolbarSearch({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("min-w-0 flex-1 lg:min-w-64 lg:max-w-md", className)}>
      {children}
    </div>
  );
}

/** Right slot of the toolbar — filters and actions. Wraps rather than overflows. */
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
