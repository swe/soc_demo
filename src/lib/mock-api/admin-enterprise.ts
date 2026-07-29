/**
 * Enterprise administration mock API — retention, API keys, SCIM, break-glass.
 * Demo-only; SSO / IdP remains messaging stubs elsewhere.
 */

import { auditFromReceipt } from "./audit";
import { mockDelay } from "./delay";
import { type ActionReceipt, makeReceipt } from "./types";

export type RetentionPolicy = {
  id: string;
  name: string;
  retention: string;
  coldStorage: string;
};

export type EnterpriseApiKey = {
  id: string;
  name: string;
  prefix: string;
  scopes: string[];
  lastUsed: string;
  status: "active" | "rotated" | "revoked";
};

export type ScimStatus = {
  provider: string;
  lastSync: string;
  usersSynced: number;
  groupsSynced: number;
  status: "healthy" | "degraded" | "error";
  errors: number;
};

export type BreakGlassSession = {
  id: string;
  actor: string;
  reason: string;
  started: string;
  expires: string;
  status: "active" | "closed";
};

const retentionSeed: RetentionPolicy[] = [
  {
    id: "ret-alerts",
    name: "Alerts & detections",
    retention: "365 days",
    coldStorage: "2 years",
  },
  {
    id: "ret-investigate",
    name: "Investigate event cache",
    retention: "90 days",
    coldStorage: "1 year",
  },
  {
    id: "ret-evidence",
    name: "Evidence locker",
    retention: "730 days",
    coldStorage: "7 years",
  },
  {
    id: "ret-audit",
    name: "Audit log",
    retention: "3 years",
    coldStorage: "7 years",
  },
];

let retentionStore = retentionSeed.map((p) => ({ ...p }));

let apiKeyStore: EnterpriseApiKey[] = [
  {
    id: "key-siem",
    name: "SIEM ingest service",
    prefix: "hm_live_8f3a…",
    scopes: ["investigate:read", "alerts:write"],
    lastUsed: "4 min ago",
    status: "active",
  },
  {
    id: "key-soar",
    name: "SOAR automation",
    prefix: "hm_live_c21b…",
    scopes: ["response:write", "playbooks:run"],
    lastUsed: "22 min ago",
    status: "active",
  },
  {
    id: "key-bi",
    name: "Board analytics export",
    prefix: "hm_ro_91dd…",
    scopes: ["metrics:read"],
    lastUsed: "2d ago",
    status: "rotated",
  },
];

let scimStore: ScimStatus = {
  provider: "Okta Workforce",
  lastSync: "6 min ago",
  usersSynced: 842,
  groupsSynced: 38,
  status: "healthy",
  errors: 0,
};

let breakGlassStore: BreakGlassSession[] = [
  {
    id: "bg-01",
    actor: "Ava Reed",
    reason: "Production containment during INC-1042",
    started: "Jul 28, 16:02",
    expires: "Jul 28, 18:02",
    status: "active",
  },
  {
    id: "bg-02",
    actor: "Luis Ortega",
    reason: "Emergency IdP recovery",
    started: "Jul 12, 09:14",
    expires: "Jul 12, 11:14",
    status: "closed",
  },
];

let keySeq = 1;
let bgSeq = 3;

