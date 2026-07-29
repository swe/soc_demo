import {
  administrationUsers,
  getAdministrationUserStats,
  isAdministrationRiskUser,
} from "@/components/administration/users-data";
import {
  currentAnalystId,
  getAlertStats,
  getAlertsOverTime,
  getSeverityBreakdown,
  getStatusBreakdown,
  openAlertStatuses,
  socAlerts,
  type SocAlert,
} from "@/components/alerts/alerts-data";
import {
  complianceFindings,
  complianceFrameworks,
  complianceScoreTrend,
  getComplianceStats,
  getOverallScore,
} from "@/components/compliance/compliance-data";
import {
  currentAnalystId as incidentAnalystId,
  getIncidentSlaState,
  getIncidentStats,
  getIncidentsOverTime,
  openIncidentStatuses,
  socIncidents,
  type SocIncident,
} from "@/components/incidents/incidents-data";
import {
  getFindingOverviewStats,
  vulnerabilities,
} from "@/components/vulnerabilities/vulnerabilities-data";
import type { SocJobRole } from "@/lib/soc-roles";

export type OverviewKpi = {
  key: string;
  title: string;
  value: string;
  context: string;
  delta?: number;
  preferLower?: boolean;
  spark: number[];
};

export type OverviewQueueItem = {
  id: string;
  title: string;
  meta: string;
  href: string;
  tone?: "critical" | "high" | "medium" | "low" | "neutral";
  subtitle?: string;
};

export type OverviewShortcut = {
  label: string;
  href: string;
  description: string;
};

export type OverviewChartKind = "alerts" | "incidents" | "compliance";

export type OverviewInsight = {
  title: string;
  body: string;
  href?: string;
  tone: "info" | "warn" | "ok";
};

export type OverviewBreakdownItem = {
  key: string;
  label: string;
  value: number;
  color: string;
};

export type OverviewBreakdown = {
  title: string;
  items: OverviewBreakdownItem[];
};

export type RoleOverviewModel = {
  headline: string;
  subhead: string;
  kpis: OverviewKpi[];
  chartKind: OverviewChartKind;
  chartTitle: string;
  chartDescription: string;
  queueTitle: string;
  queue: OverviewQueueItem[];
  shortcuts: OverviewShortcut[];
  insights: OverviewInsight[];
  primaryBreakdown: OverviewBreakdown;
  secondaryBreakdown: OverviewBreakdown;
};

const SEV_COLORS = {
  critical: "#dc2626",
  high: "#ea580c",
  medium: "#d97706",
  low: "#2563eb",
} as const;

const PRI_COLORS = {
  p1: "#dc2626",
  p2: "#ea580c",
  p3: "#d97706",
  p4: "#2563eb",
} as const;

function takeAlerts(
  alerts: readonly SocAlert[],
  predicate: (a: SocAlert) => boolean,
  limit = 6,
): SocAlert[] {
  const out: SocAlert[] = [];
  for (const alert of alerts) {
    if (predicate(alert)) {
      out.push(alert);
      if (out.length >= limit) break;
    }
  }
  return out;
}

function takeIncidents(
  incidents: readonly SocIncident[],
  predicate: (i: SocIncident) => boolean,
  limit = 6,
): SocIncident[] {
  return incidents.filter(predicate).slice(0, limit);
}

function alertHref(id: string) {
  return `/alerts/${id}`;
}

function incidentHref(id: string) {
  return `/incidents/${id}`;
}

function alertMeta(alert: SocAlert) {
  return `${alert.severity.toUpperCase()} · ${alert.status}`;
}

function incidentMeta(incident: SocIncident) {
  return `${incident.priority} · ${incident.status}`;
}

function alertSpark(): number[] {
  return getAlertsOverTime("14d").map(
    (d) => d.critical + d.high + d.medium + d.low,
  );
}

function criticalAlertSpark(): number[] {
  return getAlertsOverTime("14d").map((d) => d.critical + d.high);
}

function incidentSpark(): number[] {
  return getIncidentsOverTime("14d").map((d) => d.p1 + d.p2 + d.p3 + d.p4);
}

function p1Spark(): number[] {
  return getIncidentsOverTime("14d").map((d) => d.p1);
}

function complianceSpark(): number[] {
  return complianceScoreTrend.map((d) => d.score);
}

