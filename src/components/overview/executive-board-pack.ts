import { buildRoleOverview } from "@/components/overview/overview-data";
import { openIncidentStatuses } from "@/components/incidents/incidents-data";
import { getIncidentsFromSession } from "@/components/incidents/incidents-session";
import { getAlertsFromSession } from "@/components/alerts/alerts-session";
import { getOverallScore } from "@/components/compliance/compliance-data";
import { vulnerabilities } from "@/components/vulnerabilities/vulnerabilities-data";
import { downloadTextFile } from "@/components/knowledge-base/download-text-file";
import {
  appendAuditLog,
  formatAuditTime,
  getAuditLogEntries,
} from "@/components/audit/audit-log-data";
import { currentProfile } from "@/components/profile/profile-data";

export function buildExecutiveBoardPackMarkdown() {
  const alerts = getAlertsFromSession();
  const incidents = getIncidentsFromSession();
  const overview = buildRoleOverview("c_level", { alerts, incidents });
  const score = getOverallScore();
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

  return `# Heimdall Executive Board Pack

Generated: ${generatedAt}
Author: Svalbard Security · Heimdall SOC
Prepared for: C-Level Suite

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
2. Track MTTA / MTTC against prior quarter.
3. Prioritize remediation for exploitable critical findings.
4. Keep audit evidence packs current ahead of the next control window.

---
*Confidential — Heimdall demo board pack*
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
