import { count, desc, eq, gte, inArray, sql } from 'drizzle-orm'

import type { OverviewDto } from '../../domain/entities/overview'
import { SEVERITIES } from '../../domain/enums'
import type { OrgContext } from '../auth/types'
import { orgScoped } from '../db/scoped'
import { alerts, assets, incidents, investigations, vulnerabilities } from '../db/schema'

const OPEN_ALERT_STATUSES = ['new', 'triaged'] as const
const OPEN_INCIDENT_STATUSES = ['declared', 'contained'] as const
const TREND_DAYS = 14

export async function getOverview(ctx: OrgContext): Promise<OverviewDto> {
  const scoped = orgScoped(ctx)
  const { db } = scoped

  const [openAlertRows, incidentCountRows, invRows, assetCountRows, vulnRows, trendRows, openIncidentRows, riskyAssetRows] =
    await Promise.all([
      db
        .select({ severity: alerts.severity, n: count() })
        .from(alerts)
        .where(scoped.where(alerts.organizationId, inArray(alerts.status, [...OPEN_ALERT_STATUSES])))
        .groupBy(alerts.severity),
      db
        .select({ n: count() })
        .from(incidents)
        .where(
          scoped.where(incidents.organizationId, inArray(incidents.status, [...OPEN_INCIDENT_STATUSES])),
        ),
      db
        .select({ n: count() })
        .from(investigations)
        .where(
          scoped.where(investigations.organizationId, inArray(investigations.status, ['open', 'active'])),
        ),
      db
        .select({ n: count() })
        .from(assets)
        .where(scoped.where(assets.organizationId, eq(assets.status, 'active'))),
      db
        .select({
          open: count(),
          exploited: sql<number>`count(*) filter (where ${vulnerabilities.exploitedInWild})`,
        })
        .from(vulnerabilities)
        .where(
          scoped.where(
            vulnerabilities.organizationId,
            inArray(vulnerabilities.status, ['open', 'in_progress']),
          ),
        ),
      db
        .select({
          day: sql<string>`to_char(date_trunc('day', ${alerts.detectedAt}), 'YYYY-MM-DD')`,
          severity: alerts.severity,
          n: count(),
        })
        .from(alerts)
        .where(
          scoped.where(
            alerts.organizationId,
            gte(alerts.detectedAt, sql`now() - interval '${sql.raw(String(TREND_DAYS))} days'`),
          ),
        )
        .groupBy(sql`1`, alerts.severity),
      db
        .select()
        .from(incidents)
        .where(
          scoped.where(incidents.organizationId, inArray(incidents.status, [...OPEN_INCIDENT_STATUSES])),
        )
        .orderBy(desc(incidents.severity), desc(incidents.declaredAt))
        .limit(5),
      db
        .select({
          id: assets.id,
          name: assets.name,
          type: assets.type,
          criticality: assets.criticality,
          riskScore: assets.riskScore,
        })
        .from(assets)
        .where(scoped.where(assets.organizationId, eq(assets.status, 'active')))
        .orderBy(desc(assets.riskScore))
        .limit(5),
    ])

  const openAlertsBySeverity = Object.fromEntries(SEVERITIES.map((s) => [s, 0])) as Record<
    (typeof SEVERITIES)[number],
    number
  >
  let openAlerts = 0
  for (const row of openAlertRows) {
    openAlertsBySeverity[row.severity] = Number(row.n)
    openAlerts += Number(row.n)
  }

  // Fill the trend so every one of the last N days is present
  const trendByDay = new Map<string, { critical: number; high: number; medium: number; low: number }>()
  for (let i = TREND_DAYS - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86_400_000)
    trendByDay.set(d.toISOString().slice(0, 10), { critical: 0, high: 0, medium: 0, low: 0 })
  }
  for (const row of trendRows) {
    const bucket = trendByDay.get(row.day)
    if (bucket) bucket[row.severity] = Number(row.n)
  }

  return {
    kpis: {
      openAlerts,
      openAlertsBySeverity,
      openIncidents: Number(incidentCountRows[0]?.n ?? 0),
      activeInvestigations: Number(invRows[0]?.n ?? 0),
      monitoredAssets: Number(assetCountRows[0]?.n ?? 0),
      openVulnerabilities: Number(vulnRows[0]?.open ?? 0),
      exploitedVulnerabilities: Number(vulnRows[0]?.exploited ?? 0),
    },
    severityTrend: [...trendByDay.entries()].map(([day, counts]) => ({ day, ...counts })),
    openIncidents: openIncidentRows.map((row) => ({
      id: row.id,
      number: row.number,
      title: row.title,
      severity: row.severity,
      status: row.status,
      investigationId: row.investigationId,
      impactSummary: row.impactSummary,
      declaredAt: row.declaredAt.toISOString(),
      resolvedAt: row.resolvedAt?.toISOString() ?? null,
    })),
    topRiskyAssets: riskyAssetRows,
  }
}