function severityBreakdown(alerts: readonly SocAlert[]): OverviewBreakdown {
  return {
    title: "Alert severity mix",
    items: getSeverityBreakdown(alerts).map((row) => ({
      key: row.severity,
      label: row.label,
      value: row.count,
      color: SEV_COLORS[row.severity],
    })),
  };
}

function statusBreakdown(alerts: readonly SocAlert[]): OverviewBreakdown {
  const rows = getStatusBreakdown(alerts).filter((r) =>
    ["new", "triaging", "investigating", "escalated"].includes(r.status),
  );
  const palette = ["#2563eb", "#d97706", "#7c3aed", "#dc2626"];
  return {
    title: "Open alert pipeline",
    items: rows.map((row, i) => ({
      key: row.status,
      label: row.label,
      value: row.count,
      color: palette[i % palette.length]!,
    })),
  };
}

function incidentPriorityBreakdown(
  incidents: readonly SocIncident[],
): OverviewBreakdown {
  const open = incidents.filter((i) =>
    openIncidentStatuses.includes(i.status),
  );
  const counts = { p1: 0, p2: 0, p3: 0, p4: 0 };
  for (const i of open) {
    if (i.priority === "P1") counts.p1 += 1;
    else if (i.priority === "P2") counts.p2 += 1;
    else if (i.priority === "P3") counts.p3 += 1;
    else counts.p4 += 1;
  }
  return {
    title: "Active incidents by priority",
    items: [
      { key: "p1", label: "P1", value: counts.p1, color: PRI_COLORS.p1 },
      { key: "p2", label: "P2", value: counts.p2, color: PRI_COLORS.p2 },
      { key: "p3", label: "P3", value: counts.p3, color: PRI_COLORS.p3 },
      { key: "p4", label: "P4", value: counts.p4, color: PRI_COLORS.p4 },
    ],
  };
}

function frameworkBreakdown(): OverviewBreakdown {
  const statusColor: Record<string, string> = {
    certified: "#16a34a",
    "in-audit": "#2563eb",
    remediation: "#ea580c",
    monitoring: "#7c3aed",
    "gap-analysis": "#dc2626",
  };
  const byStatus = new Map<string, number>();
  for (const f of complianceFrameworks) {
    byStatus.set(f.status, (byStatus.get(f.status) ?? 0) + 1);
  }
  return {
    title: "Framework status",
    items: [...byStatus.entries()].map(([status, value]) => ({
      key: status,
      label: status.replace(/-/g, " "),
      value,
      color: statusColor[status] ?? "#71717a",
    })),
  };
}

function vulnSeverityBreakdown(): OverviewBreakdown {
  const counts = { critical: 0, high: 0, medium: 0, low: 0 };
  for (const v of vulnerabilities) {
    if (v.severity in counts) counts[v.severity as keyof typeof counts] += 1;
  }
  return {
    title: "Vulnerability severity",
    items: (["critical", "high", "medium", "low"] as const).map((sev) => ({
      key: sev,
      label: sev.charAt(0).toUpperCase() + sev.slice(1),
      value: counts[sev],
      color: SEV_COLORS[sev],
    })),
  };
}

function withSpark(
  kpi: Omit<OverviewKpi, "spark">,
  spark: number[],
): OverviewKpi {
  return { ...kpi, spark };
}

export type OverviewSessionCatalogs = {
  alerts?: readonly SocAlert[];
  incidents?: readonly SocIncident[];
};

