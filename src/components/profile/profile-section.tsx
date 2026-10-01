import { cn } from "@/lib/utils";

export function ProfileSection({
  id,
  title,
  description,
  children,
  className,
  action,
}: {
  id?: string;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className={cn(
        "bg-card shadow-card scroll-mt-6 rounded-xl border p-4 sm:p-6",
        className,
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <h2 className="text-title-3 font-semibold">{title}</h2>
          {description ? (
            <p className="text-muted-foreground text-sm">{description}</p>
          ) : null}
        </div>
        {action}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}