export const adminEnterpriseApi = {
  async listRetention(): Promise<RetentionPolicy[]> {
    await mockDelay(40);
    return retentionStore;
  },

  async saveRetention(
    policyId: string,
    patch?: Partial<Pick<RetentionPolicy, "retention" | "coldStorage">>,
  ): Promise<{ policy: RetentionPolicy | null; receipt: ActionReceipt }> {
    await mockDelay(140);
    const idx = retentionStore.findIndex((p) => p.id === policyId);
    if (idx < 0) {
      const receipt = makeReceipt({
        outcome: "failed",
        message: `Retention policy ${policyId} not found`,
        targetType: "export",
        targetId: policyId,
      });
      auditFromReceipt(receipt, "admin.retention_save", "export");
      return { policy: null, receipt };
    }
    const next = {
      ...retentionStore[idx]!,
      ...patch,
    };
    retentionStore = retentionStore.map((p, i) => (i === idx ? next : p));
    const receipt = makeReceipt({
      outcome: "ok",
      message: `Retention saved for “${next.name}”`,
      targetType: "export",
      targetId: policyId,
      detail: `hot=${next.retention}; cold=${next.coldStorage}`,
    });
    auditFromReceipt(receipt, "admin.retention_save", "export");
    return { policy: next, receipt };
  },

  async listApiKeys(): Promise<EnterpriseApiKey[]> {
    await mockDelay(40);
    return apiKeyStore;
  },

  async mintApiKey(input?: {
    name?: string;
    scopes?: string[];
  }): Promise<{ key: EnterpriseApiKey; receipt: ActionReceipt }> {
    await mockDelay(160);
    const id = `key-demo-${keySeq++}`;
    const prefix = `hm_live_${Math.random().toString(36).slice(2, 6)}…`;
    const key: EnterpriseApiKey = {
      id,
      name: input?.name ?? "Service key",
      prefix,
      scopes: input?.scopes ?? ["investigate:read", "metrics:read"],
      lastUsed: "never",
      status: "active",
    };
    apiKeyStore = [key, ...apiKeyStore];
    const receipt = makeReceipt({
      outcome: "ok",
      message: `API key minted · ${key.prefix}`,
      targetType: "integration",
      targetId: id,
      detail: `scopes=${key.scopes.join(",")}`,
      externalRef: prefix,
    });
    auditFromReceipt(receipt, "admin.api_key_mint", "integration");
    return { key, receipt };
  },

  async revokeApiKey(
    keyId: string,
  ): Promise<{ key: EnterpriseApiKey | null; receipt: ActionReceipt }> {
    await mockDelay(120);
    const existing = apiKeyStore.find((k) => k.id === keyId) ?? null;
    if (!existing) {
      const receipt = makeReceipt({
        outcome: "failed",
        message: `API key ${keyId} not found`,
        targetType: "integration",
        targetId: keyId,
      });
      auditFromReceipt(receipt, "admin.api_key_revoke", "integration");
      return { key: null, receipt };
    }
    const key: EnterpriseApiKey = { ...existing, status: "revoked" };
    apiKeyStore = apiKeyStore.map((k) => (k.id === keyId ? key : k));
    const receipt = makeReceipt({
      outcome: "ok",
      message: `API key revoked · ${key.prefix}`,
      targetType: "integration",
      targetId: keyId,
    });
    auditFromReceipt(receipt, "admin.api_key_revoke", "integration");
    return { key, receipt };
  },

  async getScim(): Promise<ScimStatus> {
    await mockDelay(40);
    return scimStore;
  },

  async refreshScim(): Promise<{
    status: ScimStatus;
    receipt: ActionReceipt;
  }> {
    await mockDelay(320);
    scimStore = {
      ...scimStore,
      lastSync: "just now",
      usersSynced: scimStore.usersSynced + Math.floor(Math.random() * 4),
      groupsSynced: scimStore.groupsSynced,
      status: "healthy",
      errors: 0,
    };
    const receipt = makeReceipt({
      outcome: "simulated",
      message: `SCIM refresh via ${scimStore.provider} · ${scimStore.usersSynced} users`,
      targetType: "integration",
      targetId: "scim-okta",
      detail: "SSO/SCIM sync refresh",
      connectorId: "int-okta-workforce",
      connectorName: "Okta Workforce",
    });
    auditFromReceipt(receipt, "admin.scim_refresh", "integration");
    return { status: scimStore, receipt };
  },

  async listBreakGlass(): Promise<BreakGlassSession[]> {
    await mockDelay(40);
    return breakGlassStore;
  },

  async startBreakGlass(input?: {
    actor?: string;
    reason?: string;
  }): Promise<{ session: BreakGlassSession; receipt: ActionReceipt }> {
    await mockDelay(180);
    const now = new Date();
    const expires = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    const fmt = (d: Date) =>
      d.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    const session: BreakGlassSession = {
      id: `bg-${String(bgSeq++).padStart(2, "0")}`,
      actor: input?.actor ?? "Operator",
      reason: input?.reason ?? "Emergency admin access",
      started: fmt(now),
      expires: fmt(expires),
      status: "active",
    };
    breakGlassStore = [session, ...breakGlassStore];
    const receipt = makeReceipt({
      outcome: "simulated",
      message: `Break-glass started · ${session.actor}`,
      targetType: "user",
      targetId: session.id,
      detail: session.reason,
    });
    auditFromReceipt(receipt, "admin.break_glass_start", "user");
    return { session, receipt };
  },

  async endBreakGlass(
    sessionId: string,
  ): Promise<{ session: BreakGlassSession | null; receipt: ActionReceipt }> {
    await mockDelay(120);
    const existing = breakGlassStore.find((s) => s.id === sessionId) ?? null;
    if (!existing) {
      const receipt = makeReceipt({
        outcome: "failed",
        message: `Break-glass session ${sessionId} not found`,
        targetType: "user",
        targetId: sessionId,
      });
      auditFromReceipt(receipt, "admin.break_glass_end", "user");
      return { session: null, receipt };
    }
    const session: BreakGlassSession = { ...existing, status: "closed" };
    breakGlassStore = breakGlassStore.map((s) =>
      s.id === sessionId ? session : s,
    );
    const receipt = makeReceipt({
      outcome: "ok",
      message: `Break-glass ended · ${session.actor}`,
      targetType: "user",
      targetId: sessionId,
    });
    auditFromReceipt(receipt, "admin.break_glass_end", "user");
    return { session, receipt };
  },
};
