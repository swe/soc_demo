'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
  type ChartData,
  type ChartOptions,
} from 'chart.js'
import { Line } from 'react-chartjs-2'

import { usePageTitle } from '@/app/page-title-context'
import {
  OverviewKpiRow,
  OverviewPageHeader,
  OverviewPageShell,
  OverviewSection,
} from '@/components/overview/unified-ui'
import { api } from '@lib/api-client'
import { EmptyState } from '@ui/empty-state'
import { KpiSkeleton, TableSkeleton } from '@ui/skeleton'
import { SeverityBadge, severityColor } from '@ui/severity-badge'
import { StatusBadge } from '@ui/status-badge'
import type { OverviewDto } from '@domain/entities/overview'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler)

export default function OverviewPage() {
  const { setPageTitle } = usePageTitle()
  const [data, setData] = useState<OverviewDto | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    setPageTitle('Security Operations Center')
  }, [setPageTitle])

  useEffect(() => {
    let cancelled = false
    api
      .overview()
      .then((overview) => {
        if (!cancelled) setData(overview)
      })
      .catch((err) => {
        if (!cancelled) setError(err.message ?? 'Failed to load overview')
      })
    return () => {
      cancelled = true
    }
  }, [])

  const trendData: ChartData<'line'> = useMemo(() => {
    const trend = data?.severityTrend ?? []
    const labels = trend.map((d) =>
      new Date(`${d.day}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    )
    return {
      labels,
      datasets: (['critical', 'high', 'medium', 'low'] as const).map((severity) => ({
        label: severity,
        data: trend.map((d) => d[severity]),
        borderColor: severityColor(severity),
        backgroundColor: 'transparent',
        fill: false,
      })),
    }
  }, [data])

  const trendOptions: ChartOptions<'line'> = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      interaction: { intersect: false, mode: 'index' },
      plugins: {
        legend: { display: false },
        tooltip: { enabled: true, backgroundColor: '#0f172a', borderColor: '#334155', borderWidth: 1 },
      },
      elements: {
        line: { tension: 0.35, borderWidth: 2 },
        point: { radius: 0, hoverRadius: 3 },
      },
      scales: {
        x: { display: false, grid: { display: false } },
        y: { display: false, beginAtZero: true },
      },
    }),
    [],
  )

  const kpis = data?.kpis

  return (
    <OverviewPageShell>
      <OverviewPageHeader
        section="SOC OPERATIONS"
        title="Security Operations Center"
        description="Live posture computed from your organization's security data."
      />

      {error ? (
        <div className="soc-card">
          <EmptyState title="Could not load overview" description={error} />
        </div>
      ) : !kpis ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="soc-card">
              <KpiSkeleton />
            </div>
          ))}
        </div>
      ) : (
        <OverviewKpiRow
          columns={4}
          items={[
            {
              label: 'OPEN ALERTS',
              value: kpis.openAlerts,
              sub: `${kpis.openAlertsBySeverity.critical} critical · ${kpis.openAlertsBySeverity.high} high`,
              tone: kpis.openAlertsBySeverity.critical > 0 ? 'critical' : 'default',
            },
            {
              label: 'OPEN INCIDENTS',
              value: kpis.openIncidents,
              sub: `${kpis.activeInvestigations} active investigations`,
              tone: kpis.openIncidents > 0 ? 'high' : 'low',
            },
            {
              label: 'MONITORED ASSETS',
              value: kpis.monitoredAssets,
              sub: 'devices, cloud, applications',
              tone: 'default',
            },
            {
              label: 'OPEN VULNERABILITIES',
              value: kpis.openVulnerabilities,
              sub: `${kpis.exploitedVulnerabilities} exploited in the wild`,
              tone: kpis.exploitedVulnerabilities > 0 ? 'medium' : 'default',
            },
          ]}
        />
      )}

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 lg:col-span-8 space-y-4">
          <OverviewSection title="OPEN INCIDENTS" flush right={(
            <a href="/overview/incidents" className="soc-link text-xs font-medium">View all →</a>
          )}>
            {!data ? (
              <TableSkeleton rows={4} />
            ) : data.openIncidents.length === 0 ? (
              <EmptyState
                title="No open incidents"
                description="Declared and contained incidents will appear here."
              />
            ) : (
              <table className="soc-table" style={{ tableLayout: 'fixed', width: '100%' }}>
                <thead>
                  <tr>
                    <th style={{ width: '6px', padding: 0 }} />
                    <th style={{ width: '12%' }}>ID</th>
                    <th style={{ width: '46%' }}>Incident</th>
                    <th style={{ width: '14%' }}>Severity</th>
                    <th style={{ width: '16%' }}>Status</th>
                    <th style={{ width: '12%' }}>Declared</th>
                  </tr>
                </thead>
                <tbody>
                  {data.openIncidents.map((inc) => (
                    <tr key={inc.id}>
                      <td style={{ padding: 0 }}>
                        <div style={{ width: '3px', height: '100%', minHeight: '2.75rem', backgroundColor: severityColor(inc.severity) }} />
                      </td>
                      <td>
                        <p className="text-xs font-mono" style={{ color: 'var(--soc-text-muted)' }}>INC-{inc.number}</p>
                      </td>
                      <td>
                        <p className="text-sm font-semibold" style={{ color: 'var(--soc-text)' }}>{inc.title}</p>
                        <p className="truncate text-xs" style={{ color: 'var(--soc-text-muted)' }}>{inc.impactSummary}</p>
                      </td>
                      <td><SeverityBadge severity={inc.severity} /></td>
                      <td><StatusBadge status={inc.status} /></td>
                      <td>
                        <span className="text-xs" style={{ color: 'var(--soc-text-secondary)' }}>
                          {new Date(inc.declaredAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </OverviewSection>

          <OverviewSection title="ALERT TREND — LAST 14 DAYS" right={(
            <span className="text-xs" style={{ color: 'var(--soc-text-muted)' }}>By severity</span>
          )}>
            <div className="px-4 py-3">
              {!data ? (
                <TableSkeleton rows={3} />
              ) : (
                <div className="rounded-md border p-2" style={{ borderColor: 'var(--soc-border)', backgroundColor: 'var(--soc-raised)' }}>
                  <div className="h-[160px] w-full">
                    <Line data={trendData} options={trendOptions} />
                  </div>
                  <div className="mt-2 flex items-center gap-3 text-[11px]">
                    {(['critical', 'high', 'medium', 'low'] as const).map((severity) => (
                      <span key={severity} className="inline-flex items-center gap-1 capitalize" style={{ color: 'var(--soc-text-muted)' }}>
                        <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: severityColor(severity) }} />
                        {severity}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </OverviewSection>
        </div>

        <div className="col-span-12 lg:col-span-4 space-y-4">
          <OverviewSection title="ALERTS BY SEVERITY">
            <div className="space-y-2.5 px-4 py-3">
              {!kpis ? (
                <TableSkeleton rows={4} />
              ) : (
                (['critical', 'high', 'medium', 'low'] as const).map((severity) => {
                  const value = kpis.openAlertsBySeverity[severity]
                  const max = Math.max(1, ...Object.values(kpis.openAlertsBySeverity))
                  return (
                    <div key={severity}>
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-xs capitalize" style={{ color: 'var(--soc-text-secondary)' }}>{severity}</span>
                        <span className="text-xs font-semibold tabular-nums" style={{ color: severityColor(severity) }}>{value}</span>
                      </div>
                      <div className="soc-progress-track">
                        <div
                          className="soc-progress-fill"
                          style={{ width: `${Math.round((value / max) * 100)}%`, backgroundColor: severityColor(severity) }}
                        />
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </OverviewSection>

          <OverviewSection title="TOP RISKY ASSETS" flush>
            {!data ? (
              <TableSkeleton rows={5} />
            ) : data.topRiskyAssets.length === 0 ? (
              <EmptyState title="No assets yet" description="Assets appear once data sources are connected or demo data is loaded." />
            ) : (
              <table className="soc-table">
                <thead>
                  <tr>
                    <th>Asset</th>
                    <th className="text-right">Risk</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topRiskyAssets.map((asset) => (
                    <tr key={asset.id}>
                      <td>
                        <p className="text-sm font-medium" style={{ color: 'var(--soc-text)' }}>{asset.name}</p>
                        <p className="text-xs capitalize" style={{ color: 'var(--soc-text-muted)' }}>
                          {asset.type.replace('_', ' ')} · {asset.criticality}
                        </p>
                      </td>
                      <td className="text-right">
                        <span
                          className="text-sm font-semibold tabular-nums"
                          style={{ color: asset.riskScore >= 75 ? 'var(--soc-critical)' : asset.riskScore >= 50 ? 'var(--soc-medium)' : 'var(--soc-low)' }}
                        >
                          {asset.riskScore}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </OverviewSection>
        </div>
      </div>
    </OverviewPageShell>
  )
}
