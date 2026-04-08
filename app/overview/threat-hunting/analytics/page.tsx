'use client'
import { useEffect, useState } from 'react'
import { usePageTitle } from '@/app/page-title-context'

interface MitreTechnique {
  id: string
  name: string
  tactic: string
  detections: number
  severity: 'critical' | 'high' | 'medium' | 'low'
  lastDetected: string
  trend: 'up' | 'down' | 'stable'
}

const TECHNIQUES: MitreTechnique[] = [
  { id: 'T1566', name: 'Phishing',                              tactic: 'Initial Access',        detections: 89,  severity: 'high',     lastDetected: '2h ago',  trend: 'up' },
  { id: 'T1059', name: 'Command and Scripting Interpreter',     tactic: 'Execution',             detections: 234, severity: 'critical', lastDetected: '15m ago', trend: 'up' },
  { id: 'T1078', name: 'Valid Accounts',                        tactic: 'Persistence',           detections: 156, severity: 'high',     lastDetected: '1h ago',  trend: 'stable' },
  { id: 'T1068', name: 'Exploitation for Privilege Escalation', tactic: 'Privilege Escalation',  detections: 34,  severity: 'critical', lastDetected: '30m ago', trend: 'up' },
  { id: 'T1027', name: 'Obfuscated Files or Information',       tactic: 'Defense Evasion',       detections: 178, severity: 'medium',   lastDetected: '3h ago',  trend: 'down' },
  { id: 'T1003', name: 'OS Credential Dumping',                 tactic: 'Credential Access',     detections: 67,  severity: 'critical', lastDetected: '45m ago', trend: 'up' },
  { id: 'T1083', name: 'File and Directory Discovery',          tactic: 'Discovery',             detections: 245, severity: 'low',      lastDetected: '5h ago',  trend: 'stable' },
  { id: 'T1021', name: 'Remote Services',                       tactic: 'Lateral Movement',      detections: 123, severity: 'high',     lastDetected: '1h ago',  trend: 'up' },
  { id: 'T1119', name: 'Automated Collection',                  tactic: 'Collection',            detections: 45,  severity: 'medium',   lastDetected: '4h ago',  trend: 'stable' },
  { id: 'T1048', name: 'Exfiltration Over Alternative Protocol',tactic: 'Exfiltration',          detections: 28,  severity: 'critical', lastDetected: '20m ago', trend: 'up' },
  { id: 'T1486', name: 'Data Encrypted for Impact',             tactic: 'Impact',                detections: 12,  severity: 'critical', lastDetected: '10m ago', trend: 'up' },
]

const TACTIC_COVERAGE = [
  { tactic: 'Initial Access', pct: 78 },
  { tactic: 'Execution', pct: 91 },
  { tactic: 'Persistence', pct: 82 },
  { tactic: 'Privilege Escalation', pct: 71 },
  { tactic: 'Defense Evasion', pct: 58 },
  { tactic: 'Credential Access', pct: 85 },
  { tactic: 'Lateral Movement', pct: 74 },
  { tactic: 'Exfiltration', pct: 67 },
  { tactic: 'Impact', pct: 88 },
]

const SEV: Record<string, { color: string; bg: string }> = {
  critical: { color: 'var(--soc-critical)', bg: 'var(--soc-critical-bg)' },
  high:     { color: 'var(--soc-high)',     bg: 'var(--soc-high-bg)' },
  medium:   { color: 'var(--soc-medium)',   bg: 'var(--soc-medium-bg)' },
  low:      { color: 'var(--soc-low)',      bg: 'var(--soc-low-bg)' },
}

const TREND_ICON: Record<string, string> = { up: '↑', down: '↓', stable: '—' }
const TREND_COLOR: Record<string, string> = {
  up:     'var(--soc-critical)',
  down:   'var(--soc-low)',
  stable: 'var(--soc-text-muted)',
}