export function buildRoleOverview(
  role: SocJobRole,
  catalogs: OverviewSessionCatalogs = {},
): RoleOverviewModel {
  const alerts = catalogs.alerts ?? socAlerts;
  const incidents = catalogs.incidents ?? socIncidents;
  const alertStats = getAlertStats(alerts);
  const incidentStats = getIncidentStats(incidents);
  const complianceStats = getComplianceStats();
  const vulnStats = getFindingOverviewStats();
  const userStats = getAdministrationUserStats(administrationUsers);
  const riskUsers = administrationUsers.filter(isAdministrationRiskUser).length;
  const score = getOverallScore();
  const openFindings = complianceFindings.filter(
    (f) => f.status !== "remediated" && f.status !== "accepted",
  ).length;
  const nextFramework = complianceFrameworks.reduce((soonest, framework) =>
    framework.daysToMilestone < soonest.daysToMilestone ? framework : soonest,
  );
  const slaRiskIncidents = takeIncidents(incidents, (i) => {
    if (!openIncidentStatuses.includes(i.status)) return false;
    const sla = getIncidentSlaState(i);
    return sla === "at-risk" || sla === "breached";
  });
  const criticalIncidents = takeIncidents(
    incidents,
    (i) => openIncidentStatuses.includes(i.status) && i.priority === "P1",
  );
  const myTriage = takeAlerts(
    alerts,
    (a) =>
      openAlertStatuses.includes(a.status) &&
      (a.assigneeId === currentAnalystId ||
        a.status === "new" ||
        a.status === "triaging"),
  );
  const myInvestigations = takeAlerts(
    alerts,
    (a) =>
      a.assigneeId === currentAnalystId &&
      (a.status === "investigating" || a.status === "escalated"),
  );
  const myIncidents = takeIncidents(
    incidents,
    (i) =>
      i.assigneeId === incidentAnalystId &&
      openIncidentStatuses.includes(i.status),
  );
  const exploitableVulns = vulnerabilities
    .filter((v) => v.exploitable && v.severity === "critical")
    .slice(0, 6);
  const zeroDayish = vulnerabilities
    .filter((v) => v.exploitable && v.linkedIncidentIds.length > 0)
    .slice(0, 6);

  const sparks = {
    alerts: alertSpark(),
    critical: criticalAlertSpark(),
    incidents: incidentSpark(),
    p1: p1Spark(),
    compliance: complianceSpark(),
  };

  switch (role) {
    case "c_level":
      return {
        headline: "Executive security posture",
        subhead:
          "Board-ready view of risk, response speed, and compliance health.",
        chartKind: "compliance",
        chartTitle: "Compliance score trend",
        chartDescription: "Monthly posture vs target — board narrative ready",
        kpis: [
          withSpark(
            {
              key: "score",
              title: "Compliance score",
              value: `${score}%`,
              context: "overall control posture",
              delta: 2.4,
              preferLower: false,
            },
            sparks.compliance,
          ),
          withSpark(
            {
              key: "p1",
              title: "Critical incidents",
              value:
                incidentStats.find((s) => s.key === "p1-open")?.value ?? "—",
              context: "P1 open cases",
              delta: 9.1,
              preferLower: true,
            },
            sparks.p1,
          ),
          withSpark(
            {
              key: "mtta",
              title: "MTTA",
              value: alertStats.find((s) => s.key === "mtta")?.value ?? "—",
              context: "mean time to acknowledge",
              delta: -6.2,
              preferLower: true,
            },
            sparks.alerts,
          ),
          withSpark(
            {
              key: "mttc",
              title: "MTTC",
              value:
                incidentStats.find((s) => s.key === "mttc")?.value ?? "—",
              context: "mean time to contain",
              preferLower: true,
            },
            sparks.incidents,
          ),
        ],
        queueTitle: "Open critical incidents",
        queue: criticalIncidents.map((i) => ({
          id: i.id,
          title: i.title,
          meta: incidentMeta(i),
          subtitle: i.entityName,
          href: incidentHref(i.id),
          tone: "critical" as const,
        })),
        shortcuts: [
          {
            label: "Compliance",
            href: "/compliance",
            description: "Framework posture and audit milestones",
          },
          {
            label: "Reports",
            href: "/knowledge-base/reports",
            description: "Executive and audit-ready packs",
          },
          {
            label: "Vuln risk overview",
            href: "/vulnerabilities",
            description: "Backlog health and exposure trend",
          },
        ],
        insights: [
          {
            title: "Posture improving",
            body: `Compliance score is ${score}% with an upward monthly trend toward the ${complianceScoreTrend[0] ? "85%" : "target"} goal.`,
            href: "/compliance",
            tone: "ok",
          },
          {
            title: "Critical response",
            body: `${criticalIncidents.length} P1 incidents remain open — review containment status before the next exec sync.`,
            href: "/incidents",
            tone: criticalIncidents.length > 0 ? "warn" : "ok",
          },
          {
            title: "Next audit window",
            body: `${nextFramework.name} milestone in ${nextFramework.daysToMilestone} days.`,
            href: "/compliance",
            tone: "info",
          },
        ],
        primaryBreakdown: frameworkBreakdown(),
        secondaryBreakdown: incidentPriorityBreakdown(incidents),
      };

    case "ciso":
      return {
        headline: "Risk digest",
        subhead:
          "Vulnerability backlog, compliance gaps, and access risk at a glance.",
        chartKind: "compliance",
        chartTitle: "Compliance score trend",
        chartDescription: "Control posture vs target with monthly movement",
        kpis: [
          withSpark(
            {
              key: "score",
              title: "Compliance score",
              value: `${score}%`,
              context: complianceStats[0]?.context ?? "vs last month",
              delta: 2.4,
              preferLower: false,
            },
            sparks.compliance,
          ),
          withSpark(
            {
              key: "findings",
              title: "Open compliance findings",
              value: String(openFindings),
              context: "remediation still open",
              preferLower: true,
            },
            sparks.compliance,
          ),
          withSpark(
            {
              key: "exploitable",
              title: "Exploitable vulns",
              value:
                vulnStats.find((s) => s.key === "exploitable")?.value ?? "—",
              context: "priority exposure",
              preferLower: true,
            },
            sparks.critical,
          ),
          withSpark(
            {
              key: "mfa-risk",
              title: "Access risk users",
              value: String(riskUsers),
              context: `${userStats.mfaCoverage}% MFA coverage`,
              preferLower: true,
            },
            sparks.alerts,
          ),
        ],
        queueTitle: "Priority vulnerability exposure",
        queue: exploitableVulns.map((v) => ({
          id: v.id,
          title: v.title,
          meta: `${v.severity.toUpperCase()} · priority ${v.socPriority}`,
          subtitle: v.cve,
          href: `/vulnerabilities/findings?id=${encodeURIComponent(v.id)}`,
          tone: v.severity === "critical" ? "critical" : "high",
        })),
        shortcuts: [
          {
            label: "Vulnerability overview",
            href: "/vulnerabilities",
            description: "Risk digest and backlog health",
          },
          {
            label: "Threat intelligence",
            href: "/threat-intelligence",
            description: "Actors, campaigns, and dark web",
          },
          {
            label: "User management",
            href: "/administration/users",
            description: "Privileged access and MFA gaps",
          },
          {
            label: "Compliance",
            href: "/compliance",
            description: "Controls and evidence risk",
          },
        ],
        insights: [
          {
            title: "Exploit window",
            body: `${exploitableVulns.length} critical exploitable findings need owner assignment this week.`,
            href: "/vulnerabilities/findings",
            tone: "warn",
          },
          {
            title: "Identity risk",
            body: `${riskUsers} users lack MFA or hold elevated access without hardening.`,
            href: "/administration/users",
            tone: riskUsers > 0 ? "warn" : "ok",
          },
          {
            title: "Control gaps",
            body: `${openFindings} compliance findings remain open ahead of ${nextFramework.shortName}.`,
            href: "/compliance",
            tone: "info",
          },
        ],
        primaryBreakdown: vulnSeverityBreakdown(),
        secondaryBreakdown: frameworkBreakdown(),
      };

    case "soc_manager":
      return {
        headline: "Operations command",
        subhead: "Queue depth, SLA risk, and team workload across the SOC.",
        chartKind: "alerts",
        chartTitle: "Alert volume (14d)",
        chartDescription: "Stacked daily totals by severity across the SOC",
        kpis: [
          withSpark(
            {
              key: "open-alerts",
              title: "Open alerts",
              value: alertStats.find((s) => s.key === "open")?.value ?? "—",
              context: "new → escalated",
              delta: 8.4,
              preferLower: true,
            },
            sparks.alerts,
          ),
          withSpark(
            {
              key: "active",
              title: "Active incidents",
              value:
                incidentStats.find((s) => s.key === "active")?.value ?? "—",
              context: "in response lifecycle",
              preferLower: true,
            },
            sparks.incidents,
          ),
          withSpark(
            {
              key: "sla",
              title: "SLA at risk",
              value: String(slaRiskIncidents.length),
              context: "breached or approaching",
              preferLower: true,
            },
            sparks.p1,
          ),
          withSpark(
            {
              key: "online",
              title: "Analysts online",
              value: String(userStats.activeUsers),
              context: `of ${userStats.totalUsers} workspace users`,
              preferLower: false,
            },
            sparks.alerts,
          ),
        ],
        queueTitle: "SLA risk incidents",
        queue: slaRiskIncidents.map((i) => ({
          id: i.id,
          title: i.title,
          meta: incidentMeta(i),
          subtitle: i.entityName,
          href: incidentHref(i.id),
          tone: "high" as const,
        })),
        shortcuts: [
          {
            label: "Alerts",
            href: "/alerts",
            description: "Triage and escalate the inbound queue",
          },
          {
            label: "Incidents",
            href: "/incidents",
            description: "Active cases and containment status",
          },
          {
            label: "User management",
            href: "/administration/users",
            description: "Staffing and access roles",
          },
          {
            label: "Integrations",
            href: "/administration/integrations",
            description: "Detection and response tooling",
          },
        ],
        insights: [
          {
            title: "SLA pressure",
            body: `${slaRiskIncidents.length} incidents are at-risk or breached — rebalance ownership if needed.`,
            href: "/incidents",
            tone: slaRiskIncidents.length > 0 ? "warn" : "ok",
          },
          {
            title: "Coverage",
            body: `${userStats.activeUsers} analysts online of ${userStats.totalUsers} — check Tier-1 capacity on the inbound queue.`,
            href: "/administration/users",
            tone: "info",
          },
          {
            title: "Escalations",
            body: `${alertStats.find((s) => s.key === "escalated")?.value ?? "0"} alerts currently on the incident track.`,
            href: "/alerts",
            tone: "info",
          },
        ],
        primaryBreakdown: severityBreakdown(alerts),
        secondaryBreakdown: statusBreakdown(alerts),
      };

    case "analyst_t1":
      return {
        headline: "Triage queue",
        subhead:
          "Acknowledge new alerts, follow procedures, and escalate cleanly.",
        chartKind: "alerts",
        chartTitle: "Inbound alert volume",
        chartDescription: "What is landing in triage over the last two weeks",
        kpis: [
          withSpark(
            {
              key: "new",
              title: "Open alerts",
              value: alertStats.find((s) => s.key === "open")?.value ?? "—",
              context: "awaiting triage",
              preferLower: true,
            },
            sparks.alerts,
          ),
          withSpark(
            {
              key: "critical",
              title: "Critical open",
              value:
                alertStats.find((s) => s.key === "critical-open")?.value ??
                "—",
              context: "needs immediate attention",
              preferLower: true,
            },
            sparks.critical,
          ),
          withSpark(
            {
              key: "mtta",
              title: "MTTA",
              value: alertStats.find((s) => s.key === "mtta")?.value ?? "—",
              context: "acknowledge target",
              preferLower: true,
            },
            sparks.alerts,
          ),
          withSpark(
            {
              key: "escalated",
              title: "Escalated",
              value:
                alertStats.find((s) => s.key === "escalated")?.value ?? "—",
              context: "handed to investigations",
              preferLower: true,
            },
            sparks.critical,
          ),
        ],
        queueTitle: "My triage queue",
        queue: myTriage.map((a) => ({
          id: a.id,
          title: a.title,
          meta: alertMeta(a),
          subtitle: a.entityName,
          href: alertHref(a.id),
          tone: a.severity,
        })),
        shortcuts: [
          {
            label: "Alert list",
            href: "/alerts/list",
            description: "Full triage workspace",
          },
          {
            label: "Procedures",
            href: "/knowledge-base/procedures",
            description: "Playbooks for common alert types",
          },
          {
            label: "Assets",
            href: "/assets/devices",
            description: "Lookup hosts and identities",
          },
        ],
        insights: [
          {
            title: "Start with critical",
            body: "Work critical and high severity first, then clear new mediums using the matching procedure.",
            href: "/alerts/list",
            tone: "warn",
          },
          {
            title: "Escalate cleanly",
            body: "Attach entity context and recommended action before handing off to Tier-2.",
            href: "/knowledge-base/procedures",
            tone: "info",
          },
          {
            title: "False positives",
            body: `Current FP rate is ${alertStats.find((s) => s.key === "false-positive")?.value ?? "—"}. Mark FPs to keep MTTA healthy.`,
            href: "/alerts/list",
            tone: "ok",
          },
        ],
        primaryBreakdown: severityBreakdown(alerts),
        secondaryBreakdown: statusBreakdown(alerts),
      };

    case "analyst_t2":
      return {
        headline: "Investigation desk",
        subhead:
          "Own escalated cases, correlate assets and vulns, and use intel indicators.",
        chartKind: "incidents",
        chartTitle: "Incident intake by priority",
        chartDescription: "Active case creation pressure over 14 days",
        kpis: [
          withSpark(
            {
              key: "investigating",
              title: "My investigations",
              value: String(myInvestigations.length),
              context: "assigned open alerts",
              preferLower: true,
            },
            sparks.alerts,
          ),
          withSpark(
            {
              key: "incidents",
              title: "My incidents",
              value: String(myIncidents.length),
              context: "active response ownership",
              preferLower: true,
            },
            sparks.incidents,
          ),
          withSpark(
            {
              key: "linked-vulns",
              title: "Vulns in incidents",
              value:
                vulnStats.find((s) => s.key === "with-incidents")?.value ??
                "—",
              context: "escalated IR linkage",
              preferLower: true,
            },
            sparks.critical,
          ),
          withSpark(
            {
              key: "with-alerts",
              title: "Vulns with alerts",
              value:
                vulnStats.find((s) => s.key === "with-alerts")?.value ?? "—",
              context: "detection coverage",
              preferLower: false,
            },
            sparks.alerts,
          ),
        ],
        queueTitle: "My open investigations",
        queue: [
          ...myInvestigations.map((a) => ({
            id: a.id,
            title: a.title,
            meta: alertMeta(a),
            subtitle: a.entityName,
            href: alertHref(a.id),
            tone: a.severity,
          })),
          ...myIncidents.map((i) => ({
            id: i.id,
            title: i.title,
            meta: incidentMeta(i),
            subtitle: i.entityName,
            href: incidentHref(i.id),
            tone: "high" as const,
          })),
        ].slice(0, 8),
        shortcuts: [
          {
            label: "Incidents",
            href: "/incidents/list",
            description: "Case workspace",
          },
          {
            label: "Findings",
            href: "/vulnerabilities/findings",
            description: "Remediation context",
          },
          {
            label: "Indicators",
            href: "/threat-intelligence",
            description: "IOC lookup and enrichment",
          },
        ],
        insights: [
          {
            title: "Correlate first",
            body: "Pull linked assets and vulns before expanding the investigation scope.",
            href: "/assets/devices",
            tone: "info",
          },
          {
            title: "Your caseload",
            body: `${myInvestigations.length + myIncidents.length} items currently assigned — prioritize escalated and P1/P2.`,
            href: "/incidents/list",
            tone: "warn",
          },
          {
            title: "Intel assist",
            body: "Check indicators when entity or rule names suggest known actor tooling.",
            href: "/threat-intelligence",
            tone: "ok",
          },
        ],
        primaryBreakdown: incidentPriorityBreakdown(incidents),
        secondaryBreakdown: statusBreakdown(alerts),
      };

    case "analyst_t3":
      return {
        headline: "Deep investigation & hunting",
        subhead:
          "Zero-day exposure, actor context, and hunt library for advanced cases.",
        chartKind: "incidents",
        chartTitle: "High-priority incident pressure",
        chartDescription: "P1–P4 intake used to prioritize hunt vs IR time",
        kpis: [
          withSpark(
            {
              key: "exploitable",
              title: "Exploitable critical",
              value: String(exploitableVulns.length),
              context: "sample of priority exposure",
              preferLower: true,
            },
            sparks.critical,
          ),
          withSpark(
            {
              key: "linked",
              title: "In active incidents",
              value: String(zeroDayish.length),
              context: "vulns tied to IR",
              preferLower: true,
            },
            sparks.p1,
          ),
          withSpark(
            {
              key: "p1",
              title: "P1 open",
              value:
                incidentStats.find((s) => s.key === "p1-open")?.value ?? "—",
              context: "containment priority",
              preferLower: true,
            },
            sparks.p1,
          ),
          withSpark(
            {
              key: "escalated",
              title: "Escalated alerts",
              value:
                alertStats.find((s) => s.key === "escalated")?.value ?? "—",
              context: "advanced track",
              preferLower: true,
            },
            sparks.critical,
          ),
        ],
        queueTitle: "High-context exposure",
        queue: zeroDayish.map((v) => ({
          id: v.id,
          title: v.title,
          meta: `${v.severity.toUpperCase()} · ${v.linkedIncidentIds.length} incidents`,
          subtitle: v.cve,
          href: `/vulnerabilities/findings?id=${encodeURIComponent(v.id)}`,
          tone: "critical" as const,
        })),
        shortcuts: [
          {
            label: "Hunt library",
            href: "/threat-hunting/hunts",
            description: "Saved hunts and hypotheses",
          },
          {
            label: "Threat analytics",
            href: "/threat-hunting/analytics",
            description: "Detection and campaign views",
          },
          {
            label: "Actors & campaigns",
            href: "/threat-intelligence/actors",
            description: "Attribution context",
          },
          {
            label: "Dark web",
            href: "/threat-intelligence/dark-web",
            description: "Credential and leak monitoring",
          },
        ],
        insights: [
          {
            title: "Hunt candidates",
            body: "Exploitable findings with linked incidents are prime hypotheses for the hunt library.",
            href: "/threat-hunting/hunts",
            tone: "warn",
          },
          {
            title: "Actor context",
            body: "Enrich escalated cases with actors & campaigns before expanding scope.",
            href: "/threat-intelligence/actors",
            tone: "info",
          },
          {
            title: "Dark web watch",
            body: "Cross-check credential exposures when identity entities appear in P1 cases.",
            href: "/threat-intelligence/dark-web",
            tone: "ok",
          },
        ],
        primaryBreakdown: vulnSeverityBreakdown(),
        secondaryBreakdown: incidentPriorityBreakdown(incidents),
      };

    case "legal_procurement":
      return {
        headline: "Compliance & documentation",
        subhead:
          "Controls, evidence, and report packs for legal and procurement reviews.",
        chartKind: "compliance",
        chartTitle: "Compliance score trend",
        chartDescription: "Monthly score vs target for audit and vendor reviews",
        kpis: [
          withSpark(
            {
              key: "score",
              title: "Compliance score",
              value: `${score}%`,
              context: "overall posture",
              delta: 2.4,
              preferLower: false,
            },
            sparks.compliance,
          ),
          withSpark(
            {
              key: "passing",
              title: "Controls passing",
              value:
                complianceStats.find((s) => s.title === "Controls passing")
                  ?.value ?? "—",
              context: "testable controls",
              preferLower: false,
            },
            sparks.compliance,
          ),
          withSpark(
            {
              key: "findings",
              title: "Open findings",
              value: String(openFindings),
              context: "awaiting remediation or acceptance",
              preferLower: true,
            },
            sparks.compliance,
          ),
          withSpark(
            {
              key: "milestone",
              title: "Next milestone",
              value: `${nextFramework.daysToMilestone}d`,
              context: nextFramework.name,
              preferLower: true,
            },
            sparks.compliance,
          ),
        ],
        queueTitle: "Framework milestones",
        queue: complianceFrameworks.slice(0, 6).map((f) => ({
          id: f.id,
          title: f.name,
          meta: `${f.status} · ${f.daysToMilestone}d to milestone`,
          subtitle: f.auditor,
          href: "/compliance",
          tone: "neutral" as const,
        })),
        shortcuts: [
          {
            label: "Compliance",
            href: "/compliance",
            description: "Frameworks, controls, evidence",
          },
          {
            label: "Documentation",
            href: "/knowledge-base/documentation",
            description: "Policies and vendor packs",
          },
          {
            label: "Reports",
            href: "/knowledge-base/reports",
            description: "Audit and board reports",
          },
        ],
        insights: [
          {
            title: "Audit readiness",
            body: `${nextFramework.name} is ${nextFramework.daysToMilestone} days out — confirm evidence packs are current.`,
            href: "/compliance",
            tone: nextFramework.daysToMilestone < 30 ? "warn" : "info",
          },
          {
            title: "Open findings",
            body: `${openFindings} findings still need remediation or formal acceptance.`,
            href: "/compliance",
            tone: openFindings > 0 ? "warn" : "ok",
          },
          {
            title: "Report library",
            body: "Pull the latest board and vendor-facing reports from Knowledge Base.",
            href: "/knowledge-base/reports",
            tone: "ok",
          },
        ],
        primaryBreakdown: frameworkBreakdown(),
        secondaryBreakdown: {
          title: "Finding severity",
          items: (["critical", "high", "medium", "low"] as const).map(
            (sev) => ({
              key: sev,
              label: sev.charAt(0).toUpperCase() + sev.slice(1),
              value: complianceFindings.filter(
                (f) =>
                  f.severity === sev &&
                  f.status !== "remediated" &&
                  f.status !== "accepted",
              ).length,
              color: SEV_COLORS[sev],
            }),
          ),
        },
      };
  }
}
