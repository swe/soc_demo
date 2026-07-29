"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";

import { appendAuditLog } from "@/components/audit/audit-log-data";
import { currentProfile } from "@/components/profile/profile-data";
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
        "Demo live pulse — critical detection ingested into the alert session. Open Alerts to triage.",
      severity: "critical",
      status: "new",
      sourceId: "int-heimdall-pulse",
      sourceName: "Heimdall Live Pulse",
      sourceCategory: "siem",
      ruleName: "Demo · Live Pulse Critical",
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
      tags: ["demo-pulse", "critical"],
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
      setGlobalStore(patchAlertStore(globalStore, ids, patch));
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
        setGlobalStore(patchAlertStore(globalStore, ids, patch));
      },
    }),
    [store],
  );
}
