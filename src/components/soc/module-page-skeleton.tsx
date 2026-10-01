import { Skeleton } from "@/components/ui/skeleton";

/** Lightweight loading chrome for admin module Suspense boundaries. */
export function ModulePageSkeleton() {
  return (
    <div
      className="bg-canvas flex min-h-0 flex-1 flex-col"
      aria-busy="true"
      aria-label="Loading"
    >
      <div className="bg-background border-separator px-gutter flex flex-wrap items-center gap-2 border-b py-2.5 lg:min-h-14">
        <Skeleton className="h-9 w-64 max-w-full" />
        <Skeleton className="h-9 w-28" />
        <Skeleton className="ml-auto h-9 w-24" />
      </div>
      <div className="px-gutter flex min-h-0 flex-1 flex-col gap-4 py-5">
        <div className="grid grid-cols-2 gap-3 md:gap-4 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <div
              key={index}
              className="bg-card shadow-card space-y-3 rounded-xl border p-4"
            >
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="h-7 w-16" />
            </div>
          ))}
        </div>
        <div className="bg-card shadow-card min-h-64 flex-1 rounded-xl border p-4">
          <Skeleton className="h-full min-h-56" />
        </div>
      </div>
    </div>
  );
}
