"use client";

import { useMemo, useSyncExternalStore } from "react";

import { appendAuditLog } from "@/components/audit/audit-log-data";
import { currentProfile } from "@/components/profile/profile-data";

import {
  type AssetDevice,
  type DeviceCategory,
  type DevicePlatform,
  assetDevices as seedDevices,
} from "./devices-data";
import {
  type AssetIdentity,
  type IdentityKind,
  type IdentitySource,
  assetIdentities as seedIdentities,
} from "./identities-data";

type DeviceStore = Map<string, AssetDevice>;
type IdentityStore = Map<string, AssetIdentity>;

type AssetsSnapshot = {
  devices: DeviceStore;
  identities: IdentityStore;
};

let deviceStore: DeviceStore = new Map(
  seedDevices.map((device) => [device.id, device]),
);
let identityStore: IdentityStore = new Map(
  seedIdentities.map((identity) => [identity.id, identity]),
);

const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function snapshot(): AssetsSnapshot {
  return { devices: deviceStore, identities: identityStore };
}

export function subscribeAssetsSession(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getAssetsSessionSnapshot(): AssetsSnapshot {
  return snapshot();
}

export function getSessionDevices(): AssetDevice[] {
  return Array.from(deviceStore.values());
}

export function getSessionIdentities(): AssetIdentity[] {
  return Array.from(identityStore.values());
}

export function getDeviceFromSession(id: string) {
  return deviceStore.get(id) ?? null;
}

export function getIdentityFromSession(id: string) {
  return identityStore.get(id) ?? null;
}

function setDevice(device: AssetDevice) {
  const next = new Map(deviceStore);
  next.set(device.id, device);
  deviceStore = next;
  emit();
}

function setIdentity(identity: AssetIdentity) {
  const next = new Map(identityStore);
  next.set(identity.id, identity);
  identityStore = next;
  emit();
}

function nextDeviceId(category: DeviceCategory) {
  const prefix =
    category === "endpoint"
      ? "ep"
      : category === "server"
        ? "srv"
        : category === "network"
          ? "net"
          : "iot";
  let max = 0;
  for (const device of deviceStore.values()) {
    const match = new RegExp(`^dev-${prefix}-(\\d+)$`).exec(device.id);
    if (match) {
      max = Math.max(max, Number(match[1]));
    }
  }
  return `dev-${prefix}-${String(max + 1).padStart(2, "0")}`;
}

function nextIdentityId(kind: IdentityKind) {
  const prefix =
    kind === "service" ? "svc" : kind === "guest" ? "gst" : "usr";
  let max = 0;
  for (const identity of identityStore.values()) {
    const match = new RegExp(`^idn-${prefix}-(\\d+)$`).exec(identity.id);
    if (match) {
      max = Math.max(max, Number(match[1]));
    }
  }
  return `idn-${prefix}-${String(max + 1).padStart(2, "0")}`;
}

export type OnboardDeviceInput = {
  method: "sensor" | "discovery" | "manual";
  name: string;
  hostname: string;
  ipAddress: string;
  category: DeviceCategory;
  platform?: DevicePlatform;
  owner?: string;
  sensorOs?: "windows" | "macos" | "linux";
  subnet?: string;
};

export function onboardDevice(input: OnboardDeviceInput): AssetDevice {
  const category: DeviceCategory =
    input.method === "discovery"
      ? "network"
      : input.method === "sensor"
        ? input.sensorOs === "linux"
          ? "server"
          : "endpoint"
        : input.category;

  const platform: DevicePlatform =
    input.platform ??
    (input.method === "sensor"
      ? input.sensorOs === "windows"
        ? "Windows"
        : input.sensorOs === "macos"
          ? "macOS"
          : "Linux"
      : input.method === "discovery"
        ? "Cisco IOS"
        : "Firmware");

  const hostname =
    input.hostname.trim() ||
    (input.method === "discovery"
      ? `DISC-${(input.subnet ?? "scan").replace(/[^\w]/g, "").slice(0, 8).toUpperCase()}`
      : `HOST-${Date.now().toString(36).toUpperCase()}`);

  const device: AssetDevice = {
    id: nextDeviceId(category),
    name:
      input.name.trim() ||
      (input.method === "discovery"
        ? `Discovered · ${input.subnet ?? "subnet"}`
        : hostname),
    hostname,
    category,
    platform,
    status: "pending",
    owner: input.owner?.trim() || currentProfile.name,
    department: "Security",
    ipAddress:
      input.ipAddress.trim() ||
      (input.method === "discovery" ? "0.0.0.0" : "10.0.0.0"),
    location: "Onboarding",
    agentInstalled: input.method === "sensor",
    isolated: false,
    vulnerabilityCount: 0,
    lastSeenLabel: "Just now",
    lastSeenValue: 0,
    riskScore: 25,
  };

  setDevice(device);

  appendAuditLog({
    actorId: currentProfile.id,
    actorName: currentProfile.name,
    action: "asset.onboarded",
    targetType: "asset",
    targetId: device.id,
    detail: `Onboarded ${device.hostname} via ${input.method}`,
  });

  return device;
}

export function setDeviceIsolated(
  id: string,
  isolated = true,
): AssetDevice | null {
  const current = deviceStore.get(id);
  if (!current) return null;
  if (current.isolated === isolated) return current;

  const nextDevice: AssetDevice = {
    ...current,
    isolated,
    status: isolated
      ? "at-risk"
      : current.status === "at-risk"
        ? "online"
        : current.status,
  };
  setDevice(nextDevice);

  appendAuditLog({
    actorId: currentProfile.id,
    actorName: currentProfile.name,
    action: isolated ? "asset.isolated" : "asset.unisolated",
    targetType: "asset",
    targetId: id,
    detail: `${isolated ? "Isolated" : "Released"} ${current.hostname}`,
  });

  return nextDevice;
}

export function isolateDevices(ids: Iterable<string>): number {
  let count = 0;
  for (const id of ids) {
    const result = setDeviceIsolated(id, true);
    if (result) count += 1;
  }
  return count;
}

export type OnboardIdentityInput = {
  method: "directory" | "invite" | "manual";
  directorySource?: IdentitySource;
  inviteEmail?: string;
  inviteKind?: Exclude<IdentityKind, "service">;
  displayName?: string;
  principal?: string;
  kind?: IdentityKind;
  department?: string;
  owner?: string;
  privileged?: boolean;
};

function buildOnboardedIdentity(
  input: OnboardIdentityInput,
  overrides: Partial<AssetIdentity> = {},
): AssetIdentity {
  const kind: IdentityKind =
    overrides.kind ??
    input.kind ??
    (input.method === "invite"
      ? (input.inviteKind ?? "guest")
      : input.method === "directory"
        ? "user"
        : "service");

  const principal =
    overrides.principal ??
    input.principal?.trim() ??
    input.inviteEmail?.trim() ??
    `svc-${Date.now().toString(36)}@svalbard.ca`;

  const displayName =
    overrides.displayName ??
    input.displayName?.trim() ??
    (input.method === "invite"
      ? principal.split("@")[0] ?? principal
      : input.method === "directory"
        ? `Imported · ${input.directorySource ?? "Directory"}`
        : principal.split("@")[0] ?? "Service account");

  return {
    id: nextIdentityId(kind),
    displayName,
    principal,
    kind,
    source:
      overrides.source ??
      input.directorySource ??
      (kind === "service" ? "AWS IAM" : "Entra ID"),
    status: "active",
    department: input.department?.trim() || "Security",
    owner: input.owner?.trim() || currentProfile.name,
    title:
      kind === "service"
        ? "Service principal"
        : kind === "guest"
          ? "External collaborator"
          : "New hire",
    privileged: Boolean(input.privileged),
    mfaEnabled: kind === "service" ? null : false,
    lastSeenLabel: "Just now",
    lastSeenValue: 0,
    riskScore: input.privileged ? 55 : 28,
    groups:
      kind === "service"
        ? ["Service Principals"]
        : kind === "guest"
          ? ["External Collaborators"]
          : ["All Employees", "SSO Users"],
    lastPasswordChangeLabel: "Never",
    signInLocation:
      kind === "service" ? "Automation · us-east-1" : "Onboarding",
    linkedDevices: [],
    notes:
      input.method === "directory"
        ? `Imported via directory sync from ${input.directorySource ?? "directory"}.`
        : input.method === "invite"
          ? `Invite accepted for ${principal}.`
          : "Manually registered for visibility tracking.",
    ...overrides,
  };
}

export function onboardIdentity(input: OnboardIdentityInput): AssetIdentity[] {
  const created: AssetIdentity[] = [];

  if (input.method === "directory") {
    const source = input.directorySource ?? "Entra ID";
    for (let index = 0; index < 2; index += 1) {
      const identity = buildOnboardedIdentity(input, {
        displayName: `Synced user ${index + 1}`,
        principal: `synced.${Date.now().toString(36)}.${index}@svalbard.ca`,
        kind: "user",
        source,
        notes: `Directory sync from ${source} · batch import.`,
      });
      setIdentity(identity);
      created.push(identity);
    }
  } else {
    const identity = buildOnboardedIdentity(input);
    setIdentity(identity);
    created.push(identity);
  }

  for (const identity of created) {
    appendAuditLog({
      actorId: currentProfile.id,
      actorName: currentProfile.name,
      action: "identity.onboarded",
      targetType: "asset",
      targetId: identity.id,
      detail: `Onboarded ${identity.principal} via ${input.method}`,
    });
  }

  return created;
}

export function disableIdentity(id: string): AssetIdentity | null {
  const current = identityStore.get(id);
  if (!current) return null;
  if (current.status === "disabled") return current;

  const next: AssetIdentity = {
    ...current,
    status: "disabled",
    lastSeenLabel: "Disabled just now",
    lastSeenValue: 0,
    notes: current.notes
      ? `${current.notes}\n\nDisabled by ${currentProfile.name}.`
      : `Disabled by ${currentProfile.name}.`,
  };
  setIdentity(next);

  appendAuditLog({
    actorId: currentProfile.id,
    actorName: currentProfile.name,
    action: "identity.disabled",
    targetType: "asset",
    targetId: id,
    detail: `Disabled ${current.principal}`,
  });

  return next;
}

export function disableIdentities(ids: Iterable<string>): number {
  let count = 0;
  for (const id of ids) {
    if (disableIdentity(id)) count += 1;
  }
  return count;
}

export function requireIdentityMfa(id: string): AssetIdentity | null {
  const current = identityStore.get(id);
  if (!current || current.mfaEnabled === null) return current ?? null;

  const next: AssetIdentity = {
    ...current,
    mfaEnabled: true,
    notes: current.notes
      ? `${current.notes}\n\nMFA required on next sign-in.`
      : "MFA required on next sign-in.",
    riskScore: Math.max(0, current.riskScore - 8),
  };
  setIdentity(next);

  appendAuditLog({
    actorId: currentProfile.id,
    actorName: currentProfile.name,
    action: "identity.mfa_required",
    targetType: "asset",
    targetId: id,
    detail: `Required MFA for ${current.principal}`,
  });

  return next;
}

export function requireIdentityMfaBulk(ids: Iterable<string>): number {
  let count = 0;
  for (const id of ids) {
    if (requireIdentityMfa(id)) count += 1;
  }
  return count;
}

export function resetIdentityMfa(id: string): AssetIdentity | null {
  const current = identityStore.get(id);
  if (!current || current.mfaEnabled === null) return current ?? null;

  const next: AssetIdentity = {
    ...current,
    mfaEnabled: false,
    notes: current.notes
      ? `${current.notes}\n\nMFA challenge reset — re-enrollment required.`
      : "MFA challenge reset — re-enrollment required.",
    riskScore: Math.min(99, current.riskScore + 10),
  };
  setIdentity(next);

  appendAuditLog({
    actorId: currentProfile.id,
    actorName: currentProfile.name,
    action: "identity.mfa_reset",
    targetType: "asset",
    targetId: id,
    detail: `Reset MFA for ${current.principal}`,
  });

  return next;
}

export function forceIdentityLogout(id: string): AssetIdentity | null {
  const current = identityStore.get(id);
  if (!current) return null;

  const next: AssetIdentity = {
    ...current,
    lastSeenLabel: "Sessions cleared · just now",
    lastSeenValue: 0,
    notes: current.notes
      ? `${current.notes}\n\nActive sessions revoked by ${currentProfile.name}.`
      : `Active sessions revoked by ${currentProfile.name}.`,
  };
  setIdentity(next);

  appendAuditLog({
    actorId: currentProfile.id,
    actorName: currentProfile.name,
    action: "identity.sessions_revoked",
    targetType: "asset",
    targetId: id,
    detail: `Revoked sessions for ${current.principal}`,
  });

  return next;
}

export function flagIdentitiesForReview(ids: Iterable<string>): number {
  let count = 0;
  for (const id of ids) {
    const current = identityStore.get(id);
    if (!current) continue;
    const next: AssetIdentity = {
      ...current,
      riskScore: Math.min(99, current.riskScore + 12),
      notes: current.notes
        ? `${current.notes}\n\nFlagged for investigation.`
        : "Flagged for investigation.",
    };
    setIdentity(next);
    count += 1;
  }

  if (count > 0) {
    appendAuditLog({
      actorId: currentProfile.id,
      actorName: currentProfile.name,
      action: "identity.flagged_review",
      targetType: "asset",
      targetId: "bulk",
      detail: `Flagged ${count} identities for investigation`,
    });
  }

  return count;
}

export function useAssetsSession() {
  const snap = useSyncExternalStore(
    subscribeAssetsSession,
    getAssetsSessionSnapshot,
    getAssetsSessionSnapshot,
  );

  return useMemo(
    () => ({
      devices: Array.from(snap.devices.values()),
      identities: Array.from(snap.identities.values()),
      getDevice: (id: string) => snap.devices.get(id) ?? null,
      getIdentity: (id: string) => snap.identities.get(id) ?? null,
      onboardDevice,
      setDeviceIsolated,
      isolateDevices,
      onboardIdentity,
      disableIdentity,
      disableIdentities,
      requireIdentityMfa,
      requireIdentityMfaBulk,
      resetIdentityMfa,
      forceIdentityLogout,
      flagIdentitiesForReview,
    }),
    [snap],
  );
}
