import { getAlertsFromSession } from "@/components/alerts/alerts-session";
import {
  appendAuditLog,
  formatAuditTime,
  getAuditLogEntries,
} from "@/components/audit/audit-log-data";
import { getOverallScore } from "@/components/compliance/compliance-data";
import { openIncidentStatuses } from "@/components/incidents/incidents-data";
import { getIncidentsFromSession } from "@/components/incidents/incidents-session";
import { downloadTextFile } from "@/components/knowledge-base/download-text-file";
import { buildRoleOverview } from "@/components/overview/overview-data";
import { currentProfile } from "@/components/profile/profile-data";
import { vulnerabilities } from "@/components/vulnerabilities/vulnerabilities-data";
import { computeSocLatencyMetrics } from "@/lib/soc-metrics";
import {
  getIngestHealthSummary,
  sourceFamilyLabels,
  telemetrySources,
} from "@/lib/source-registry";

export function buildExecutiveBoardPackMarkdown() {
  const alerts = getAlertsFromSession();
  const incidents = getIncidentsFromSession();
  const overview = buildRoleOverview("c_level", { alerts, incidents });
  const score = getOverallScore();
  const ingest = getIngestHealthSummary();
  const openP1 = incidents.filter(
    (incident) =>
      incident.priority === "P1" &&
      openIncidentStatuses.includes(incident.status),
  );
  const topVulns = [...vulnerabilities]
    .sort((a, b) => b.cvss - a.cvss)
    .slice(0, 8);
  const recentAudit = getAuditLogEntries().slice(0, 8);

  const generatedAt = new Date().toISOString();

  const kpiLines = overview.kpis
    .map((kpi) => `- **${kpi.title}:** ${kpi.value} — ${kpi.context}`)
    .join("\n");

  const incidentLines =
    openP1.length === 0
      ? "- None open"
      : openP1
          .slice(0, 10)
          .map(
            (incident) =>
              `- ${incident.id} · ${incident.title} · ${incident.entityName} · open ${incident.ageLabel}`,
          )
          .join("\n");

  const vulnLines = topVulns
    .map(
      (finding) =>
        `- ${finding.cve} · ${finding.title} · CVSS ${finding.cvss} · ${finding.severity}`,
    )
    .join("\n");

  const insightLines = overview.insights
    .map((insight) => `- **${insight.title}:** ${insight.body}`)
    .join("\n");

  const auditLines =
    recentAudit.length === 0
      ? "- No recent audit activity"
      : recentAudit
          .map(
            (entry) =>
              `- ${formatAuditTime(entry.at)} · ${entry.actorName} · ${entry.action} · ${entry.targetId} — ${entry.detail}`,
          )
          .join("\n");

  const sourceLines = telemetrySources
    .map(
      (source) =>
        `- **${source.name}** (${sourceFamilyLabels[source.family]}) · ${source.health} · ${source.eps} EPS`,
    )
    .join("\n");

  const latency = computeSocLatencyMetrics(alerts, incidents);
  const slaBurn = incidents.filter((incident) => {
    if (!openIncidentStatuses.includes(incident.status)) return false;
    // Inline SLA risk: age vs priority targets
    const targets: Record<string, number> = {
      P1: 60,
      P2: 240,
      P3: 1440,
      P4: 4320,
    };
    const target = targets[incident.priority] ?? 1440;
    return incident.ageMinutes >= target * 0.75;
  });

  const familyCoverage = [
    ...new Set(telemetrySources.map((s) => sourceFamilyLabels[s.family])),
  ].join(", ");

  return `# Heimdall Executive Board Pack

Generated: ${generatedAt}
Author: Svalbard Security · Heimdall SOC
Prepared for: C-Level Suite

## Tools consolidated

Heimdall normalizes telemetry from existing security stack into one operations console.

- **Connected sources:** ${ingest.connected}/${ingest.total}
- **Healthy pipelines:** ${ingest.healthy}
- **Aggregate ingest:** ${ingest.totalEps} EPS
- **Families covered:** ${familyCoverage}

### Coverage by source

${sourceLines}

## Latency & SLA burn-down

- **MTTA:** ${latency.mttaLabel} (n=${latency.mttaSample})
- **MTTC:** ${latency.mttcLabel} (n=${latency.mttcSample})
- **Open cases at SLA risk (≥75% of target):** ${slaBurn.length}
${
  slaBurn.length === 0
    ? ""
    : slaBurn
        .slice(0, 8)
        .map(
          (i) =>
            `  - ${i.id} · ${i.priority} · ${i.title} · age ${i.ageLabel}`,
        )
        .join("\n")
}

## Posture snapshot

${kpiLines}

**Compliance score:** ${score}%

## Open critical incidents (P1)

${incidentLines}

## Top vulnerability risk

${vulnLines}

## Narrative insights

${insightLines}

## Recent audit activity

${auditLines}

## Recommended board talking points

1. Confirm ownership and ETA for each open P1.
2. Track MTTA / MTTC against prior quarter (${latency.mttaLabel} / ${latency.mttcLabel} this period).
3. Prioritize remediation for exploitable critical findings.
4. Keep audit evidence packs current ahead of the next control window.
5. Keep Splunk, Sentinel, Defender, and Okta visibility aligned in a single operational view.

---
*Confidential — Heimdall board pack*
`;
}

export function downloadExecutiveBoardPack() {
  const content = buildExecutiveBoardPackMarkdown();
  const filename = `heimdall-board-pack-${new Date().toISOString().slice(0, 10)}.md`;
  downloadTextFile({
    filename,
    content,
    mimeType: "text/markdown;charset=utf-8",
  });
  appendAuditLog({
    actorId: currentProfile.id,
    actorName: currentProfile.name,
    action: "report.board_pack",
    targetType: "report",
    targetId: "executive-board-pack",
    detail: `Downloaded ${filename}`,
  });
  return filename;
}
