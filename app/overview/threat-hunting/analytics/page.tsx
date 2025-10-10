'use client'

import { useEffect, useState } from 'react'
import { usePageTitle } from '@/app/page-title-context'
import { PageHeader, Card, Badge } from '@/components/ui/card'

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

  const getSeverityColor = (severity: string) => {
    const colors = {
      critical: 'bg-rose-600 dark:bg-rose-700/20 text-red-700 dark:text-red-400',
      high: 'bg-orange-600 dark:bg-orange-700/20 text-orange-700 dark:text-orange-400',
      medium: 'bg-amber-600 dark:bg-amber-700/20 text-yellow-700 dark:text-yellow-400',
      low: 'bg-indigo-600 dark:bg-indigo-600/20 text-blue-700 dark:text-blue-400'
    }
    return colors[severity as keyof typeof colors]
  }

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') {
      return (
        <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
        </svg>
      )
    } else if (trend === 'down') {
      return (
        <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
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
    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-7xl mx-auto">
      <PageHeader 
        title="Threat Analytics" 
        description="MITRE ATT&CK framework-based threat detection and analysis" 
      />

      {/* Sticky Status Bar */}
      <div className="sticky top-16 z-40 before:absolute before:inset-0 before:backdrop-blur-md before:bg-white/90 dark:before:bg-gray-800/90 before:-z-10 border-b border-gray-200 dark:border-gray-700/60 mb-6 -mx-4 sm:-mx-6 lg:-mx-8">
        <div className="px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-6">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                </svg>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {techniques.reduce((sum, t) => sum + t.detections, 0)} Total Detections
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-rose-600 dark:bg-rose-700 rounded-full animate-pulse"></div>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {techniques.filter(t => t.severity === 'critical').length} Critical Techniques
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-600 dark:bg-orange-700 rounded-full"></div>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {techniques.filter(t => t.trend === 'up').length} Trending Up
                </span>
              </div>
              <div className="text-gray-500 dark:text-gray-400">
                {new Set(techniques.map(t => t.tactic)).size} Active Tactics
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MITRE ATT&CK Tactics Heat Map */}
      <div className="mb-6">
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">MITRE ATT&CK Tactics Overview</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
            <button
              onClick={() => setSelectedTactic('all')}
              className={`p-4 rounded-lg text-sm font-medium transition-all ${
                selectedTactic === 'all'
                  ? 'bg-indigo-600 dark:bg-indigo-500 text-white shadow-sm shadow-lg scale-105'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <div className="text-2xl font-bold">All</div>
              <div className="text-xs opacity-80">{techniques.length} techniques</div>
            </button>
            {mitreTactics.map(tactic => {
              const tacticCount = techniques.filter(t => t.tactic === tactic).length
              const tacticDetections = techniques.filter(t => t.tactic === tactic).reduce((sum, t) => sum + t.detections, 0)
              const intensity = Math.min(100, (tacticDetections / 300) * 100)
              
              return (
                <button
                  key={tactic}
                  onClick={() => setSelectedTactic(tactic)}
                  className={`p-4 rounded-lg text-sm font-medium transition-all relative overflow-hidden ${
                    selectedTactic === tactic
                      ? 'bg-indigo-600 dark:bg-indigo-500 text-white shadow-sm shadow-lg scale-105'
                      : 'bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-indigo-600 dark:hover:border-indigo-600'
                  }`}
                  style={{
                    background: selectedTactic !== tactic ? 
                      `linear-gradient(135deg, rgba(139, 92, 246, ${intensity/100}) 0%, rgba(168, 85, 247, ${intensity/200}) 100%)` : 
                      undefined
                  }}
                >
                  <div className={`text-lg font-bold ${selectedTactic !== tactic && intensity > 50 ? 'text-white' : ''}`}>
                    {tacticDetections}
                  </div>
                  <div className={`text-xs truncate ${selectedTactic !== tactic && intensity > 50 ? 'text-white/90' : 'opacity-80'}`}>
                    {tactic.split(' ')[0]}
                  </div>
                  <div className={`text-xs mt-1 ${selectedTactic !== tactic && intensity > 50 ? 'text-white/80' : 'opacity-70'}`}>
                    {tacticCount} techniques
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Techniques Table */}
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 lg:col-span-8">
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Detected Techniques</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20">
                  <tr>
                    <th className="px-4 py-3 text-left">ID</th>
                    <th className="px-4 py-3 text-left">Technique</th>
                    <th className="px-4 py-3 text-left">Tactic</th>
                    <th className="px-4 py-3 text-left">Detections</th>
                    <th className="px-4 py-3 text-left">Severity</th>
                    <th className="px-4 py-3 text-left">Trend</th>
                    <th className="px-4 py-3 text-left">Last Detected</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredTechniques.map((technique) => (
                    <tr
                      key={technique.id}
                      onClick={() => setSelectedTechnique(technique)}
                      className="hover:bg-gray-50 dark:hover:bg-gray-900/20 cursor-pointer"
                    >
                      <td className="px-4 py-3">
                        <span className="font-mono text-indigo-600 hover:text-indigo-700 dark:hover:text-indigo-500">{technique.id}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-medium text-gray-800 dark:text-gray-100">{technique.name}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-gray-600 dark:text-gray-400">{technique.tactic}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-gray-900 dark:text-gray-100">{technique.detections}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(technique.severity)}`}>
                          {technique.severity.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {getTrendIcon(technique.trend)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-gray-600 dark:text-gray-400">{technique.lastDetected}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Top Techniques & Tactic Distribution */}
        <div className="col-span-12 lg:col-span-4 space-y-4">
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Top Techniques</h2>
            <div className="space-y-3">
              {[...techniques]
                .sort((a, b) => b.detections - a.detections)
                .slice(0, 5)
                .map((technique, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-800 dark:text-gray-100 mb-1">
                        {technique.id} - {technique.name}
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-indigo-600 dark:bg-indigo-500 h-2 rounded-full" 
                          style={{ width: `${(technique.detections / stats.totalDetections) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <span className="ml-4 text-sm font-semibold text-gray-900 dark:text-gray-100">{technique.detections}</span>
                  </div>
                ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Tactic Distribution</h2>
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
                      <span className="text-sm text-gray-700 dark:text-gray-300">{tactic}</span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{count}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-indigo-600 dark:bg-indigo-600 h-2 rounded-full" 
                        style={{ width: `${(count / stats.totalDetections) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Technique Detail Panel */}
      {selectedTechnique && (
        <>
          <div 
            className="fixed inset-0 bg-gray-900/50 z-40"
            onClick={() => setSelectedTechnique(null)}
          />
          <div className="fixed inset-y-0 right-0 w-full md:w-2/3 lg:w-1/2 bg-white dark:bg-gray-800 shadow-xl z-50 overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Technique Details</h2>
                <button
                  onClick={() => setSelectedTechnique(null)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Technique ID</div>
                  <div className="text-lg font-mono text-indigo-600">{selectedTechnique.id}</div>
                </div>

                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Name</div>
                  <div className="text-lg font-semibold text-gray-800 dark:text-gray-100">{selectedTechnique.name}</div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Tactic</div>
                    <div className="text-gray-800 dark:text-gray-100">{selectedTechnique.tactic}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Severity</div>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getSeverityColor(selectedTechnique.severity)}`}>
                      {selectedTechnique.severity.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Detections</div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{selectedTechnique.detections}</div>
                </div>

                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Trend</div>
                  <div className="flex items-center gap-2">
                    {getTrendIcon(selectedTechnique.trend)}
                    <span className="capitalize text-gray-800 dark:text-gray-100">{selectedTechnique.trend}</span>
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Last Detected</div>
                  <div className="text-gray-800 dark:text-gray-100">{selectedTechnique.lastDetected}</div>
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <a 
                    href={`https://attack.mitre.org/techniques/${selectedTechnique.id}/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn bg-indigo-600 dark:bg-indigo-600 hover:bg-indigo-700 dark:hover:bg-indigo-700 text-white w-full"
                  >
                    View on MITRE ATT&CK
                  </a>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
