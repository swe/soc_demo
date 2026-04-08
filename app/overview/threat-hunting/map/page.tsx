'use client'
import { useEffect, useState } from 'react'
import { usePageTitle } from '@/app/page-title-context'
import dynamic from 'next/dynamic'

const AttackMap = dynamic(() => import('@/components/attack-map'), {
  ssr: false,
  loading: () => (
    <div className="h-full flex items-center justify-center">
      <p className="text-sm" style={{ color: 'var(--soc-text-muted)' }}>Loading map…</p>
    </div>
  )
})

interface AttackEvent {
  id: string
  source: string
  target: string
  type: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  timestamp: string
  blocked: boolean
}

const SEV: Record<string, { color: string; bg: string }> = {
  critical: { color: 'var(--soc-critical)', bg: 'var(--soc-critical-bg)' },
  high:     { color: 'var(--soc-high)',     bg: 'var(--soc-high-bg)' },
  medium:   { color: 'var(--soc-medium)',   bg: 'var(--soc-medium-bg)' },
  low:      { color: 'var(--soc-low)',      bg: 'var(--soc-low-bg)' },
}

const ATTACK_TYPES = ['DDoS', 'Brute Force', 'SQL Injection', 'Phishing', 'Malware', 'Ransomware']
const SOURCES = ['China', 'Russia', 'North Korea', 'Brazil', 'India']

function makeEvent(): AttackEvent {
  const types = ATTACK_TYPES
  const sevs: AttackEvent['severity'][] = ['critical', 'high', 'medium', 'low']
  return {
    id: Math.random().toString(36).substr(2, 9),
    source: SOURCES[Math.floor(Math.random() * SOURCES.length)],
    target: 'Your Network',
    type: types[Math.floor(Math.random() * types.length)],
    severity: sevs[Math.floor(Math.random() * sevs.length)],
    timestamp: new Date().toISOString(),
    blocked: Math.random() > 0.3,
  }
}

