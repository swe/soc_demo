import { administrationUsers } from "@/components/administration/users-data";
import {
  type AlertSeverity,
  socAlerts,
} from "@/components/alerts/alerts-data";
import { kbProcedures } from "@/components/knowledge-base/knowledge-base-data";

export type DetectionStatus = "enabled" | "disabled" | "experimental";

/** SIEM deploy pipeline stages for a detection rule. */
export type DetectionDeployState =
  | "draft"
  | "staged"
  | "validated"
  | "deployed"
  | "rolled_back";

export type DetectionDeployRecord = {
  id: string;
  sourceId: string;
  sourceName: string;
  stage: DetectionDeployState;
  at: string;
  version: number;
  detail?: string;
};

export type DetectionLineageSource =
  | "splunk"
  | "sentinel"
  | "heimdall"
  | "elastic";

export type DetectionTestHit = {
  id: string;
  timestamp: string;
  entity: string;
  source: string;
  severity: AlertSeverity;
  summary: string;
};

export type DetectionRule = {
  id: string;
  name: string;
  status: DetectionStatus;
  severity: AlertSeverity;
  mitreTactic: string;
  mitreTechnique: string;
  /** Additional mapped techniques (includes primary). */
  mitreTechniques: string[];
  lastTriggeredAt: string;
  alertCount: number;
  ownerId: string;
  ownerName: string;
  playbookId: string | null;
  playbookCode: string | null;
  summary: string;
  linkedAlertIds: string[];
  /** Heimdall QL rule body. */
  ruleBody: string;
  splLineage?: string;
  kqlLineage?: string;
  lineageSource?: DetectionLineageSource;
  enabledSourceIds: string[];
  /** SIEM deploy pipeline */
  deployState: DetectionDeployState;
  deployedSourceIds: string[];
  lastDeployAt: string | null;
  deployVersion: number;
  deployHistory: DetectionDeployRecord[];
};

export const detectionStatusLabels: Record<DetectionStatus, string> = {
  enabled: "Enabled",
  disabled: "Disabled",
  experimental: "Experimental",
};

export const detectionDeployStateLabels: Record<DetectionDeployState, string> = {
  draft: "Draft",
  staged: "Staged",
  validated: "Validated",
  deployed: "Deployed",
  rolled_back: "Rolled back",
};

export const lineageSourceLabels: Record<DetectionLineageSource, string> = {
  splunk: "Derived from Splunk correlation search",
  sentinel: "Derived from Sentinel analytics rule",
  heimdall: "Native Heimdall QL detection",
  elastic: "Derived from Elastic detection rule",
};

const sourcePools: string[][] = [
  ["int-splunk-core", "int-okta-workforce", "int-sentinel-workspace"],
  ["int-defender-endpoint", "int-crowdstrike-falcon", "int-splunk-core"],
  ["int-aws-prod", "int-chronicle-secops", "int-splunk-core"],
  ["int-okta-workforce", "int-sentinel-workspace", "int-elastic-security"],
  ["int-palo-edge", "int-splunk-core", "int-defender-endpoint"],
];

const lineageCycle: DetectionLineageSource[] = [
  "sentinel",
  "splunk",
  "heimdall",
  "elastic",
  "heimdall",
  "sentinel",
];

