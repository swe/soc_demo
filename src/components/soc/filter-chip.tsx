"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export const filterChipClassName =
  "pressable border-input bg-card text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-ring/35 aria-pressed:border-primary/30 aria-pressed:bg-primary/10 aria-pressed:text-primary inline-flex h-7 shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-2.5 text-xs font-medium whitespace-nowrap outline-none transition-colors focus-visible:ring-[3px] pointer-coarse:h-9 pointer-coarse:px-3 [&_svg]:size-3.5 [&_svg]:shrink-0";

/** Toggleable quick-filter / template chip. */
export function FilterChip({
  pressed,
  className,
  ...props
}: React.ComponentPropsWithoutRef<"button"> & { pressed?: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      className={cn(filterChipClassName, className)}
      {...props}
    />
  );
}
