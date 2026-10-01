import { cn } from "@/lib/utils";

/**
 * In-content page title block. Actions wrap beneath the title on narrow
 * screens rather than overflowing the viewport.
 */
export function PageHeader({
  title,
  description,
  eyebrow,
  actions,
  className,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  eyebrow?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className="min-w-0 space-y-1">
        {eyebrow ? (
          <div className="text-muted-foreground text-caption">{eyebrow}</div>
        ) : null}
        <h1 className="text-title-2 sm:text-title-1 text-balance">{title}</h1>
        {description ? (
          <p className="text-muted-foreground max-w-prose text-sm text-pretty">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          {actions}
        </div>
      ) : null}
    </header>
  );
}
