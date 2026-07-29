"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";

import {
  currentAnalystId,
  incidentFromAlerts,
  nextIncidentId,
  socIncidents,
  type SocIncident,
} from "./incidents-data";
import {
  createIncidentStore,
  getIncidentFromStore,
  type IncidentStore,
  patchIncidentStore,
  upsertIncidentStore,
} from "./incidents-query";
import type { SocAlert } from "@/components/alerts/alerts-data";

type IncidentsSessionValue = {
  store: IncidentStore;
  incidents: SocIncident[];
  getIncident: (id: string) => SocIncident | null;
  patchIncidents: (
    ids: Iterable<string>,
    patch: Partial<
      Pick<
        SocIncident,
        | "status"
        | "assigneeId"
        | "ownerId"
        | "notes"
        | "timeline"
        | "warRoomMessages"
      >
    >,
  ) => void;
  upsertIncident: (incident: SocIncident) => void;
  createFromAlerts: (
    alerts: SocAlert[],
    overrides?: Partial<SocIncident>,
  ) => SocIncident;
};

const IncidentsSessionContext = createContext<IncidentsSessionValue | null>(
  null,
);

/** Module-level store so escalate from /alerts survives layout remounts. */
let globalStore: IncidentStore = createIncidentStore(socIncidents);
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return globalStore;
}

function setGlobalStore(next: IncidentStore) {
  globalStore = next;
  emit();
}

/** Read incidents outside React (overview, board pack). */
export function getIncidentSessionSnapshot(): IncidentStore {
  return globalStore;
}

export function getIncidentsFromSession(): SocIncident[] {
  return Array.from(globalStore.values());
}

export function subscribeIncidentsSession(listener: () => void) {
  return subscribe(listener);
}

export function createIncidentFromAlerts(
  alerts: SocAlert[],
  overrides: Partial<SocIncident> = {},
): SocIncident {
  if (alerts.length === 0) {
    throw new Error("createIncidentFromAlerts requires at least one alert");
  }

  const incident = incidentFromAlerts(alerts, {
    id: overrides.id ?? nextIncidentId(),
    status: overrides.status ?? "new",
    assigneeId:
      overrides.assigneeId !== undefined
        ? overrides.assigneeId
        : (alerts[0]?.assigneeId ?? currentAnalystId),
    escalatedFromAlerts: overrides.escalatedFromAlerts ?? true,
    ...overrides,
  });

  setGlobalStore(upsertIncidentStore(globalStore, incident));
  return incident;
}

export function IncidentsSessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const store = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const incidents = useMemo(() => Array.from(store.values()), [store]);

  const getIncident = useCallback(
    (id: string) => getIncidentFromStore(store, id),
    [store],
  );

  const patchIncidents = useCallback(
    (
      ids: Iterable<string>,
      patch: Partial<
        Pick<
          SocIncident,
          | "status"
          | "assigneeId"
          | "ownerId"
          | "notes"
          | "timeline"
          | "warRoomMessages"
        >
      >,
    ) => {
      setGlobalStore(patchIncidentStore(globalStore, ids, patch));
    },
    [],
  );

  const upsertIncident = useCallback((incident: SocIncident) => {
    setGlobalStore(upsertIncidentStore(globalStore, incident));
  }, []);

  const createFromAlerts = useCallback(
    (alerts: SocAlert[], overrides: Partial<SocIncident> = {}) =>
      createIncidentFromAlerts(alerts, overrides),
    [],
  );

  const value = useMemo(
    () => ({
      store,
      incidents,
      getIncident,
      patchIncidents,
      upsertIncident,
      createFromAlerts,
    }),
    [
      store,
      incidents,
      getIncident,
      patchIncidents,
      upsertIncident,
      createFromAlerts,
    ],
  );

  return (
    <IncidentsSessionContext.Provider value={value}>
      {children}
    </IncidentsSessionContext.Provider>
  );
}

export function useIncidentsSession() {
  const value = useContext(IncidentsSessionContext);
  if (!value) {
    throw new Error(
      "useIncidentsSession must be used within IncidentsSessionProvider",
    );
  }
  return value;
}
