import {
  defaultFieldMapForIntegration,
  type DegradedReason,
  type IntegrationHealth,
} from "@/components/administration/integrations-data";
import {
  appendSessionActivity,
  clearSessionHealth,
  type ConnectorConfig,
  deriveHealthUrl,
  getAllConnectorConfigs,
  getConnectorConfig,
  getSessionActivity,
  getSessionHealth,
  mintCredentialsRef,
  removeConnectorConfig,
  saveConnectorConfig,
  setSessionHealth,
} from "@/components/administration/integrations-session";
import {
  getTelemetrySource,
  type SourceHealth,
  type TelemetrySource,
  telemetrySources,
} from "@/lib/source-registry";

import { auditFromReceipt } from "./audit";
import { mockDelay } from "./delay";
import { type ActionReceipt, type ListResult,makeReceipt } from "./types";

export type { ConnectorConfig };

/** Connect body accepted by the backend (and persisted in session for demo). */
export type ConnectIntegrationInput = ConnectorConfig & {
  displayName?: string;
};

function toSourceHealth(
  health: IntegrationHealth | "paused" | SourceHealth,
): SourceHealth {
  if (health === "paused") return "paused";
  return health;
}

const degradedReasons: Record<string, DegradedReason> = {
  default: {
    code: "collector_backoff",
    summary: "Connector marked degraded",
    detail:
      "Health overlay set connector to degraded. Ingest continues with elevated lag and error rate.",
    since: "Just now",
    remediation: "Inspect the sync/health timeline, then re-sync or restore credentials.",
  },
};

