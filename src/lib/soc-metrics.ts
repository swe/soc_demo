import {
  administrationTeams,
  administrationUsers,
  type AdministrationUser,
} from "@/components/administration/users-data";
import type { SocAlert } from "@/components/alerts/alerts-data";
import type { SocIncident } from "@/components/incidents/incidents-data";
import type { KbProcedure } from "@/components/knowledge-base/knowledge-base-data";

export type SocLatencyMetrics = {
  /** Mean minutes from alert createdAt → first triage (non-new status or assignee). */
  mttaMinutes: number | null;
  /** Mean minutes from incident createdAt → contained/resolved/closed. */
  mttcMinutes: number | null;
  /** Sample sizes used. */
  mttaSample: number;
  mttcSample: number;
  mttaLabel: string;
  mttcLabel: string;
};

function minutesBetween(startIso: string, endIso: string): number | null {
  const start = Date.parse(startIso);
  const end = Date.parse(endIso);
  if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) {
    return null;
  }
  return (end - start) / 60_000;
}

function mean(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export function formatDurationMinutes(minutes: number | null): string {
  if (minutes == null || !Number.isFinite(minutes)) return "—";
  if (minutes < 1) return "<1m";
  if (minutes < 60) return `${Math.round(minutes)}m`;
  const hours = minutes / 60;
  if (hours < 48) {
    const h = Math.floor(hours);
    const m = Math.round(minutes - h * 60);
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  }
  const days = hours / 24;
  return `${days.toFixed(1)}d`;
}

function alertAckMinutes(alert: SocAlert): number | null {
  if (alert.status === "new") return null;
  const delta = minutesBetween(alert.createdAt, alert.updatedAt);
  if (delta != null && delta > 0) return delta;
  if (typeof alert.ageMinutes === "number" && alert.ageMinutes > 0) {
    // Triaged catalog items: fraction of age as stand-in ack latency
    return Math.max(1, alert.ageMinutes * 0.15);
  }
  return null;
}

const CLOSED_INCIDENT_STATUSES = new Set([
  "contained",
  "eradicated",
  "resolved",
  "closed",
]);

function incidentContainMinutes(incident: SocIncident): number | null {
  if (!CLOSED_INCIDENT_STATUSES.has(incident.status)) return null;
  const end =
    incident.timeline.find((t) =>
      /contain|resolv|clos|disrupt/i.test(t.label),
    )?.at ?? incident.updatedAt;
  const delta = minutesBetween(incident.createdAt, end);
  return delta != null && delta > 0 ? delta : null;
}

/**
 * Compute MTTA / MTTC from in-session catalogs.
 * Uses ageMinutes / updatedAt heuristics when explicit ack timestamps are absent.
 */
export function computeSocLatencyMetrics(
  alerts: SocAlert[],
  incidents: SocIncident[],
): SocLatencyMetrics {
  const mttaSamples = alerts
    .map(alertAckMinutes)
    .filter((v): v is number => v != null);
  const mttcSamples = incidents
    .map(incidentContainMinutes)
    .filter((v): v is number => v != null);

  const mttaMinutes = mean(mttaSamples);
  const mttcMinutes = mean(mttcSamples);

  return {
    mttaMinutes,
    mttcMinutes,
    mttaSample: mttaSamples.length,
    mttcSample: mttcSamples.length,
    mttaLabel: formatDurationMinutes(mttaMinutes),
    mttcLabel: formatDurationMinutes(mttcMinutes),
  };
}

export type SocTeamPerformance = {
  teamId: string;
  teamName: string;
  mttaMinutes: number | null;
  mttcMinutes: number | null;
  mttaLabel: string;
  mttcLabel: string;
  falsePositiveRate: number;
  alertCount: number;
  incidentCount: number;
};

export type PlaybookRoiRow = {
  playbookId: string;
  code: string;
  name: string;
  runs: number;
  hoursSaved: number;
  containmentSuccessRate: number;
  estimatedCostAvoidedUsd: number;
};

export type SocPerformanceSnapshot = SocLatencyMetrics & {
  byTeam: SocTeamPerformance[];
  falsePositiveRate: number;
  falsePositiveCount: number;
  closedAlertCount: number;
  playbookRoi: PlaybookRoiRow[];
  playbookHoursSaved: number;
  playbookCostAvoidedUsd: number;
};

/** Primary SOC ops teams shown on the performance panel. */
const SOC_TEAM_IDS = ["TIER1", "TIER2", "IR"] as const;

const userById = new Map(
  administrationUsers.map((user) => [user.id, user] as const),
);

function resolveUser(userId: string | null | undefined): AdministrationUser | null {
  if (!userId) return null;
  return userById.get(userId) ?? null;
}

function primarySocTeamId(user: AdministrationUser | null): string {
  if (!user) return "TIER1";
  for (const id of SOC_TEAM_IDS) {
    if (user.teamIds.includes(id)) return id;
  }
  return user.teamIds[0] ?? "TIER1";
}

function teamLabel(teamId: string): string {
  return (
    administrationTeams.find((team) => team.id === teamId)?.name ?? teamId
  );
}

const HOURS_PER_RUN: Record<string, number> = {
  critical: 4.5,
  high: 2.8,
  medium: 1.6,
  low: 0.9,
};

const SUCCESS_BASE: Record<string, number> = {
  critical: 0.86,
  high: 0.91,
  medium: 0.94,
  low: 0.97,
};

/** Analyst fully-loaded hourly + avoided breach exposure factor. */
const COST_PER_HOUR_USD = 185;
const BREACH_AVOIDANCE_PER_RUN_USD: Record<string, number> = {
  critical: 4200,
  high: 2100,
  medium: 750,
  low: 220,
};

/**
 * Session-computed playbook ROI from procedure run counts and severity.
 */
export function computePlaybookRoi(
  procedures: KbProcedure[],
): PlaybookRoiRow[] {
  return procedures
    .filter((p) => p.status === "approved" || p.runCount > 0)
    .map((procedure) => {
      const severity = procedure.severity;
      const hoursPerRun = HOURS_PER_RUN[severity] ?? 1.5;
      const hoursSaved = Math.round(procedure.runCount * hoursPerRun * 10) / 10;
      const successJitter =
        ((procedure.runCount * 17 + procedure.steps * 3) % 7) / 100;
      const containmentSuccessRate = Math.min(
        0.99,
        (SUCCESS_BASE[severity] ?? 0.9) + successJitter,
      );
      const estimatedCostAvoidedUsd = Math.round(
        hoursSaved * COST_PER_HOUR_USD +
          procedure.runCount * (BREACH_AVOIDANCE_PER_RUN_USD[severity] ?? 500),
      );
      return {
        playbookId: procedure.id,
        code: procedure.code,
        name: procedure.title,
        runs: procedure.runCount,
        hoursSaved,
        containmentSuccessRate,
        estimatedCostAvoidedUsd,
      };
    })
    .sort((a, b) => b.estimatedCostAvoidedUsd - a.estimatedCostAvoidedUsd)
    .slice(0, 6);
}

/**
 * Demo-grade performance snapshot: overall latency + by-team MTTA/MTTC,
 * false-positive rate, and playbook ROI from session catalogs.
 */
export function computeSocPerformanceSnapshot(
  alerts: SocAlert[],
  incidents: SocIncident[],
  procedures: KbProcedure[] = [],
): SocPerformanceSnapshot {
  const base = computeSocLatencyMetrics(alerts, incidents);
  const fpCount = alerts.filter((a) => a.status === "false-positive").length;
  const closedOrResolved = alerts.filter(
    (a) => a.status === "closed" || a.status === "false-positive",
  ).length;
  const falsePositiveRate =
    closedOrResolved > 0
      ? fpCount / closedOrResolved
      : alerts.length > 0
        ? 0.12
        : 0;

  const alertsByTeam = new Map<string, SocAlert[]>();
  const incidentsByTeam = new Map<string, SocIncident[]>();
  for (const id of SOC_TEAM_IDS) {
    alertsByTeam.set(id, []);
    incidentsByTeam.set(id, []);
  }

  for (const alert of alerts) {
    const teamId = primarySocTeamId(resolveUser(alert.assigneeId));
    const bucket = alertsByTeam.get(teamId) ?? alertsByTeam.get("TIER1")!;
    bucket.push(alert);
  }
  for (const incident of incidents) {
    const teamId = primarySocTeamId(
      resolveUser(incident.ownerId ?? incident.assigneeId),
    );
    const bucket = incidentsByTeam.get(teamId) ?? incidentsByTeam.get("IR")!;
    bucket.push(incident);
  }

  const byTeam: SocTeamPerformance[] = SOC_TEAM_IDS.map((teamId) => {
    const teamAlerts = alertsByTeam.get(teamId) ?? [];
    const teamIncidents = incidentsByTeam.get(teamId) ?? [];
    const latency = computeSocLatencyMetrics(teamAlerts, teamIncidents);
    const teamFp = teamAlerts.filter((a) => a.status === "false-positive").length;
    const teamClosed = teamAlerts.filter(
      (a) => a.status === "closed" || a.status === "false-positive",
    ).length;
    const teamFpRate =
      teamClosed > 0
        ? teamFp / teamClosed
        : teamAlerts.length > 0
          ? falsePositiveRate
          : 0;

    return {
      teamId,
      teamName: teamLabel(teamId),
      mttaMinutes: latency.mttaMinutes,
      mttcMinutes: latency.mttcMinutes,
      mttaLabel: latency.mttaLabel,
      mttcLabel: latency.mttcLabel,
      falsePositiveRate: teamFpRate,
      alertCount: teamAlerts.length,
      incidentCount: teamIncidents.length,
    };
  });

  const playbookRoi = computePlaybookRoi(procedures);
  const playbookHoursSaved = playbookRoi.reduce((sum, row) => sum + row.hoursSaved, 0);
  const playbookCostAvoidedUsd = playbookRoi.reduce(
    (sum, row) => sum + row.estimatedCostAvoidedUsd,
    0,
  );

  return {
    ...base,
    byTeam,
    falsePositiveRate,
    falsePositiveCount: fpCount,
    closedAlertCount: closedOrResolved,
    playbookRoi,
    playbookHoursSaved,
    playbookCostAvoidedUsd,
  };
}
