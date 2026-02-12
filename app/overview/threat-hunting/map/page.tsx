'use client'
import { formatDate, formatDateTime, formatTime } from '@/lib/utils'
import { useEffect, useState } from 'react'
import { usePageTitle } from '@/app/page-title-context'
import dynamic from 'next/dynamic'

const AttackMap = dynamic(() => import('@/components/attack-map'), {
  ssr: false,
  loading: () => <div className="h-full flex items-center justify-center"><div className="text-gray-400">Loading map...</div></div>
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

export default function ThreatMap() {
  const { setPageTitle } = usePageTitle()
  const [attackEvents, setAttackEvents] = useState<AttackEvent[]>([])
  const [selectedType, setSelectedType] = useState<string>('all')

  useEffect(() => {
    setPageTitle('Threat Map')
  }, [setPageTitle])

  useEffect(() => {
    // Simulate real-time attack events
    const generateEvent = (): AttackEvent => {
      const types = ['DDoS', 'Brute Force', 'SQL Injection', 'Phishing', 'Malware', 'Ransomware']
      const sources = ['China', 'Russia', 'North Korea', 'Brazil', 'India']
      const severities: ('critical' | 'high' | 'medium' | 'low')[] = ['critical', 'high', 'medium', 'low']
      
      return {
        id: Math.random().toString(36).substr(2, 9),
        source: sources[Math.floor(Math.random() * sources.length)],
        target: 'Your Network',
        type: types[Math.floor(Math.random() * types.length)],
        severity: severities[Math.floor(Math.random() * severities.length)],
        timestamp: new Date().toISOString(),
        blocked: Math.random() > 0.3
      }
    }

    const initialEvents = Array.from({ length: 10 }, generateEvent)
    setAttackEvents(initialEvents)

    const interval = setInterval(() => {
      setAttackEvents(prev => {
        const newEvent = generateEvent()
        const updated = [newEvent, ...prev].slice(0, 20)
        return updated
      })
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const getSeverityColor = (severity: string): string => {
    const colors: Record<string, string> = {
      critical: '#e11d48',  // System red
      high: '#ea580c',      // System orange
      medium: '#d97706',    // System yellow
      low: '#4f46e5'        // System blue
    }
    return colors[severity] || '#6b7280'
  }

  const stats = {
    total: attackEvents.length,
    blocked: attackEvents.filter(e => e.blocked).length,
    critical: attackEvents.filter(e => e.severity === 'critical').length,
    active: attackEvents.filter(e => !e.blocked).length
  }

  const filteredEvents = selectedType === 'all' 
    ? attackEvents 
    : attackEvents.filter(e => e.type === selectedType)

  const attackTypes = ['DDoS', 'Brute Force', 'SQL Injection', 'Phishing', 'Malware', 'Ransomware']

  return (
    <div className="py-4 w-full max-w-7xl mx-auto">
      <div className="mb-6 px-4 hig-fade-in">
        <h1 className="hig-title-large text-gray-900 dark:text-gray-100 mb-2">Global Threat Map</h1>
        <p className="hig-body text-gray-600 dark:text-gray-400">Real-time visualization of global cyber threats and attack patterns</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-3 px-4">
        <div className="hig-card bg-gray-50 dark:bg-gray-700/30 p-4 text-center">
          <div className="hig-caption text-gray-600 dark:text-gray-400 mb-2">Total Attacks</div>
          <div className="hig-metric-value text-4xl text-gray-900 dark:text-gray-100">{stats.total}</div>
          <div className="hig-caption text-[#4f46e5] mt-1">Last 5 minutes</div>
        </div>

        <div className="hig-card bg-gray-50 dark:bg-gray-700/30 p-4 text-center">
          <div className="hig-caption text-gray-600 dark:text-gray-400 mb-2">Blocked</div>
          <div className="hig-metric-value text-4xl" style={{ color: '#059669', WebkitTextFillColor: '#059669' }}>
            {stats.blocked}
          </div>
          <div className="hig-caption text-[#059669] mt-1">{Math.round((stats.blocked / stats.total) * 100)}% blocked</div>
        </div>

        <div className="hig-card bg-gray-50 dark:bg-gray-700/30 p-4 text-center">
          <div className="hig-caption text-gray-600 dark:text-gray-400 mb-2">Critical</div>
          <div className="hig-metric-value text-4xl" style={{ color: '#e11d48', WebkitTextFillColor: '#e11d48' }}>
            {stats.critical}
          </div>
          <div className="hig-caption text-[#e11d48] mt-1">Needs attention</div>
        </div>

        <div className="hig-card bg-gray-50 dark:bg-gray-700/30 p-4 text-center">
          <div className="hig-caption text-gray-600 dark:text-gray-400 mb-2">Active Threats</div>
          <div className="hig-metric-value text-4xl" style={{ color: '#ea580c', WebkitTextFillColor: '#ea580c' }}>
            {stats.active}
          </div>
          <div className="hig-caption text-[#ea580c] mt-1">Ongoing</div>
        </div>
      </div>

      {/* Map and Events */}
      <div className="grid grid-cols-12 gap-4 px-4">
        {/* Map */}
        <div className="col-span-12 lg:col-span-8">
          <div className="hig-card">
            <div className="flex items-center justify-between mb-3 pb-4 border-b border-gray-200 dark:border-gray-700/60">
              <h2 className="hig-headline text-gray-900 dark:text-gray-100">Attack Origins Map</h2>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#059669] rounded-full animate-pulse"></div>
                <span className="hig-caption text-gray-600 dark:text-gray-400">Live</span>
              </div>
            </div>
            <div className="h-[500px]">
              <AttackMap />
            </div>
          </div>
        </div>

        {/* Live Attack Feed */}
        <div className="col-span-12 lg:col-span-4">
          <div className="hig-card">
            <div className="flex items-center justify-between mb-3 pb-4 border-b border-gray-200 dark:border-gray-700/60">
              <h2 className="hig-headline text-gray-900 dark:text-gray-100">Live Attack Feed</h2>
              <span className="hig-caption text-gray-600 dark:text-gray-400">{filteredEvents.length} events</span>
            </div>
            
            {/* Type Filter */}
            <div className="mb-4">
              <select 
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="hig-input w-full"
              >
                <option value="all">All Types</option>
                {attackTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {filteredEvents.map((event) => {
                const severityColor = getSeverityColor(event.severity)
                
                return (
                  <div 
                    key={event.id} 
                    className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg"
                  >
                    <div 
                      className="w-1 h-full rounded-full flex-shrink-0"
                      style={{ 
                        backgroundColor: severityColor,
                        boxShadow: `0 0 8px ${severityColor}40`
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="hig-body font-semibold text-gray-900 dark:text-gray-100">{event.type}</div>
                        <span 
                          className="hig-badge"
                          style={{
                            backgroundColor: `${severityColor}20`,
                            color: severityColor
                          }}
                        >
                          {event.severity.toUpperCase()}
                        </span>
                      </div>
                      <div className="hig-caption text-gray-600 dark:text-gray-400 mb-1">
                        {event.source} → {event.target}
                      </div>
                      <div className="flex items-center justify-between hig-caption text-gray-500 dark:text-gray-400">
                        <span>{formatTime(event.timestamp)}</span>
                        {event.blocked ? (
                          <span className="text-[#059669] font-medium">BLOCKED</span>
                        ) : (
                          <span className="text-[#ea580c] font-medium">ACTIVE</span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Attack Type Distribution */}
        <div className="col-span-12">
          <div className="hig-card">
            <div className="flex items-center justify-between mb-3 pb-4 border-b border-gray-200 dark:border-gray-700/60">
              <h2 className="hig-headline text-gray-900 dark:text-gray-100">Attack Type Distribution</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {attackTypes.map((type, idx) => {
                const count = attackEvents.filter(e => e.type === type).length
                const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0
                
                return (
                  <div key={idx} className="hig-card bg-gray-50 dark:bg-gray-700/30 p-4 text-center">
                    <div className="hig-caption text-gray-600 dark:text-gray-400 mb-2">{type}</div>
                    <div className="hig-metric-value text-3xl text-gray-900 dark:text-gray-100 mb-2">{count}</div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-indigo-600 dark:bg-indigo-500 h-2 rounded-full transition-all duration-200" 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
