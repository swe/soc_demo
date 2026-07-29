/**
 * Live-relative time labels so demo queues age instead of frozen seed strings.
 */

export function formatRelativeAge(
  isoOrDate: string | Date,
  now: Date = new Date(),
): string {
  const then =
    typeof isoOrDate === "string" ? new Date(isoOrDate) : isoOrDate;
  if (Number.isNaN(then.getTime())) return "—";

  const diffMs = Math.max(0, now.getTime() - then.getTime());
  const minutes = Math.floor(diffMs / 60_000);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 48) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 14) return `${days}d ago`;

  return then.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

/** Compact label without "ago" (for dense table cells). */
export function formatRelativeAgeCompact(
  isoOrDate: string | Date,
  now: Date = new Date(),
): string {
  const then =
    typeof isoOrDate === "string" ? new Date(isoOrDate) : isoOrDate;
  if (Number.isNaN(then.getTime())) return "—";

  const diffMs = Math.max(0, now.getTime() - then.getTime());
  const minutes = Math.floor(diffMs / 60_000);

  if (minutes < 1) return "<1m";
  if (minutes < 60) return `${minutes}m`;

  const hours = Math.floor(minutes / 60);
  if (hours < 48) return `${hours}h`;

  const days = Math.floor(hours / 24);
  return `${days}d`;
}

/**
 * Hook-friendly ticker: returns a Date that updates every `intervalMs`.
 * Use in client components that need aging labels.
 */
export function nextAgeTick(intervalMs = 30_000): number {
  return Math.floor(Date.now() / intervalMs);
}
