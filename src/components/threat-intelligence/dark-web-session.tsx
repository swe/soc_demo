"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

import { appendAuditLog } from "@/components/audit/audit-log-data";
import { currentProfile } from "@/components/profile/profile-data";

import {
  type DarkWebBreach,
  darkWebBreaches,
  type DarkWebExposure,
  darkWebExposures,
  initialWatchlist,
  type WatchlistEntry,
  type WatchlistKind,
  type WatchlistStatus,
} from "./dark-web-data";
import {
  createExposureStore,
  type ExposureStore,
  getExposureFromStore,
  patchExposureStore,
} from "./dark-web-query";

type DarkWebSessionValue = {
  store: ExposureStore;
  exposures: DarkWebExposure[];
  breaches: DarkWebBreach[];
  watchlist: WatchlistEntry[];
  getExposure: (id: string) => DarkWebExposure | null;
  patchExposures: (
    ids: Iterable<string>,
    patch: Partial<Pick<DarkWebExposure, "status">>,
  ) => void;
  addWatchlistEntry: (entry: {
    value: string;
    kind: WatchlistKind;
    notes?: string;
  }) => void;
  removeWatchlistEntry: (id: string) => void;
  setWatchlistStatus: (id: string, status: WatchlistStatus) => void;
};

const DarkWebSessionContext = createContext<DarkWebSessionValue | null>(null);

let watchlistSeq = initialWatchlist.length;

export function DarkWebSessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [store, setStore] = useState<ExposureStore>(() =>
    createExposureStore(darkWebExposures),
  );
  const [watchlist, setWatchlist] = useState<WatchlistEntry[]>(
    () => initialWatchlist,
  );

  const exposures = useMemo(() => Array.from(store.values()), [store]);

  const getExposure = useCallback(
    (id: string) => getExposureFromStore(store, id),
    [store],
  );

  const patchExposures = useCallback(
    (
      ids: Iterable<string>,
      patch: Partial<Pick<DarkWebExposure, "status">>,
    ) => {
      setStore((current) => patchExposureStore(current, ids, patch));
    },
    [],
  );

  const addWatchlistEntry = useCallback(
    (entry: { value: string; kind: WatchlistKind; notes?: string }) => {
      const value = entry.value.trim();
      if (!value) return;
      watchlistSeq += 1;
      const next: WatchlistEntry = {
        id: `wl-${String(watchlistSeq).padStart(2, "0")}`,
        value,
        kind: entry.kind,
        addedLabel: "just now",
        addedValue: Date.now(),
        hits7d: 0,
        status: "active",
        notes: entry.notes?.trim() || undefined,
      };
      setWatchlist((current) => [next, ...current]);
      appendAuditLog({
        actorId: currentProfile.id,
        actorName: currentProfile.name,
        action: "dark_web.watchlist_add",
        targetType: "indicator",
        targetId: next.id,
        detail: `Added watchlist ${next.kind} “${next.value}”`,
      });
    },
    [],
  );

  const removeWatchlistEntry = useCallback((id: string) => {
    setWatchlist((current) => {
      const removed = current.find((item) => item.id === id);
      if (removed) {
        appendAuditLog({
          actorId: currentProfile.id,
          actorName: currentProfile.name,
          action: "dark_web.watchlist_remove",
          targetType: "indicator",
          targetId: id,
          detail: `Removed watchlist “${removed.value}”`,
        });
      }
      return current.filter((item) => item.id !== id);
    });
  }, []);

  const setWatchlistStatus = useCallback(
    (id: string, status: WatchlistStatus) => {
      setWatchlist((current) =>
        current.map((item) =>
          item.id === id ? { ...item, status } : item,
        ),
      );
    },
    [],
  );

  const value = useMemo(
    () => ({
      store,
      exposures,
      breaches: darkWebBreaches,
      watchlist,
      getExposure,
      patchExposures,
      addWatchlistEntry,
      removeWatchlistEntry,
      setWatchlistStatus,
    }),
    [
      store,
      exposures,
      watchlist,
      getExposure,
      patchExposures,
      addWatchlistEntry,
      removeWatchlistEntry,
      setWatchlistStatus,
    ],
  );

  return (
    <DarkWebSessionContext.Provider value={value}>
      {children}
    </DarkWebSessionContext.Provider>
  );
}

export function useDarkWebSession() {
  const value = useContext(DarkWebSessionContext);
  if (!value) {
    throw new Error(
      "useDarkWebSession must be used within DarkWebSessionProvider",
    );
  }
  return value;
}