export default function ThreatAnalytics() {
  const { setPageTitle } = usePageTitle()
  const [selectedTactic, setSelectedTactic] = useState('all')
  const [selected, setSelected] = useState<MitreTechnique | null>(null)

  useEffect(() => { setPageTitle('Threat Analytics') }, [setPageTitle])

  const allTactics = ['all', ...Array.from(new Set(TECHNIQUES.map(t => t.tactic)))]
  const visible = selectedTactic === 'all' ? TECHNIQUES : TECHNIQUES.filter(t => t.tactic === selectedTactic)

  const totalDetections = TECHNIQUES.reduce((s, t) => s + t.detections, 0)
  const criticalTechniques = TECHNIQUES.filter(t => t.severity === 'critical').length
  const trending = TECHNIQUES.filter(t => t.trend === 'up').length

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-6">

      {/* Header */}
      <div className="flex items-start justify-between mb-5 soc-fade-in">
        <div>
          <p className="soc-label mb-1">THREAT HUNTING</p>
          <h1 className="text-xl font-bold tracking-tight mb-1.5" style={{ color: 'var(--soc-text)' }}>
            MITRE ATT&CK Analytics
          </h1>
          <p className="text-sm" style={{ color: 'var(--soc-text-secondary)' }}>
            <strong style={{ color: 'var(--soc-critical)' }}>{criticalTechniques}</strong> critical techniques ·{' '}
            <strong style={{ color: 'var(--soc-high)' }}>{trending}</strong> trending up ·{' '}
            <strong style={{ color: 'var(--soc-text)' }}>{totalDetections.toLocaleString()}</strong> total detections
          </p>
        </div>
        <button className="soc-btn soc-btn-primary mt-1">Start Hunt</button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'TOTAL DETECTIONS', value: totalDetections.toLocaleString(), color: 'var(--soc-text)' },
          { label: 'CRITICAL TECHNIQUES', value: criticalTechniques, color: 'var(--soc-critical)' },
          { label: 'TRENDING UP', value: trending, color: 'var(--soc-high)' },
          { label: 'AVG COVERAGE', value: `${Math.round(TACTIC_COVERAGE.reduce((s, t) => s + t.pct, 0) / TACTIC_COVERAGE.length)}%`, color: 'var(--soc-low)' },
        ].map(({ label, value, color }) => (
          <div key={label} className="soc-card">
            <p className="soc-label mb-2">{label}</p>
            <p className="soc-metric-sm" style={{ color }}>{value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-4">

        {/* Main techniques table */}
        <div className="col-span-12 lg:col-span-8 space-y-3">

          {/* Tactic filter */}
          <div className="flex items-center gap-1 flex-wrap">
            {allTactics.slice(0, 7).map(t => (
              <button
                key={t}
                onClick={() => setSelectedTactic(t)}
                className="soc-btn text-xs"
                style={selectedTactic === t
                  ? { backgroundColor: 'var(--soc-accent)', borderColor: 'var(--soc-accent)', color: '#fff' }
                  : { borderColor: 'var(--soc-border-mid)', color: 'var(--soc-text-secondary)', background: 'transparent' }}
              >
                {t === 'all' ? 'All Tactics' : t.split(' ').map(w => w[0]).join('')}
              </button>
            ))}
          </div>

          <div className="soc-card p-0 overflow-hidden">
            <table className="soc-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Technique</th>
                  <th>Tactic</th>
                  <th className="text-right">Detections</th>
                  <th>Severity</th>
                  <th className="text-center">Trend</th>
                  <th>Last Detected</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((t) => {
                  const s = SEV[t.severity]
                  return (
                    <tr key={t.id} className="cursor-pointer" onClick={() => setSelected(t)}>
                      <td><span className="text-xs font-mono font-bold" style={{ color: 'var(--soc-accent)' }}>{t.id}</span></td>
                      <td><p className="text-sm" style={{ color: 'var(--soc-text)' }}>{t.name}</p></td>
                      <td><span className="soc-badge">{t.tactic}</span></td>
                      <td className="text-right">
                        <span className="text-sm font-bold tabular-nums" style={{ color: 'var(--soc-text)' }}>{t.detections}</span>
                      </td>
                      <td>
                        <span className="soc-badge" style={{ backgroundColor: s.bg, color: s.color }}>{t.severity.toUpperCase()}</span>
                      </td>
                      <td className="text-center">
                        <span className="text-sm font-bold" style={{ color: TREND_COLOR[t.trend] }}>{TREND_ICON[t.trend]}</span>
                      </td>
                      <td><span className="text-xs" style={{ color: 'var(--soc-text-muted)' }}>{t.lastDetected}</span></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sidebar: tactic coverage */}
        <div className="col-span-12 lg:col-span-4 space-y-4">
          <div className="soc-card">
            <p className="soc-label mb-3">TACTIC COVERAGE</p>
            <div className="space-y-2.5">
              {TACTIC_COVERAGE.map(({ tactic, pct }) => {
                const barColor = pct >= 80 ? 'var(--soc-low)' : pct >= 65 ? 'var(--soc-medium)' : 'var(--soc-critical)'
                return (
                  <div key={tactic}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs" style={{ color: 'var(--soc-text-secondary)' }}>{tactic}</span>
                      <span className="text-xs font-semibold" style={{ color: barColor }}>{pct}%</span>
                    </div>
                    <div className="soc-progress-track">
                      <div className="soc-progress-fill" style={{ width: `${pct}%`, backgroundColor: barColor }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="soc-card">
            <p className="soc-label mb-3">TOP DETECTIONS</p>
            <div className="space-y-0">
              {[...TECHNIQUES].sort((a, b) => b.detections - a.detections).slice(0, 5).map((t, i, arr) => {
                const s = SEV[t.severity]
                return (
                  <div key={t.id} className="flex items-center justify-between py-2.5" style={{ borderBottom: i < arr.length - 1 ? '1px solid var(--soc-border)' : 'none' }}>
                    <div>
                      <p className="text-xs font-mono font-bold" style={{ color: 'var(--soc-text)' }}>{t.id}</p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--soc-text-muted)' }}>{t.name.length > 28 ? t.name.slice(0, 28) + '…' : t.name}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold tabular-nums" style={{ color: s.color }}>{t.detections}</span>
                      <span style={{ color: TREND_COLOR[t.trend], fontSize: '12px' }}>{TREND_ICON[t.trend]}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Technique detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} onClick={() => setSelected(null)}>
          <div className="w-full max-w-md rounded-xl overflow-hidden" style={{ backgroundColor: 'var(--soc-surface)', border: '1px solid var(--soc-border-mid)' }} onClick={e => e.stopPropagation()}>
            <div className="px-5 py-4 border-b flex items-start justify-between" style={{ borderColor: 'var(--soc-border)' }}>
              <div>
                <p className="soc-label mb-1 font-mono">{selected.id} · {selected.tactic}</p>
                <h2 className="text-base font-bold" style={{ color: 'var(--soc-text)' }}>{selected.name}</h2>
              </div>
              <button onClick={() => setSelected(null)} className="text-sm w-7 h-7 flex items-center justify-center rounded" style={{ color: 'var(--soc-text-muted)', backgroundColor: 'var(--soc-raised)' }}>✕</button>
            </div>
            <div className="px-5 py-4 space-y-3">
              <div className="flex gap-2">
                <span className="soc-badge" style={{ backgroundColor: SEV[selected.severity].bg, color: SEV[selected.severity].color }}>{selected.severity.toUpperCase()}</span>
                <span className="soc-badge" style={{ color: TREND_COLOR[selected.trend], border: `1px solid ${TREND_COLOR[selected.trend]}44`, background: 'transparent' }}>
                  {TREND_ICON[selected.trend]} {selected.trend}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'DETECTIONS', value: String(selected.detections) },
                  { label: 'LAST DETECTED', value: selected.lastDetected },
                ].map(({ label, value }) => (
                  <div key={label} className="p-3 rounded" style={{ backgroundColor: 'var(--soc-raised)' }}>
                    <p className="soc-label mb-1">{label}</p>
                    <p className="text-sm font-bold" style={{ color: 'var(--soc-text)' }}>{value}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="px-5 py-4 flex gap-3 border-t" style={{ borderColor: 'var(--soc-border)' }}>
              <button className="soc-btn soc-btn-primary flex-1">Create Hunt Rule</button>
              <button onClick={() => setSelected(null)} className="soc-btn soc-btn-secondary flex-1">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
