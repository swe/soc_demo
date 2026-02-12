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

export default function ThreatAnalytics() {
  const { setPageTitle } = usePageTitle()
  const [selectedTactic, setSelectedTactic] = useState<string>('all')
  const [selectedTechnique, setSelectedTechnique] = useState<MitreTechnique | null>(null)

  useEffect(() => {
    setPageTitle('Threat Analytics')
  }, [setPageTitle])

  const mitreTactics = [
    'Initial Access',
    'Execution',
    'Persistence',
    'Privilege Escalation',
    'Defense Evasion',
    'Credential Access',
    'Discovery',
    'Lateral Movement',
    'Collection',
    'Exfiltration',
    'Impact'
  ]

  const techniques: MitreTechnique[] = [
    {
      id: 'T1566',
      name: 'Phishing',
      tactic: 'Initial Access',
      detections: 89,
      severity: 'high',
      lastDetected: '2 hours ago',
      trend: 'up'
    },
    {
      id: 'T1059',
      name: 'Command and Scripting Interpreter',
      tactic: 'Execution',
      detections: 234,
      severity: 'critical',
      lastDetected: '15 minutes ago',
      trend: 'up'
    },
    {
      id: 'T1078',
      name: 'Valid Accounts',
      tactic: 'Persistence',
      detections: 156,
      severity: 'high',
      lastDetected: '1 hour ago',
      trend: 'stable'
    },
    {
      id: 'T1068',
      name: 'Exploitation for Privilege Escalation',
      tactic: 'Privilege Escalation',
      detections: 34,
      severity: 'critical',
      lastDetected: '30 minutes ago',
      trend: 'up'
    },
    {
      id: 'T1027',
      name: 'Obfuscated Files or Information',
      tactic: 'Defense Evasion',
      detections: 178,
      severity: 'medium',
      lastDetected: '3 hours ago',
      trend: 'down'
    },
    {
      id: 'T1003',
      name: 'OS Credential Dumping',
      tactic: 'Credential Access',
      detections: 67,
      severity: 'critical',
      lastDetected: '45 minutes ago',
      trend: 'up'
    },
    {
      id: 'T1083',
      name: 'File and Directory Discovery',
      tactic: 'Discovery',
      detections: 245,
      severity: 'low',
      lastDetected: '5 hours ago',
      trend: 'stable'
    },
    {
      id: 'T1021',
      name: 'Remote Services',
      tactic: 'Lateral Movement',
      detections: 123,
      severity: 'high',
      lastDetected: '1 hour ago',
      trend: 'up'
    },
    {
      id: 'T1119',
      name: 'Automated Collection',
      tactic: 'Collection',
      detections: 45,
      severity: 'medium',
      lastDetected: '4 hours ago',
      trend: 'stable'
    },
    {
      id: 'T1048',
      name: 'Exfiltration Over Alternative Protocol',
      tactic: 'Exfiltration',
      detections: 28,
      severity: 'critical',
      lastDetected: '20 minutes ago',
      trend: 'up'
    },
    {
      id: 'T1486',
      name: 'Data Encrypted for Impact',
      tactic: 'Impact',
      detections: 12,
      severity: 'critical',
      lastDetected: '10 minutes ago',
      trend: 'up'
    }
  ]

  const getSeverityColor = (severity: string): string => {
    const colors: Record<string, string> = {
      critical: '#e11d48',  // System red
      high: '#ea580c',      // System orange
      medium: '#d97706',    // System yellow
      low: '#4f46e5'        // System blue
    }
    return colors[severity] || '#6b7280'
  }

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') {
      return (
        <svg className="w-4 h-4 text-rose-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
        </svg>
      )
    } else if (trend === 'down') {
      return (
        <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M14.707 12.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      )
    }
    return (
      <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
      </svg>
    )
  }

  const filteredTechniques = selectedTactic === 'all' 
    ? techniques 
    : techniques.filter(t => t.tactic === selectedTactic)

  const stats = {
    totalDetections: techniques.reduce((sum, t) => sum + t.detections, 0),
    criticalTechniques: techniques.filter(t => t.severity === 'critical').length,
    activeTactics: new Set(techniques.map(t => t.tactic)).size,
    trendingUp: techniques.filter(t => t.trend === 'up').length
  }

  return (
    <div className="py-4 w-full max-w-7xl mx-auto">
      <div className="mb-6 px-4 hig-fade-in">
        <h1 className="hig-title-large text-gray-900 dark:text-gray-100 mb-2">Threat Analytics</h1>
        <p className="hig-body text-gray-600 dark:text-gray-400">MITRE ATT&CK framework-based threat detection and analysis</p>
      </div>

      {/* Sticky Status Bar */}
      <div className="sticky top-16 z-40 before:absolute before:inset-0 before:backdrop-blur-xl before:bg-white/80 dark:before:bg-gray-950/80 before:-z-10 border-b border-gray-200 dark:border-gray-700/60 mb-3 -mx-4 sm:-mx-6 lg:-mx-8">
        <div className="px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between hig-caption">
            <div className="flex items-center space-x-6">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#4f46e5] rounded-full"></div>
                <span className="hig-caption font-semibold text-gray-900 dark:text-gray-100">
                  {techniques.reduce((sum, t) => sum + t.detections, 0)} Total Detections
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#e11d48] rounded-full animate-pulse"></div>
                <span className="hig-caption font-semibold text-gray-900 dark:text-gray-100">
                  {techniques.filter(t => t.severity === 'critical').length} Critical Techniques
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#ea580c] rounded-full"></div>
                <span className="hig-caption font-semibold text-gray-900 dark:text-gray-100">
                  {techniques.filter(t => t.trend === 'up').length} Trending Up
                </span>
              </div>
              <div className="hig-caption text-gray-600 dark:text-gray-400">
                {new Set(techniques.map(t => t.tactic)).size} Active Tactics
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MITRE ATT&CK Tactics Heat Map */}
      <div className="mb-6 px-4">
        <div className="hig-card">
          <h2 className="hig-headline text-gray-900 dark:text-gray-100 mb-4">MITRE ATT&CK Tactics Overview</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
            <button
              onClick={() => setSelectedTactic('all')}
              className={`hig-card p-4 text-center transition-all ${
                selectedTactic === 'all'
                  ? 'text-white border-2 border-indigo-400 shadow-lg shadow-indigo-600/30'
                  : 'bg-gray-50 dark:bg-gray-700/30 hover:bg-gray-100 dark:hover:bg-gray-700/50 border-2 border-transparent'
              }`}
              style={selectedTactic === 'all' ? { backgroundColor: '#3730a3' } : {}}
            >
              <div className={`hig-headline ${selectedTactic === 'all' ? 'text-white' : 'text-gray-900 dark:text-gray-100'}`} style={selectedTactic === 'all' ? { WebkitTextFillColor: 'white', color: 'white' } : {}}>All</div>
              <div className={`hig-caption mt-1 ${selectedTactic === 'all' ? 'text-white/90' : 'text-gray-600 dark:text-gray-400'}`} style={selectedTactic === 'all' ? { WebkitTextFillColor: 'rgba(255, 255, 255, 0.9)', color: 'rgba(255, 255, 255, 0.9)' } : {}}>{techniques.length} techniques</div>
            </button>
            {mitreTactics.map(tactic => {
              const tacticCount = techniques.filter(t => t.tactic === tactic).length
              const tacticDetections = techniques.filter(t => t.tactic === tactic).reduce((sum, t) => sum + t.detections, 0)
              
              return (
                <button
                  key={tactic}
                  onClick={() => setSelectedTactic(tactic)}
                  className={`hig-card p-4 text-center transition-all ${
                    selectedTactic === tactic
                      ? 'text-white border-2 border-indigo-400 shadow-lg shadow-indigo-600/30'
                      : 'bg-gray-50 dark:bg-gray-700/30 hover:bg-gray-100 dark:hover:bg-gray-700/50 border-2 border-transparent'
                  }`}
                  style={selectedTactic === tactic ? { backgroundColor: '#3730a3' } : {}}
                >
                  <div className={`hig-metric-value text-3xl ${selectedTactic === tactic ? 'text-white' : 'text-gray-900 dark:text-gray-100'}`} style={selectedTactic === tactic ? { WebkitTextFillColor: 'white', color: 'white' } : {}}>
                    {tacticDetections}
                  </div>
                  <div className={`hig-caption mt-1 ${selectedTactic === tactic ? 'text-white/90' : 'text-gray-600 dark:text-gray-400'}`} style={selectedTactic === tactic ? { WebkitTextFillColor: 'rgba(255, 255, 255, 0.9)', color: 'rgba(255, 255, 255, 0.9)' } : {}}>
                    {tactic.split(' ')[0]}
                  </div>
                  <div className={`hig-caption mt-1 ${selectedTactic === tactic ? 'text-white/80' : 'text-gray-500 dark:text-gray-500'}`} style={selectedTactic === tactic ? { WebkitTextFillColor: 'rgba(255, 255, 255, 0.8)', color: 'rgba(255, 255, 255, 0.8)' } : {}}>
                    {tacticCount} techniques
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Techniques Table */}
      <div className="grid grid-cols-12 gap-4 px-4">
        <div className="col-span-12 lg:col-span-8">
          <div className="hig-card">
            <div className="flex items-center justify-between mb-3 pb-4 border-b border-gray-200 dark:border-gray-700/60">
              <h2 className="hig-headline text-gray-900 dark:text-gray-100">Detected Techniques</h2>
              <span className="hig-caption text-gray-600 dark:text-gray-400">{filteredTechniques.length} total</span>
            </div>
            
            <div className="space-y-0">
              {filteredTechniques.map((technique, idx) => {
                const severityColor = getSeverityColor(technique.severity)
                
                return (
                  <div key={technique.id}>
                    <div 
                      className={`flex items-center gap-4 p-4 cursor-pointer ${
                        idx !== filteredTechniques.length - 1 ? 'border-b border-gray-200 dark:border-gray-700/60' : ''
                      } hover:bg-gray-50 dark:hover:bg-gray-700/20`}
                      onClick={() => setSelectedTechnique(technique)}
                    >
                      {/* Severity Indicator */}
                      <div 
                        className="w-1 h-12 rounded-full flex-shrink-0"
                        style={{ 
                          backgroundColor: severityColor,
                          boxShadow: `0 0 8px ${severityColor}40`
                        }}
                      />
                      
                      {/* Technique ID */}
                      <div className="w-20 flex-shrink-0">
                        <span className="hig-caption font-mono text-gray-600 dark:text-gray-400">
                          {technique.id}
                        </span>
                      </div>
                      
                      {/* Technique Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="hig-body font-semibold text-gray-900 dark:text-gray-100 mb-1 line-clamp-2" title={technique.name}>
                          {technique.name}
                        </h3>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="hig-caption text-gray-600 dark:text-gray-400">{technique.tactic}</span>
                          <span className="hig-caption text-gray-400">•</span>
                          <span 
                            className="hig-badge"
                            style={{
                              backgroundColor: `${severityColor}20`,
                              color: severityColor
                            }}
                          >
                            {technique.severity.toUpperCase()}
                          </span>
                        </div>
                      </div>
                      
                      {/* Metrics */}
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="text-right">
                          <div className="hig-caption text-gray-600 dark:text-gray-400">Detections</div>
                          <div className="hig-body text-gray-900 dark:text-gray-100 font-semibold mt-1">
                            {technique.detections}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="hig-caption text-gray-600 dark:text-gray-400">Trend</div>
                          <div className="flex items-center justify-end mt-1">
                            {getTrendIcon(technique.trend)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="hig-caption text-gray-600 dark:text-gray-400">Last Detected</div>
                          <div className="hig-caption text-gray-900 dark:text-gray-100 font-medium mt-1">
                            {technique.lastDetected}
                          </div>
                        </div>
                        <span className="hig-caption hig-link-hover">
                          View →
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Top Techniques & Tactic Distribution */}
        <div className="col-span-12 lg:col-span-4 space-y-4">
          <div className="hig-card p-6">
            <h2 className="hig-headline text-gray-900 dark:text-gray-100 mb-4">Top Techniques</h2>
            <div className="space-y-3">
              {[...techniques]
                .sort((a, b) => b.detections - a.detections)
                .slice(0, 5)
                .map((technique, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="hig-body font-medium text-gray-900 dark:text-gray-100 mb-1">
                        {technique.id} - {technique.name}
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-indigo-600 dark:bg-indigo-500 h-2 rounded-full" 
                          style={{ width: `${(technique.detections / stats.totalDetections) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <span className="ml-4 hig-body font-semibold text-gray-900 dark:text-gray-100">{technique.detections}</span>
                  </div>
                ))}
            </div>
          </div>

          <div className="hig-card p-6">
            <h2 className="hig-headline text-gray-900 dark:text-gray-100 mb-4">Tactic Distribution</h2>
            <div className="space-y-3">
              {Object.entries(
                techniques.reduce((acc, t) => {
                  acc[t.tactic] = (acc[t.tactic] || 0) + t.detections
                  return acc
                }, {} as Record<string, number>)
              )
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([tactic, count], idx) => (
                  <div key={idx}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="hig-body text-gray-700 dark:text-gray-300">{tactic}</span>
                      <span className="hig-body font-semibold text-gray-900 dark:text-gray-100">{count}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-indigo-600 dark:bg-indigo-500 h-2 rounded-full" 
                        style={{ width: `${(count / stats.totalDetections) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Technique Detail Modal */}
      {selectedTechnique && (
        <div className="hig-modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="hig-modal p-0 max-w-4xl w-full flex flex-col max-h-[90vh]">
            {/* Fixed Header */}
            <div 
              className="sticky top-0 z-10 backdrop-blur-xl backdrop-saturate-150 bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-700/60 p-6 pb-4"
              style={{
                WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                backdropFilter: 'blur(20px) saturate(180%)'
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <h2 className="hig-headline text-gray-900 dark:text-gray-100">Technique Details</h2>
                <button
                  onClick={() => setSelectedTechnique(null)}
                  className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                >
                  <span className="sr-only">Close</span>
                  <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  </svg>
                </button>
              </div>
              {/* Severity Indicator Bar */}
              <div 
                className="h-1 rounded-full" 
                style={{ backgroundColor: getSeverityColor(selectedTechnique.severity) }}
              />
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
              <div className="space-y-4 pb-4 border-b border-gray-200 dark:border-gray-700/60 mb-4">
                <div>
                  <div className="hig-caption text-gray-600 dark:text-gray-400 mb-1">Technique ID</div>
                  <div className="hig-body font-mono text-gray-900 dark:text-gray-100">{selectedTechnique.id}</div>
                </div>

                <div>
                  <div className="hig-caption text-gray-600 dark:text-gray-400 mb-1">Name</div>
                  <div className="hig-headline text-gray-900 dark:text-gray-100">{selectedTechnique.name}</div>
                </div>

                <div className="flex items-center gap-3">
                  <div>
                    <div className="hig-caption text-gray-600 dark:text-gray-400 mb-1">Tactic</div>
                    <div className="hig-body text-gray-900 dark:text-gray-100">{selectedTechnique.tactic}</div>
                  </div>
                  <div>
                    <div className="hig-caption text-gray-600 dark:text-gray-400 mb-1">Severity</div>
                    <span 
                      className="hig-badge"
                      style={{
                        backgroundColor: `${getSeverityColor(selectedTechnique.severity)}20`,
                        color: getSeverityColor(selectedTechnique.severity)
                      }}
                    >
                      {selectedTechnique.severity.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Metric Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="hig-card bg-gray-50 dark:bg-gray-700/30 p-4 text-center">
                  <div className="hig-caption text-gray-600 dark:text-gray-400 mb-2">Detections</div>
                  <div className="hig-metric-value text-3xl text-gray-900 dark:text-gray-100">
                    {selectedTechnique.detections}
                  </div>
                </div>
                <div className="hig-card bg-gray-50 dark:bg-gray-700/30 p-4 text-center">
                  <div className="hig-caption text-gray-600 dark:text-gray-400 mb-2">Trend</div>
                  <div className="flex items-center justify-center gap-2">
                    {getTrendIcon(selectedTechnique.trend)}
                    <span className="hig-body capitalize text-gray-900 dark:text-gray-100">{selectedTechnique.trend}</span>
                  </div>
                </div>
                <div className="hig-card bg-gray-50 dark:bg-gray-700/30 p-4 text-center">
                  <div className="hig-caption text-gray-600 dark:text-gray-400 mb-2">Last Detected</div>
                  <div className="hig-body text-gray-900 dark:text-gray-100 font-medium">
                    {selectedTechnique.lastDetected}
                  </div>
                </div>
              </div>
            </div>

            {/* Fixed Footer */}
            <div 
              className="sticky bottom-0 z-10 backdrop-blur-xl backdrop-saturate-150 bg-white/80 dark:bg-gray-900/80 border-t border-gray-200 dark:border-gray-700/60 p-6 pt-4"
              style={{
                WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                backdropFilter: 'blur(20px) saturate(180%)'
              }}
            >
              <div className="flex gap-3">
                <a 
                  href={`https://attack.mitre.org/techniques/${selectedTechnique.id}/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hig-button hig-button-primary flex-1 text-center"
                >
                  View on MITRE ATT&CK
                </a>
                <button className="hig-button hig-button-secondary flex-1" onClick={() => setSelectedTechnique(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
