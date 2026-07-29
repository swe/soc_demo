export type AuditTargetType =
  | "alert"
  | "incident"
  | "playbook"
  | "export"
  | "integration"
  | "detection"
  | "report"
  | "user"
  | "hunt"
  | "feed"
  | "asset"
  | "compliance"
  | "indicator"
  | "cloud_finding"
  | "vulnerability"
  | "training"
  | "data_security";

export type AuditLogEntry = {
  id: string;
  at: string;
  actorId: string;
  actorName: string;
  action: string;
  targetType: AuditTargetType;
  targetId: string;
  detail: string;
};

const MAX_ENTRIES = 500;

let entries: AuditLogEntry[] = [
  {
    id: "aud-seed-1",
    // Fixed ISO — do not use Date.now() at module load (SSR/client mismatch).
    at: "2026-07-28T12:15:00.000Z",
    actorId: "ava-reed",
    actorName: "Ava Reed",
    action: "session.started",
    targetType: "user",
    targetId: "ava-reed",
    detail: "Session initialized",
  },
];

const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

export function getAuditLogEntries(): AuditLogEntry[] {
  return entries;
}

export function subscribeAuditLog(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function appendAuditLog(
  entry: Omit<AuditLogEntry, "id" | "at"> & { at?: string; id?: string },
): AuditLogEntry {
  const next: AuditLogEntry = {
    id: entry.id ?? `aud-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    at: entry.at ?? new Date().toISOString(),
    actorId: entry.actorId,
    actorName: entry.actorName,
    action: entry.action,
    targetType: entry.targetType,
    targetId: entry.targetId,
    detail: entry.detail,
  };
  entries = [next, ...entries].slice(0, MAX_ENTRIES);
  emit();
  return next;
}

export function formatAuditTime(iso: string) {
  try {
    // UTC + en-US keeps SSR and client strings identical.
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "UTC",
      hour12: false,
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}
