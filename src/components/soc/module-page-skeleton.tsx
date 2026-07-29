import { Skeleton } from "@/components/ui/skeleton";

/** Lightweight loading chrome for admin module Suspense boundaries. */
export function ModulePageSkeleton() {
  return (
    <div
      className="bg-background flex min-h-0 flex-1 flex-col gap-4 p-4 sm:p-6"
      aria-busy="true"
      aria-label="Loading"
    >
      <div className="flex flex-wrap items-center gap-2">
        <Skeleton className="h-9 w-64 max-w-full" />
        <Skeleton className="h-9 w-28" />
        <Skeleton className="ml-auto h-9 w-24" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
      </div>
      <Skeleton className="min-h-64 flex-1" />
    </div>
  );
}