export const integrationsApi = {
  async list(): Promise<
    ListResult<TelemetrySource & { effectiveHealth: SourceHealth }>
  > {
    await mockDelay(80);
    const items = telemetrySources.map((s) => {
      const overlay = getSessionHealth(s.id);
      return {
        ...s,
        effectiveHealth: overlay
          ? toSourceHealth(overlay)
          : s.health,
      };
    });
    return { items, total: items.length };
  },

  async getConfig(integrationId: string): Promise<ConnectorConfig | null> {
    await mockDelay(40);
    return getConnectorConfig(integrationId);
  },

  async listConfigs(): Promise<ListResult<ConnectorConfig>> {
    await mockDelay(60);
    const items = getAllConnectorConfigs();
    return { items, total: items.length };
  },

  async listActivity(integrationId?: string) {
    await mockDelay(40);
    const items = getSessionActivity(integrationId);
    return { items, total: items.length };
  },

  async connect(input: ConnectIntegrationInput): Promise<ActionReceipt> {
    await mockDelay(320);
    const source = getTelemetrySource(input.integrationId);
    const config: ConnectorConfig = {
      integrationId: input.integrationId,
      endpoint: input.endpoint,
      healthUrl: input.healthUrl || deriveHealthUrl(input.endpoint),
      scopes: input.scopes,
      fieldMap:
        Object.keys(input.fieldMap).length > 0
          ? input.fieldMap
          : defaultFieldMapForIntegration(input.integrationId),
      credentialsRef: input.credentialsRef || mintCredentialsRef(input.integrationId),
    };
    saveConnectorConfig(config);
    setSessionHealth(input.integrationId, "healthy");
    appendSessionActivity({
      integrationId: input.integrationId,
      kind: "connect",
      title: `Connected ${input.displayName ?? source?.name ?? input.integrationId}`,
      detail: `endpoint=${config.endpoint} · scopes=${config.scopes.join(", ") || "default"} · cred=${config.credentialsRef}`,
    });
    appendSessionActivity({
      integrationId: input.integrationId,
      kind: "health",
      title: "Health probe scheduled",
      detail: `healthUrl=${config.healthUrl}`,
    });

    const receipt = makeReceipt({
      outcome: "simulated",
      message: source
        ? `Connected ${input.displayName ?? source.name}`
        : `Connected ${input.integrationId}`,
      connectorId: input.integrationId,
      connectorName: source?.name,
      targetType: "integration",
      targetId: input.integrationId,
      detail: [
        `endpoint=${config.endpoint}`,
        `healthUrl=${config.healthUrl}`,
        `scopes=${config.scopes.join("|")}`,
        `fieldMap=${Object.keys(config.fieldMap).length} keys`,
        `credentialsRef=${config.credentialsRef}`,
      ].join("; "),
    });
    auditFromReceipt(receipt, "integration.connect", "integration");
    return receipt;
  },

  async sync(integrationId: string): Promise<ActionReceipt> {
    await mockDelay(240);
    const source = getTelemetrySource(integrationId);
    const config = getConnectorConfig(integrationId);
    appendSessionActivity({
      integrationId,
      kind: "sync",
      title: `Sync queued for ${source?.name ?? integrationId}`,
      detail: config
        ? `Pulling via ${config.endpoint} · scopes ${config.scopes.join(", ") || "default"}`
        : "No saved connector config — using catalog defaults",
    });
    const receipt = makeReceipt({
      outcome: "simulated",
      message: `Sync queued for ${source?.name ?? integrationId}`,
      connectorId: integrationId,
      connectorName: source?.name,
      targetType: "integration",
      targetId: integrationId,
      detail: config
        ? `endpoint=${config.endpoint}; credentialsRef=${config.credentialsRef}`
        : undefined,
    });
    auditFromReceipt(receipt, "integration.sync", "integration");
    return receipt;
  },

  async setHealth(
    integrationId: string,
    health: SourceHealth,
    reason?: DegradedReason,
  ): Promise<ActionReceipt> {
    await mockDelay(100);
    setSessionHealth(
      integrationId,
      health === "paused" ? "paused" : (health as IntegrationHealth),
    );
    const source = getTelemetrySource(integrationId);
    const degraded =
      health === "degraded" || health === "failed"
        ? reason ?? degradedReasons.default
        : null;
    appendSessionActivity({
      integrationId,
      kind: health === "failed" ? "error" : "health",
      title:
        health === "healthy"
          ? `Health restored for ${source?.name ?? integrationId}`
          : `Health set to ${health}`,
      detail: degraded
        ? `${degraded.summary} — ${degraded.detail}`
        : `effectiveHealth=${health}`,
    });
    const receipt = makeReceipt({
      outcome: "simulated",
      message: `Health set to ${health} for ${source?.name ?? integrationId}`,
      connectorId: integrationId,
      connectorName: source?.name,
      targetType: "integration",
      targetId: integrationId,
      detail: degraded
        ? `code=${degraded.code}; ${degraded.summary}`
        : undefined,
    });
    auditFromReceipt(receipt, "integration.health", "integration");
    return receipt;
  },

  async disconnect(integrationId: string): Promise<ActionReceipt> {
    await mockDelay(160);
    const source = getTelemetrySource(integrationId);
    removeConnectorConfig(integrationId);
    clearSessionHealth(integrationId);
    appendSessionActivity({
      integrationId,
      kind: "pause",
      title: `Disconnected ${source?.name ?? integrationId}`,
      detail: "Connector config cleared · historical events retained",
    });
    const receipt = makeReceipt({
      outcome: "simulated",
      message: `Disconnected ${source?.name ?? integrationId}`,
      connectorId: integrationId,
      connectorName: source?.name,
      targetType: "integration",
      targetId: integrationId,
    });
    auditFromReceipt(receipt, "integration.disconnect", "integration");
    return receipt;
  },

  getEffectiveHealth(integrationId: string): SourceHealth | null {
    const source = getTelemetrySource(integrationId);
    if (!source) return null;
    const overlay = getSessionHealth(integrationId);
    return overlay ? toSourceHealth(overlay) : source.health;
  },

  /** Simulated SSO IdP configuration receipt (Entra / Okta / Google). */
  async configureIdp(input: {
    provider: "entra" | "okta" | "google";
    tenantDomain?: string;
    metadataUrl?: string;
  }): Promise<ActionReceipt> {
    await mockDelay(280);
    const labels = {
      entra: "Microsoft Entra ID",
      okta: "Okta",
      google: "Google Workspace",
    } as const;
    const label = labels[input.provider];
    const receipt = makeReceipt({
      outcome: "simulated",
      message: `IdP configuration saved for ${label}`,
      connectorId: `idp-${input.provider}`,
      connectorName: label,
      targetType: "integration",
      targetId: `idp-${input.provider}`,
      detail: [
        input.tenantDomain ? `domain=${input.tenantDomain}` : null,
        input.metadataUrl ? `metadata=${input.metadataUrl}` : null,
      ]
        .filter(Boolean)
        .join("; "),
    });
    auditFromReceipt(receipt, "sso.configure_idp", "integration");
    return receipt;
  },
};
