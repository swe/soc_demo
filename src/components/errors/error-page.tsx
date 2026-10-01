import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export function ErrorPage({
  icon: Icon,
  code,
  title,
  description,
  actions,
  className,
}: {
  icon: LucideIcon;
  code?: string;
  title: string;
  description: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <main
      className={cn(
        "bg-canvas px-gutter flex min-h-svh w-full items-center justify-center py-12",
        className,
      )}
    >
      <div className="flex max-w-md flex-col items-center text-center">
        <div className="bg-card shadow-card mb-6 flex size-14 items-center justify-center rounded-2xl border">
          <Icon className="text-muted-foreground size-6" aria-hidden />
        </div>
        {code ? (
          <p className="text-muted-foreground text-callout font-mono tabular-nums">
            Error {code}
          </p>
        ) : null}
        <h1 className="text-title-1 mt-1 font-semibold tracking-tight">
          {title}
        </h1>
        <p className="text-muted-foreground text-body mt-2 text-balance">
          {description}
        </p>
        {actions ? (
          <div className="mt-8 flex w-full flex-col-reverse gap-3 sm:w-auto sm:flex-row">
            {actions}
          </div>
        ) : null}
      </div>
    </main>
  );
}
