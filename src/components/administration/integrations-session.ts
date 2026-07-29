"use client";

import { useMemo, useSyncExternalStore } from "react";

import {
  type ConnectorActivity,
  connectorActivity as seedActivity,
  type ConnectorActivityKind,
  type IntegrationHealth,
} from "./integrations-data";

/** Backend connect contract — UI persists this shape via mock-api. */
export type ConnectorConfig = {
  integrationId: string;
  endpoint: string;
  healthUrl: string;
  scopes: string[];
  fieldMap: Record<string, string>;
  credentialsRef: string;
};

type IntegrationsStore = {
  configs: Map<string, ConnectorConfig>;
  healthOverlay: Map<string, IntegrationHealth | "paused">;
  activity: ConnectorActivity[];
};

function seedStore(): IntegrationsStore {
  return {
    configs: new Map(),
    healthOverlay: new Map(),
    activity: [...seedActivity],
  };
}

let store: IntegrationsStore = seedStore();
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function setStore(next: IntegrationsStore) {
  store = next;
  emit();
}

export function subscribeIntegrationsSession(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getIntegrationsSessionSnapshot() {
  return store;
}

export function getConnectorConfig(
  integrationId: string,
): ConnectorConfig | null {
  return store.configs.get(integrationId) ?? null;
}

export function getAllConnectorConfigs(): ConnectorConfig[] {
  return Array.from(store.configs.values());
}

export function saveConnectorConfig(config: ConnectorConfig): ConnectorConfig {
  const configs = new Map(store.configs);
  configs.set(config.integrationId, config);
  setStore({ ...store, configs });
  return config;
}

export function removeConnectorConfig(integrationId: string): void {
  if (!store.configs.has(integrationId)) return;
  const configs = new Map(store.configs);
  configs.delete(integrationId);
  setStore({ ...store, configs });
}

export function getSessionHealth(
  integrationId: string,
): IntegrationHealth | "paused" | null {
  return store.healthOverlay.get(integrationId) ?? null;
}

export function setSessionHealth(
  integrationId: string,
  health: IntegrationHealth | "paused",
): void {
  const healthOverlay = new Map(store.healthOverlay);
  healthOverlay.set(integrationId, health);
  setStore({ ...store, healthOverlay });
}

export function clearSessionHealth(integrationId: string): void {
  if (!store.healthOverlay.has(integrationId)) return;
  const healthOverlay = new Map(store.healthOverlay);
  healthOverlay.delete(integrationId);
  setStore({ ...store, healthOverlay });
}

export function getSessionActivity(
  integrationId?: string,
): ConnectorActivity[] {
  if (!integrationId) return store.activity;
  return store.activity.filter((item) => item.integrationId === integrationId);
}

export function appendSessionActivity(input: {
  integrationId: string;
  kind: ConnectorActivityKind;
  title: string;
  detail: string;
  time?: string;
}): ConnectorActivity {
  const event: ConnectorActivity = {
    id: `act-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    integrationId: input.integrationId,
    kind: input.kind,
    title: input.title,
    detail: input.detail,
    time: input.time ?? "Just now",
  };
  setStore({ ...store, activity: [event, ...store.activity] });
  return event;
}

/** Build a demo credentialsRef without storing the secret value. */
export function mintCredentialsRef(integrationId: string): string {
  return `cred-${integrationId}-${Date.now().toString(36)}`;
}

export function deriveHealthUrl(endpoint: string): string {
  const trimmed = endpoint.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const url = new URL(trimmed);
      url.pathname = url.pathname.replace(/\/?$/, "/health");
      url.search = "";
      url.hash = "";
      return url.toString();
    } catch {
      return `${trimmed.replace(/\/$/, "")}/health`;
    }
  }
  if (trimmed.startsWith("arn:aws:")) {
    return "https://sts.amazonaws.com/?Action=GetCallerIdentity";
  }
  return `https://${trimmed.replace(/^\/+/, "")}/api/v1/health`;
}

export function useIntegrationsSession() {
  const snapshot = useSyncExternalStore(
    subscribeIntegrationsSession,
    getIntegrationsSessionSnapshot,
    getIntegrationsSessionSnapshot,
  );

  return useMemo(
    () => ({
      configs: Array.from(snapshot.configs.values()),
      activity: snapshot.activity,
      getConfig: (id: string) => snapshot.configs.get(id) ?? null,
      getActivity: (id: string) =>
        snapshot.activity.filter((item) => item.integrationId === id),
    }),
    [snapshot],
  );
}
