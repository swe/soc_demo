import {
  type AlertSeverity,
  socAlerts,
} from "@/components/alerts/alerts-data";
import { administrationUsers } from "@/components/administration/users-data";
import { kbProcedures } from "@/components/knowledge-base/knowledge-base-data";

export type DetectionStatus = "enabled" | "disabled" | "experimental";

export type DetectionRule = {
  id: string;
  name: string;
  status: DetectionStatus;
  severity: AlertSeverity;
  mitreTactic: string;
  mitreTechnique: string;
  lastTriggeredAt: string;
  alertCount: number;
  ownerId: string;
  ownerName: string;
  playbookId: string | null;
  playbookCode: string | null;
  summary: string;
  linkedAlertIds: string[];
};

export const detectionStatusLabels: Record<DetectionStatus, string> = {
  enabled: "Enabled",
  disabled: "Disabled",
  experimental: "Experimental",
};

function hashString(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function buildCatalog(): DetectionRule[] {
  const byRule = new Map<
    string,
    {
      name: string;
      severity: AlertSeverity;
      mitreTactic: string;
      mitreTechnique: string;
      lastTriggeredAt: string;
      alertIds: string[];
    }
  >();

  for (const alert of socAlerts) {
    const key = alert.ruleName.trim() || alert.title;
    const existing = byRule.get(key);
    if (!existing) {
      byRule.set(key, {
        name: key,
        severity: alert.severity,
        mitreTactic: alert.mitreTactic ?? "Execution",
        mitreTechnique: alert.mitreTechnique ?? "T1059",
        lastTriggeredAt: alert.createdAt,
        alertIds: [alert.id],
      });
      continue;
    }
    existing.alertIds.push(alert.id);
    if (alert.createdAt > existing.lastTriggeredAt) {
      existing.lastTriggeredAt = alert.createdAt;
    }
    const severityRank = { critical: 4, high: 3, medium: 2, low: 1 };
    if (severityRank[alert.severity] > severityRank[existing.severity]) {
      existing.severity = alert.severity;
    }
  }

  const owners = administrationUsers.filter((user) =>
    ["Admin", "Analyst"].includes(user.role),
  );
  const playbooks = kbProcedures.filter((p) => p.status === "approved");

  const rules: DetectionRule[] = Array.from(byRule.entries())
    .slice(0, 80)
    .map(([name, row], index) => {
      const hash = hashString(name);
      const owner = owners[hash % owners.length] ?? administrationUsers[0];
      const playbook =
        hash % 3 === 0 ? playbooks[hash % playbooks.length] : null;
      const status: DetectionStatus =
        hash % 11 === 0
          ? "disabled"
          : hash % 7 === 0
            ? "experimental"
            : "enabled";

      return {
        id: `DET-${String(index + 1).padStart(4, "0")}`,
        name,
        status,
        severity: row.severity,
        mitreTactic: row.mitreTactic,
        mitreTechnique: row.mitreTechnique,
        lastTriggeredAt: row.lastTriggeredAt,
        alertCount: row.alertIds.length,
        ownerId: owner?.id ?? "ava-reed",
        ownerName: owner?.name ?? "Ava Reed",
        playbookId: playbook?.id ?? null,
        playbookCode: playbook?.code ?? null,
        summary: `Detection for ${row.mitreTechnique} (${row.mitreTactic}) — ${row.alertIds.length} linked alerts in catalog.`,
        linkedAlertIds: row.alertIds.slice(0, 8),
      };
    })
    .sort((a, b) => b.alertCount - a.alertCount);

  return rules;
}

export const detectionRules: DetectionRule[] = buildCatalog();

export function getDetectionById(id: string) {
  return detectionRules.find((rule) => rule.id === id) ?? null;
}

export function getDetectionStats(rules: DetectionRule[] = detectionRules) {
  return {
    total: rules.length,
    enabled: rules.filter((r) => r.status === "enabled").length,
    experimental: rules.filter((r) => r.status === "experimental").length,
    disabled: rules.filter((r) => r.status === "disabled").length,
    criticalCoverage: rules.filter(
      (r) => r.severity === "critical" && r.status === "enabled",
    ).length,
  };
}
