"use client";

import * as React from "react";

import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

/**
 * Module-level section tabs: an underline bar that scrolls horizontally on
 * narrow screens instead of wrapping. Pair with Radix `Tabs` as the root.
 */
export function ModuleTabsList({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof TabsList>) {
  return (
    <div className="border-separator no-scrollbar relative overflow-x-auto border-b">
      <TabsList
        className={cn(
          "h-auto min-w-max gap-6 overflow-visible rounded-none bg-transparent p-0 sm:gap-7",
          className,
        )}
        {...props}
      >
        {children}
      </TabsList>
    </div>
  );
}

export const moduleTabTriggerClassName =
  "group/tab text-muted-foreground hover:text-foreground data-[state=active]:text-foreground relative h-10 rounded-none bg-transparent px-0 shadow-none after:bg-foreground after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:rounded-full after:opacity-0 after:transition-opacity after:duration-150 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:opacity-100 dark:data-[state=active]:bg-transparent pointer-coarse:h-11";

export function ModuleTabsTrigger({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof TabsTrigger>) {
  return (
    <TabsTrigger
      className={cn(moduleTabTriggerClassName, className)}
      {...props}
    />
  );
}

/** Count chip for a tab label; tints with the active tab. */
export function TabCount({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "bg-muted text-muted-foreground group-data-[state=active]/tab:bg-foreground/10 group-data-[state=active]/tab:text-foreground inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-caption font-medium tabular-nums",
        className,
      )}
    >
      {children}
    </span>
  );
}