function hashString(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function buildHeimdallQl(name: string, technique: string, tactic: string) {
  const safeName = name.replace(/"/g, '\\"').slice(0, 72);
  return [
    `// Heimdall QL — ${safeName}`,
    `events`,
    `  | where mitre.technique == "${technique}"`,
    `  | where mitre.tactic =~ "${tactic}"`,
    `  | where risk_score >= 60 or confidence >= 70`,
    `  | summarize event_count=count(), entities=dcount(entity.id) by entity.name, source.id`,
    `  | where event_count >= 3`,
    `  | project entity.name, source.id, event_count, entities`,
  ].join("\n");
}

function buildSplLineage(name: string, technique: string) {
  return [
    `index=security OR index=auth`,
    `| search "${name.slice(0, 40).replace(/"/g, "")}" OR technique=${technique}`,
    `| stats count by user, dest, sourcetype`,
    `| where count > 5`,
  ].join("\n");
}

function buildKqlLineage(technique: string, tactic: string) {
  return [
    `SecurityAlert`,
    `| where TimeGenerated > ago(24h)`,
    `| where tostring(ExtendedProperties.Technique) == "${technique}"`,
    `  or AlertSeverity in ("High","Medium")`,
    `| where tostring(ExtendedProperties.Tactic) has "${tactic.split(" ")[0]}"`,
    `| summarize Alerts=count() by CompromisedEntity, ProviderName`,
  ].join("\n");
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

  // Full alert-corpus seed (no artificial cap). Pack imports append more via session.
  const rules: DetectionRule[] = Array.from(byRule.entries())
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
      const lineageSource = lineageCycle[hash % lineageCycle.length]!;
      const enabledSourceIds = sourcePools[hash % sourcePools.length]!;
      const secondaryTech =
        hash % 5 === 0
          ? hash % 2 === 0
            ? "T1078"
            : "T1110"
          : null;
      const mitreTechniques = secondaryTech
        ? [row.mitreTechnique, secondaryTech]
        : [row.mitreTechnique];

      const rule: DetectionRule = {
        id: `DET-${String(index + 1).padStart(4, "0")}`,
        name,
        status,
        severity: row.severity,
        mitreTactic: row.mitreTactic,
        mitreTechnique: row.mitreTechnique,
        mitreTechniques,
        lastTriggeredAt: row.lastTriggeredAt,
        alertCount: row.alertIds.length,
        ownerId: owner?.id ?? "ava-reed",
        ownerName: owner?.name ?? "Ava Reed",
        playbookId: playbook?.id ?? null,
        playbookCode: playbook?.code ?? null,
        summary: `Detection for ${row.mitreTechnique} (${row.mitreTactic}) — ${row.alertIds.length} linked alerts in catalog.`,
        linkedAlertIds: row.alertIds.slice(0, 8),
        ruleBody: buildHeimdallQl(name, row.mitreTechnique, row.mitreTactic),
        enabledSourceIds: [...enabledSourceIds],
        lineageSource,
        deployState:
          status === "enabled"
            ? "deployed"
            : status === "experimental"
              ? "draft"
              : "rolled_back",
        deployedSourceIds:
          status === "enabled" ? [enabledSourceIds[0]!].filter(Boolean) : [],
        lastDeployAt: status === "enabled" ? row.lastTriggeredAt : null,
        deployVersion: status === "enabled" ? 1 + (hash % 4) : 0,
        deployHistory: [],
      };

      if (lineageSource === "splunk") {
        rule.splLineage = buildSplLineage(name, row.mitreTechnique);
      } else if (lineageSource === "sentinel") {
        rule.kqlLineage = buildKqlLineage(row.mitreTechnique, row.mitreTactic);
      } else if (lineageSource === "elastic") {
        rule.splLineage = buildSplLineage(name, row.mitreTechnique);
        rule.kqlLineage = buildKqlLineage(row.mitreTechnique, row.mitreTactic);
      }

      return rule;
    })
    .sort((a, b) => b.alertCount - a.alertCount);

  return rules;
}

export const detectionRules: DetectionRule[] = buildCatalog();

export function getDetectionById(id: string) {
  return detectionRules.find((rule) => rule.id === id) ?? null;
}

export function getDetectionStats(rules: DetectionRule[] = detectionRules) {
  const techniques = new Set<string>();
  for (const rule of rules) {
    if (rule.status === "disabled") continue;
    for (const tech of rule.mitreTechniques) {
      techniques.add(tech);
    }
    if (rule.mitreTechnique) techniques.add(rule.mitreTechnique);
  }
  return {
    total: rules.length,
    enabled: rules.filter((r) => r.status === "enabled").length,
    experimental: rules.filter((r) => r.status === "experimental").length,
    disabled: rules.filter((r) => r.status === "disabled").length,
    criticalCoverage: rules.filter(
      (r) => r.severity === "critical" && r.status === "enabled",
    ).length,
    /** Distinct MITRE techniques covered by non-disabled rules. */
    mitreTechniquesCovered: techniques.size,
  };
}

