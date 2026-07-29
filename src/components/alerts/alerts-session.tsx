"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";

import type { AssetIdentity } from "@/components/assets/identities-data";
import type { UebaAnomaly } from "@/components/assets/ueba-data";
import { appendAuditLog } from "@/components/audit/audit-log-data";
import { currentProfile } from "@/components/profile/profile-data";
import { alertsApi } from "@/lib/mock-api/alerts";

import {
  normalizeAlert,
  type SocAlert,
  socAlerts,
} from "./alerts-data";
import {
  type AlertStore,
  createAlertStore,
  getAlertFromStore,
  patchAlertStore,
} from "./alerts-query";

type AlertsSessionValue = {
  store: AlertStore;
  alerts: SocAlert[];
  getAlert: (id: string) => SocAlert | null;
  patchAlerts: (
    ids: Iterable<string>,
    patch: Partial<Pick<SocAlert, "status" | "assigneeId" | "notes">>,
  ) => void;
};

const AlertsSessionContext = createContext<AlertsSessionValue | null>(null);

/** Module-level store so triage survives /alerts ↔ /incidents layout remounts. */
let globalStore: AlertStore = createAlertStore(socAlerts);
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return globalStore;
}

function setGlobalStore(next: AlertStore) {
  globalStore = next;
  emit();
}

/** Read alert outside React (overview, board pack, incident detail helpers). */
export function getAlertSessionSnapshot(): AlertStore {
  return globalStore;
}

export function getAlertFromSession(id: string): SocAlert | null {
  return getAlertFromStore(globalStore, id);
}

export function getAlertsFromSession(): SocAlert[] {
  return Array.from(globalStore.values());
}

export function subscribeAlertsSession(listener: () => void) {
  return subscribe(listener);
}

/** Low-level store patch used by mock API (and session hooks). */
export function patchAlertsInSession(
  ids: Iterable<string>,
  patch: Partial<Pick<SocAlert, "status" | "assigneeId" | "notes">>,
) {
  setGlobalStore(patchAlertStore(globalStore, ids, patch));
}

const pulseTitles = [
  "Beaconing to newly registered domain",
  "Privileged token replay from unusual ASN",
  "Endpoint quarantine bypass attempt",
  "Suspicious OAuth consent grant",
  "Lateral movement via remote service",
] as const;

/** Inject a real critical alert so Overview pulse reconciles with Alerts. */
export function injectPulseCriticalAlert(): SocAlert {
  const stamp = Date.now();
  const id = `ALT-PULSE-${stamp.toString(36).toUpperCase()}`;
  const title = pulseTitles[stamp % pulseTitles.length] ?? pulseTitles[0];
  const now = new Date().toISOString();
  const alert = normalizeAlert(
    {
      id,
      title,
      summary:
        "Critical detection ingested into the alert session. Open Alerts to triage.",
      severity: "critical",
      status: "new",
      sourceId: "int-heimdall-pulse",
      sourceName: "Heimdall Live Pulse",
      sourceCategory: "siem",
      ruleName: "Live Pulse Critical",
      mitreTactic: "Command and Control",
      mitreTechnique: "T1071",
      entityType: "host",
      entityName: "pulse-sensor-01",
      assigneeId: null,
      createdAt: now,
      updatedAt: now,
      ageLabel: "just now",
      ageMinutes: 0,
      eventCount: 1,
      tags: ["live-pulse", "critical"],
      firstSeenLabel: "just now",
      lastSeenLabel: "just now",
      riskScore: 92,
    },
    stamp % 17,
  );

  const next = new Map(globalStore);
  next.set(alert.id, alert);
  setGlobalStore(next);

  appendAuditLog({
    actorId: currentProfile.id,
    actorName: currentProfile.name,
    action: "alert.pulse_injected",
    targetType: "alert",
    targetId: alert.id,
    detail: `Live pulse created critical alert: ${alert.title}`,
  });

  return alert;
}

/** Promote a UEBA anomaly into a session alert (demo). */
export function injectUebaAlert(
  identity: AssetIdentity,
  anomaly: UebaAnomaly,
): SocAlert {
  const stamp = Date.now();
  const id = `ALT-UEBA-${stamp.toString(36).toUpperCase()}`;
  const now = new Date().toISOString();
  const sourceName = anomaly.sourceTags[0] ?? "Heimdall UEBA";
  const alert = normalizeAlert(
    {
      id,
      title: anomaly.title,
      summary: anomaly.summary,
      severity: anomaly.severity,
      status: "new",
      sourceId: "int-heimdall-ueba",
      sourceName,
      sourceCategory: "identity",
      ruleName: `UEBA · ${anomaly.kind.replaceAll("_", " ")}`,
      mitreTactic: "Credential Access",
      mitreTechnique:
        anomaly.kind === "privilege_spike"
          ? "T1078"
          : anomaly.kind === "impossible_travel"
            ? "T1078.004"
            : "T1110",
      entityType: "user",
      entityName: identity.principal,
      identityId: identity.id,
      assigneeId: null,
      createdAt: now,
      updatedAt: now,
      ageLabel: "just now",
      ageMinutes: 0,
      eventCount: 1,
      tags: ["ueba", anomaly.kind, ...anomaly.sourceTags.map((t) => t.toLowerCase())],
      firstSeenLabel: "just now",
      lastSeenLabel: "just now",
      riskScore: Math.min(99, identity.riskScore + anomaly.riskDelta),
      recommendedAction: "Validate identity baseline and contain if confirmed.",
    },
    stamp % 17,
  );

  const next = new Map(globalStore);
  next.set(alert.id, alert);
  setGlobalStore(next);

  appendAuditLog({
    actorId: currentProfile.id,
    actorName: currentProfile.name,
    action: "alert.ueba_promoted",
    targetType: "alert",
    targetId: alert.id,
    detail: `Promoted UEBA anomaly ${anomaly.id} for ${identity.displayName}`,
  });

  return alert;
}

export function AlertsSessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const store = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const alerts = useMemo(() => Array.from(store.values()), [store]);

  const getAlert = useCallback(
    (id: string) => getAlertFromStore(store, id),
    [store],
  );

  const patchAlerts = useCallback(
    (
      ids: Iterable<string>,
      patch: Partial<Pick<SocAlert, "status" | "assigneeId" | "notes">>,
    ) => {
      alertsApi.patchSync(ids, patch);
    },
    [],
  );

  const value = useMemo(
    () => ({ store, alerts, getAlert, patchAlerts }),
    [store, alerts, getAlert, patchAlerts],
  );

  return (
    <AlertsSessionContext.Provider value={value}>
      {children}
    </AlertsSessionContext.Provider>
  );
}

export function useAlertsSession() {
  const value = useContext(AlertsSessionContext);
  if (!value) {
    throw new Error(
      "useAlertsSession must be used within AlertsSessionProvider",
    );
  }
  return value;
}

/** Optional hook for surfaces outside AlertsSessionProvider (overview, etc.). */
export function useAlertsSessionStore() {
  const store = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return useMemo(
    () => ({
      store,
      alerts: Array.from(store.values()),
      getAlert: (id: string) => getAlertFromStore(store, id),
      patchAlerts: (
        ids: Iterable<string>,
        patch: Partial<Pick<SocAlert, "status" | "assigneeId" | "notes">>,
      ) => {
        alertsApi.patchSync(ids, patch);
      },
    }),
    [store],
  );
}
