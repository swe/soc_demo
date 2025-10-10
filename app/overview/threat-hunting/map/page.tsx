'use client'

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

  const getSeverityColor = (severity: string) => {
    const colors = {
      critical: 'bg-rose-600 dark:bg-rose-700/20 text-red-700 dark:text-red-400 border-red-500',
      high: 'bg-orange-600 dark:bg-orange-700/20 text-orange-700 dark:text-orange-400 border-orange-500',
      medium: 'bg-amber-600 dark:bg-amber-700/20 text-yellow-700 dark:text-yellow-400 border-yellow-500',
      low: 'bg-sky-600 dark:bg-sky-700/20 text-blue-700 dark:text-blue-400 border-blue-500'
    }
    return colors[severity as keyof typeof colors]
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
    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-[96rem] mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold mb-2">Global Threat Map</h1>
        <p className="text-gray-600  dark:text-gray-400">Real-time visualization of global cyber threats and attack patterns</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-12 gap-4 mb-6">
        <div className="col-span-12 sm:col-span-6 lg:col-span-3">
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Attacks</div>
              <div className="w-10 h-10 bg-slate-700 dark:bg-slate-600/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-slate-700 dark:text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.total}</div>
            <div className="text-sm text-slate-700 dark:text-slate-400 mt-1">Last 5 minutes</div>
          </div>
        </div>

        <div className="col-span-12 sm:col-span-6 lg:col-span-3">
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-600 dark:text-gray-400">Blocked</div>
              <div className="w-10 h-10 bg-emerald-600 dark:bg-emerald-700/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald-700 dark:text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944zM11 14a1 1 0 11-2 0 1 1 0 012 0zm0-7a1 1 0 10-2 0v3a1 1 0 102 0V7z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold text-emerald-700 dark:text-emerald-400">{stats.blocked}</div>
            <div className="text-sm text-emerald-700 dark:text-emerald-400 mt-1">{Math.round((stats.blocked / stats.total) * 100)}% blocked</div>
          </div>
        </div>

        <div className="col-span-12 sm:col-span-6 lg:col-span-3">
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-600 dark:text-gray-400">Critical</div>
              <div className="w-10 h-10 bg-rose-600 dark:bg-rose-700/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-rose-700 dark:text-rose-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold text-rose-700 dark:text-rose-400">{stats.critical}</div>
            <div className="text-sm text-rose-700 dark:text-rose-400 mt-1">Needs attention</div>
          </div>
        </div>

        <div className="col-span-12 sm:col-span-6 lg:col-span-3">
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-600 dark:text-gray-400">Active Threats</div>
              <div className="w-10 h-10 bg-orange-600 dark:bg-orange-700/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-orange-700 dark:text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold text-orange-700 dark:text-orange-400">{stats.active}</div>
            <div className="text-sm text-orange-700 dark:text-orange-400 mt-1">Ongoing</div>
          </div>
        </div>
      </div>

      {/* Map and Events */}
      <div className="grid grid-cols-12 gap-4">
        {/* Map */}
        <div className="col-span-12 lg:col-span-8">
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Attack Origins Map</h2>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-600 dark:bg-emerald-700 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Live</span>
              </div>
            </div>
            <div className="h-[500px]">
              <AttackMap />
            </div>
          </div>
        </div>

        {/* Live Attack Feed */}
        <div className="col-span-12 lg:col-span-4">
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Live Attack Feed</h2>
            
            {/* Type Filter */}
            <div className="mb-4">
              <select 
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="form-select w-full bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-700"
              >
                <option value="all">All Types</option>
                {attackTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {filteredEvents.map((event) => (
                <div 
                  key={event.id} 
                  className={`border-l-3 ${getSeverityColor(event.severity).split(' ')[2]} pl-3 py-2 bg-gray-50 dark:bg-gray-900/20 rounded-r`}
                >
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-800 dark:text-gray-100 mb-1">{event.type}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {event.source} → {event.target}
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(event.severity)}`}>
                      {event.severity.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500 dark:text-gray-400">
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </span>
                    {event.blocked ? (
                      <span className="text-emerald-700 dark:text-emerald-400 font-medium">BLOCKED</span>
                    ) : (
                      <span className="text-orange-700 dark:text-orange-400 font-medium">ACTIVE</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Attack Type Distribution */}
        <div className="col-span-12">
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Attack Type Distribution</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {attackTypes.map((type, idx) => {
                const count = attackEvents.filter(e => e.type === type).length
                const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0
                
                return (
                  <div key={idx} className="bg-gray-50 dark:bg-gray-900/20 rounded-lg p-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">{type}</div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">{count}</div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-slate-700 dark:bg-slate-600 h-2 rounded-full transition-all duration-200" 
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