/** Canned test-run hits for the Detection IDE (mock only). */
export function runDetectionTest(rule: DetectionRule): DetectionTestHit[] {
  const seed = hashString(rule.id + rule.name);
  const entities = [
    "farid.tamin@svalbard.ca",
    "WS-SOC-0007",
    "srv-ci-07",
    "10.24.8.91",
    "nia.berger@svalbard.ca",
    "LAP-ENG-0042",
  ];
  const sources = rule.enabledSourceIds.length
    ? rule.enabledSourceIds
    : ["int-splunk-core"];
  const severities: AlertSeverity[] = ["critical", "high", "medium", "low"];
  const count = 3 + (seed % 4);

  return Array.from({ length: count }, (_, i) => {
    const ts = new Date(Date.now() - (i * 7 + (seed % 5)) * 60_000);
    return {
      id: `HIT-${rule.id}-${i + 1}`,
      timestamp: ts.toISOString(),
      entity: entities[(seed + i) % entities.length]!,
      source: sources[i % sources.length]!,
      severity: severities[(seed + i) % Math.min(3, severities.length)]!,
      summary: `Matched ${rule.mitreTechnique} pattern — ${rule.name.slice(0, 48)}`,
    };
  });
}

/**
 * Test a detection against the mock alert corpus (linked alerts +
 * technique / rule-name matches). Returns hit count via array length + sample rows.
 */
export function testRuleAgainstAlertCorpus(
  rule: DetectionRule,
): DetectionTestHit[] {
  const linked = new Set(rule.linkedAlertIds);
  const nameNeedle = rule.name.trim().toLowerCase();
  const matches = socAlerts.filter((alert) => {
    if (linked.has(alert.id)) return true;
    if (alert.ruleName.trim() === rule.name.trim()) return true;
    if (alert.mitreTechnique && rule.mitreTechniques.includes(alert.mitreTechnique))
      return true;
    if (
      nameNeedle.length > 12 &&
      alert.title.toLowerCase().includes(nameNeedle.slice(0, 24))
    )
      return true;
    return false;
  });

  const ranked = matches
    .slice()
    .sort((a, b) => {
      const aLinked = linked.has(a.id) ? 1 : 0;
      const bLinked = linked.has(b.id) ? 1 : 0;
      if (aLinked !== bLinked) return bLinked - aLinked;
      return a.createdAt < b.createdAt ? 1 : -1;
    })
    .slice(0, 12);

  if (ranked.length === 0) {
    return runDetectionTest(rule);
  }

  return ranked.map((alert, index) => ({
    id: `CORPUS-${rule.id}-${alert.id}`,
    timestamp: alert.createdAt,
    entity: alert.entityName,
    source:
      alert.sourceId ||
      rule.enabledSourceIds[
        index % Math.max(rule.enabledSourceIds.length, 1)
      ] ||
      "int-splunk-core",
    severity: alert.severity,
    summary: alert.title,
  }));
}

export function buildInvestigateQueryForRule(rule: DetectionRule) {
  return rule.ruleBody.trim().length > 0
    ? rule.ruleBody
    : `events | where rule.id == "${rule.id}" or mitre.technique == "${rule.mitreTechnique}" | take 50`;
}

export function buildBlankDetection(partial?: Partial<DetectionRule>): DetectionRule {
  const name = partial?.name ?? "New Heimdall detection";
  const technique = partial?.mitreTechnique ?? "T1059";
  const tactic = partial?.mitreTactic ?? "Execution";
  return {
    id: partial?.id ?? "DET-NEW",
    name,
    status: partial?.status ?? "experimental",
    severity: partial?.severity ?? "medium",
    mitreTactic: tactic,
    mitreTechnique: technique,
    mitreTechniques: partial?.mitreTechniques ?? [technique],
    lastTriggeredAt: partial?.lastTriggeredAt ?? new Date().toISOString(),
    alertCount: partial?.alertCount ?? 0,
    ownerId: partial?.ownerId ?? "ava-reed",
    ownerName: partial?.ownerName ?? "Ava Reed",
    playbookId: partial?.playbookId ?? null,
    playbookCode: partial?.playbookCode ?? null,
    summary:
      partial?.summary ??
      `Draft detection for ${technique} (${tactic}) — not yet published.`,
    linkedAlertIds: partial?.linkedAlertIds ?? [],
    ruleBody:
      partial?.ruleBody ?? buildHeimdallQl(name, technique, tactic),
    splLineage: partial?.splLineage,
    kqlLineage: partial?.kqlLineage,
    lineageSource: partial?.lineageSource ?? "heimdall",
    enabledSourceIds: partial?.enabledSourceIds ?? [
      "int-splunk-core",
      "int-sentinel-workspace",
    ],
    deployState: partial?.deployState ?? "draft",
    deployedSourceIds: partial?.deployedSourceIds ?? [],
    lastDeployAt: partial?.lastDeployAt ?? null,
    deployVersion: partial?.deployVersion ?? 0,
    deployHistory: partial?.deployHistory ?? [],
  };
}