export default function ThreatMap() {
  const { setPageTitle } = usePageTitle()
  const [events, setEvents] = useState<AttackEvent[]>([])
  const [typeFilter, setTypeFilter] = useState('all')

  useEffect(() => { setPageTitle('Threat Map') }, [setPageTitle])

  useEffect(() => {
    setEvents(Array.from({ length: 10 }, makeEvent))
    const interval = setInterval(() => {
      setEvents(prev => [makeEvent(), ...prev].slice(0, 20))
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const visible = typeFilter === 'all' ? events : events.filter(e => e.type === typeFilter)
  const blocked = events.filter(e => e.blocked).length
  const critical = events.filter(e => e.severity === 'critical').length
  const active = events.filter(e => !e.blocked).length

  const typeDistribution = ATTACK_TYPES.map(t => ({
    type: t,
    count: events.filter(e => e.type === t).length,
  }))
  const maxCount = Math.max(...typeDistribution.map(t => t.count), 1)

  const formatTime = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-6">

      {/* Header */}
      <div className="flex items-start justify-between mb-5 soc-fade-in">
        <div>
          <p className="soc-label mb-1">THREAT HUNTING</p>
          <h1 className="text-xl font-bold tracking-tight mb-1.5" style={{ color: 'var(--soc-text)' }}>
            Global Threat Map
          </h1>
          <p className="text-sm" style={{ color: 'var(--soc-text-secondary)' }}>
            <span className="inline-flex items-center gap-1 mr-3">
              <span className="soc-dot" style={{ backgroundColor: 'var(--soc-low)', animation: 'pulse 2s infinite' }} />
              <span style={{ color: 'var(--soc-low)' }}>Live</span>
            </span>
            <strong style={{ color: 'var(--soc-critical)' }}>{critical}</strong> critical ·{' '}
            <strong style={{ color: 'var(--soc-low)' }}>{blocked}</strong> blocked ·{' '}
            <strong style={{ color: 'var(--soc-high)' }}>{active}</strong> active
          </p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'TOTAL EVENTS',   value: events.length,       color: 'var(--soc-text)',     sub: 'Last 20 events' },
          { label: 'BLOCKED',        value: blocked,             color: 'var(--soc-low)',      sub: `${events.length > 0 ? Math.round((blocked/events.length)*100) : 0}% block rate` },
          { label: 'CRITICAL',       value: critical,            color: 'var(--soc-critical)', sub: 'Immediate attention' },
          { label: 'ACTIVE THREATS', value: active,              color: 'var(--soc-high)',     sub: 'Not blocked' },
        ].map(({ label, value, color, sub }) => (
          <div key={label} className="soc-card">
            <p className="soc-label mb-2">{label}</p>
            <p className="soc-metric-sm mb-1" style={{ color }}>{value}</p>
            <p className="text-xs" style={{ color: 'var(--soc-text-muted)' }}>{sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-4 mb-4">

        {/* Map */}
        <div className="col-span-12 lg:col-span-8">
          <div className="soc-card p-0 overflow-hidden">
            <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: 'var(--soc-border)' }}>
              <p className="soc-label">ATTACK ORIGINS</p>
              <div className="flex items-center gap-2">
                <span className="soc-dot" style={{ backgroundColor: 'var(--soc-low)' }} />
                <span className="text-xs" style={{ color: 'var(--soc-text-muted)' }}>Live updates every 5s</span>
              </div>
            </div>
            <div className="h-[480px]">
              <AttackMap />
            </div>
          </div>
        </div>

        {/* Live feed */}
        <div className="col-span-12 lg:col-span-4">
          <div className="soc-card p-0 overflow-hidden h-full flex flex-col">
            <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: 'var(--soc-border)' }}>
              <p className="soc-label">LIVE FEED</p>
              <span className="text-xs tabular-nums" style={{ color: 'var(--soc-text-muted)' }}>{visible.length} events</span>
            </div>
            <div className="px-3 py-2 border-b flex items-center gap-1 flex-wrap" style={{ borderColor: 'var(--soc-border)' }}>
              <button
                onClick={() => setTypeFilter('all')}
                className="soc-btn text-xs"
                style={typeFilter === 'all'
                  ? { backgroundColor: 'var(--soc-accent)', borderColor: 'var(--soc-accent)', color: '#fff' }
                  : { borderColor: 'var(--soc-border-mid)', color: 'var(--soc-text-secondary)', background: 'transparent' }}
              >All</button>
              {ATTACK_TYPES.slice(0, 3).map(t => (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  className="soc-btn text-xs"
                  style={typeFilter === t
                    ? { backgroundColor: 'var(--soc-accent)', borderColor: 'var(--soc-accent)', color: '#fff' }
                    : { borderColor: 'var(--soc-border-mid)', color: 'var(--soc-text-secondary)', background: 'transparent' }}
                >
                  {t.split(' ')[0]}
                </button>
              ))}
            </div>
            <div className="flex-1 overflow-y-auto">
              {visible.map((e, i, arr) => {
                const s = SEV[e.severity]
                return (
                  <div key={e.id} className="px-4 py-2.5" style={{ borderBottom: i < arr.length - 1 ? '1px solid var(--soc-border)' : 'none' }}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium" style={{ color: 'var(--soc-text)' }}>{e.type}</span>
                      <span className="soc-badge" style={{ backgroundColor: s.bg, color: s.color }}>{e.severity.toUpperCase()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs" style={{ color: 'var(--soc-text-muted)' }}>{e.source} → {e.target}</span>
                      <span className="text-xs font-medium" style={{ color: e.blocked ? 'var(--soc-low)' : 'var(--soc-high)' }}>
                        {e.blocked ? 'BLOCKED' : 'ACTIVE'}
                      </span>
                    </div>
                    <p className="text-xs tabular-nums mt-0.5" style={{ color: 'var(--soc-text-muted)' }}>{formatTime(e.timestamp)}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Attack type distribution */}
      <div className="soc-card">
        <p className="soc-label mb-4">ATTACK TYPE DISTRIBUTION</p>
        <div className="grid grid-cols-3 lg:grid-cols-6 gap-4">
          {typeDistribution.map(({ type, count }) => (
            <div key={type}>
              <div className="flex items-end justify-between mb-1">
                <span className="text-xs" style={{ color: 'var(--soc-text-secondary)' }}>{type}</span>
                <span className="text-xs font-bold tabular-nums" style={{ color: 'var(--soc-text)' }}>{count}</span>
              </div>
              <div className="soc-progress-track">
                <div className="soc-progress-fill" style={{ width: `${(count/maxCount)*100}%`, backgroundColor: 'var(--soc-accent)' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
