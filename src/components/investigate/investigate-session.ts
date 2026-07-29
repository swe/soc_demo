"use client";

import { useSyncExternalStore } from "react";

import {
  type InvestigateEvent,
  type SavedSearch,
} from "@/components/investigate/investigate-data";

type InvestigateStore = {
  savedSearches: SavedSearch[];
  recentQueries: string[];
  queryHistory: QueryHistoryEntry[];
  lastQuery: string;
  lastResults: InvestigateEvent[];
  lastSourceIds: string[];
};

export type QueryHistoryEntry = {
  id: string;
  at: string;
  query: string;
  sourceIds: string[];
  timeRange: string;
  hitCount: number;
};

const MAX_RECENT = 12;
const MAX_HISTORY = 40;

let store: InvestigateStore = {
  savedSearches: [
    {
      id: "ss-001",
      name: "Impossible travel — IdP",
      query:
        'identity.login | where geo.distance_km > 800 and time_delta_min < 60 | project identity, src.ip, geo.city, geo.country',
      sourceIds: ["int-okta-workforce", "int-sentinel-workspace"],
      createdAt: new Date(Date.now() - 86_400_000 * 2).toISOString(),
    },
    {
      id: "ss-002",
      name: "AWS admin AssumeRole",
      query:
        'cloud.role_assumption | where role contains "Admin" or role contains "OrganizationAccountAccessRole" | project actor.arn, role, src.ip, account.id',
      sourceIds: ["int-aws-prod", "int-splunk-core"],
      createdAt: new Date(Date.now() - 86_400_000 * 5).toISOString(),
    },
  ],
  recentQueries: [],
  queryHistory: [],
  lastQuery: "",
  lastResults: [],
  lastSourceIds: [],
};

const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function setStore(next: InvestigateStore) {
  store = next;
  emit();
}

export function subscribeInvestigateSession(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getInvestigateSessionSnapshot(): InvestigateStore {
  return store;
}

function nextSavedSearchId() {
  let max = 0;
  for (const search of store.savedSearches) {
    const match = /^ss-(\d+)$/.exec(search.id);
    if (match) max = Math.max(max, Number(match[1]));
  }
  return `ss-${String(max + 1).padStart(3, "0")}`;
}

export function saveSearch(input: {
  name: string;
  query: string;
  sourceIds: string[];
}): SavedSearch {
  const search: SavedSearch = {
    id: nextSavedSearchId(),
    name: input.name.trim() || "Untitled search",
    query: input.query.trim(),
    sourceIds: [...input.sourceIds],
    createdAt: new Date().toISOString(),
  };
  setStore({
    ...store,
    savedSearches: [search, ...store.savedSearches],
  });
  return search;
}

export function deleteSavedSearch(id: string) {
  setStore({
    ...store,
    savedSearches: store.savedSearches.filter((s) => s.id !== id),
  });
}

export function pushRecentQuery(query: string) {
  const trimmed = query.trim();
  if (!trimmed) return;
  const next = [
    trimmed,
    ...store.recentQueries.filter((q) => q !== trimmed),
  ].slice(0, MAX_RECENT);
  setStore({ ...store, recentQueries: next });
}

export function setLastRun(input: {
  query: string;
  sourceIds: string[];
  results: InvestigateEvent[];
}) {
  const trimmed = input.query.trim();
  const recent = trimmed
    ? [trimmed, ...store.recentQueries.filter((q) => q !== trimmed)].slice(
        0,
        MAX_RECENT,
      )
    : store.recentQueries;

  setStore({
    ...store,
    lastQuery: trimmed,
    lastSourceIds: [...input.sourceIds],
    lastResults: input.results,
    recentQueries: recent,
  });
}

export function pushQueryHistory(input: {
  query: string;
  sourceIds: string[];
  timeRange: string;
  hitCount: number;
}): QueryHistoryEntry {
  const entry: QueryHistoryEntry = {
    id: `qh-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    at: new Date().toISOString(),
    query: input.query.trim(),
    sourceIds: [...input.sourceIds],
    timeRange: input.timeRange,
    hitCount: input.hitCount,
  };
  setStore({
    ...store,
    queryHistory: [entry, ...store.queryHistory].slice(0, MAX_HISTORY),
  });
  return entry;
}

export function getInvestigateQueryHistory(): QueryHistoryEntry[] {
  return store.queryHistory;
}

export function useInvestigateSession() {
  const snapshot = useSyncExternalStore(
    subscribeInvestigateSession,
    getInvestigateSessionSnapshot,
    getInvestigateSessionSnapshot,
  );

  return {
    savedSearches: snapshot.savedSearches,
    recentQueries: snapshot.recentQueries,
    queryHistory: snapshot.queryHistory,
    lastQuery: snapshot.lastQuery,
    lastResults: snapshot.lastResults,
    lastSourceIds: snapshot.lastSourceIds,
    saveSearch,
    deleteSavedSearch,
    pushRecentQuery,
    setLastRun,
    pushQueryHistory,
  };
}
