'use client'
import { useEffect } from 'react'
import { usePageTitle } from '@/app/page-title-context'
import Link from 'next/link'

export default function ThreatIntelligenceOverview() {
  const { setPageTitle } = usePageTitle()

  useEffect(() => {
    setPageTitle('Threat Intelligence')
  }, [setPageTitle])

  const threatActors = [
    { name: 'APT28 (Fancy Bear)', country: 'Russia', targetSectors: ['Government', 'Military', 'Energy'], activity: 'High', lastSeen: '2 days ago' },
    { name: 'Lazarus Group', country: 'North Korea', targetSectors: ['Financial', 'Cryptocurrency'], activity: 'Critical', lastSeen: '1 day ago' },
    { name: 'APT29 (Cozy Bear)', country: 'Russia', targetSectors: ['Government', 'Think Tanks'], activity: 'Medium', lastSeen: '5 days ago' },
    { name: 'APT41', country: 'China', targetSectors: ['Healthcare', 'Technology', 'Telecom'], activity: 'High', lastSeen: '3 days ago' },
  ]

  const recentIndicators = [
    { type: 'IP', value: '192.0.2.146', threat: 'C2 Server', confidence: 95, source: 'MISP' },
    { type: 'Domain', value: 'malicious-site.example', threat: 'Phishing', confidence: 88, source: 'AlienVault' },
    { type: 'Hash', value: 'a3f5e...', threat: 'Ransomware', confidence: 92, source: 'VirusTotal' },
    { type: 'Email', value: 'phish@evil.com', threat: 'Phishing Campaign', confidence: 85, source: 'Internal' },
  ]

  const vulnerabilities = [
    { cve: 'CVE-2024-1234', severity: 'Critical', cvss: 9.8, description: 'Remote Code Execution in Popular Framework', publishedDays: 2, exploited: true },
    { cve: 'CVE-2024-5678', severity: 'High', cvss: 8.1, description: 'SQL Injection in Web Application', publishedDays: 5, exploited: false },
    { cve: 'CVE-2024-9012', severity: 'Critical', cvss: 9.1, description: 'Authentication Bypass in Enterprise Software', publishedDays: 1, exploited: true },
  ]

  return (
    <div className="py-4 w-full max-w-7xl mx-auto">
      <div className="mb-6 px-4 hig-fade-in">
        <h1 className="hig-title-large text-gray-900 dark:text-gray-100 mb-2">Threat Intelligence</h1>
        <p className="hig-body text-gray-600 dark:text-gray-400">Monitor emerging threats, indicators of compromise, and threat actor activities</p>
      </div>

      {/* Sticky Status Bar */}
      <div className="sticky top-16 z-40 before:absolute before:inset-0 before:backdrop-blur-xl before:bg-white/80 dark:before:bg-gray-950/80 before:-z-10 border-b border-gray-200 dark:border-gray-700/60 mb-3 -mx-4 sm:-mx-6 lg:-mx-8">
        <div className="px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-6">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#e11d48] rounded-full animate-pulse"></div>
                <span className="hig-caption font-semibold text-gray-900 dark:text-gray-100">24 Active Threat Actors</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#ea580c] rounded-full"></div>
                <span className="hig-caption font-semibold text-gray-900 dark:text-gray-100">1,247 IOCs</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#4f46e5] rounded-full"></div>
                <span className="hig-caption font-semibold text-gray-900 dark:text-gray-100">12 Critical CVEs</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#059669] rounded-full"></div>
                <span className="hig-caption font-semibold text-gray-900 dark:text-gray-100">15 Active Feeds</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-3 px-4">
        <div className="hig-card bg-gray-50 dark:bg-gray-700/30 p-4 text-center">
          <div className="hig-caption text-gray-600 dark:text-gray-400 mb-2">Active Threat Actors</div>
          <div className="hig-metric-value text-4xl text-gray-900 dark:text-gray-100">24</div>
          <div className="hig-caption text-[#e11d48] mt-1">+3 this week</div>
        </div>

        <div className="hig-card bg-gray-50 dark:bg-gray-700/30 p-4 text-center">
          <div className="hig-caption text-gray-600 dark:text-gray-400 mb-2">IOCs Detected</div>
          <div className="hig-metric-value text-4xl" style={{ color: '#ea580c', WebkitTextFillColor: '#ea580c' }}>
            1,247
          </div>
          <div className="hig-caption text-[#ea580c] mt-1">+89 today</div>
        </div>

        <div className="hig-card bg-gray-50 dark:bg-gray-700/30 p-4 text-center">
          <div className="hig-caption text-gray-600 dark:text-gray-400 mb-2">Critical CVEs</div>
          <div className="hig-metric-value text-4xl" style={{ color: '#4f46e5', WebkitTextFillColor: '#4f46e5' }}>
            12
          </div>
          <div className="hig-caption text-[#e11d48] mt-1">3 exploited</div>
        </div>

        <div className="hig-card bg-gray-50 dark:bg-gray-700/30 p-4 text-center">
          <div className="hig-caption text-gray-600 dark:text-gray-400 mb-2">Threat Feeds</div>
          <div className="hig-metric-value text-4xl" style={{ color: '#4f46e5', WebkitTextFillColor: '#4f46e5' }}>
            15
          </div>
          <div className="hig-caption text-[#4f46e5] mt-1">All active</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-12 gap-4 px-4">
        
        {/* Active Threat Actors */}
        <div className="col-span-12 lg:col-span-6">
          <div className="hig-card">
            <div className="flex items-center justify-between mb-3 pb-4 border-b border-gray-200 dark:border-gray-700/60">
              <h2 className="hig-headline text-gray-900 dark:text-gray-100">Active Threat Actors</h2>
              <Link href="/overview/threat-intelligence/overview" className="hig-caption hig-link-hover font-semibold">
                View All →
              </Link>
            </div>
            <div className="space-y-0">
              {threatActors.map((actor, idx) => {
                const activityColor = actor.activity === 'Critical' ? '#e11d48' : actor.activity === 'High' ? '#ea580c' : '#d97706'
                
                return (
                  <div key={idx} className={`flex items-center gap-4 p-4 ${
                    idx !== threatActors.length - 1 ? 'border-b border-gray-200 dark:border-gray-700/60' : ''
                  }`}>
                    <div 
                      className="w-1 h-12 rounded-full flex-shrink-0"
                      style={{ 
                        backgroundColor: activityColor,
                        boxShadow: `0 0 8px ${activityColor}40`
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="hig-body font-semibold text-gray-900 dark:text-gray-100 mb-1">{actor.name}</h3>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="hig-caption text-gray-600 dark:text-gray-400">Origin: {actor.country}</span>
                        <span className="hig-caption text-gray-400">•</span>
                        <span className="hig-caption text-gray-600 dark:text-gray-400">{actor.lastSeen}</span>
                        <span 
                          className="hig-badge"
                          style={{
                            backgroundColor: `${activityColor}20`,
                            color: activityColor
                          }}
                        >
                          {actor.activity}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {actor.targetSectors.map((sector, i) => (
                          <span 
                            key={i} 
                            className="hig-badge"
                            style={{
                              backgroundColor: 'rgba(107, 114, 128, 0.2)',
                              color: '#6b7280'
                            }}
                          >
                            {sector}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Recent Indicators */}
        <div className="col-span-12 lg:col-span-6">
          <div className="hig-card">
            <div className="flex items-center justify-between mb-3 pb-4 border-b border-gray-200 dark:border-gray-700/60">
              <h2 className="hig-headline text-gray-900 dark:text-gray-100">Recent Indicators of Compromise</h2>
              <Link href="/overview/threat-intelligence/overview" className="hig-caption hig-link-hover font-semibold">
                View All →
              </Link>
            </div>
            <div className="space-y-0">
              {recentIndicators.map((ioc, idx) => {
                const confidenceColor = ioc.confidence >= 90 ? '#e11d48' : '#ea580c'
                
                return (
                  <div key={idx} className={`flex items-center gap-4 p-4 ${
                    idx !== recentIndicators.length - 1 ? 'border-b border-gray-200 dark:border-gray-700/60' : ''
                  }`}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span 
                          className="hig-badge"
                          style={{
                            backgroundColor: '#4f46e520',
                            color: '#4f46e5'
                          }}
                        >
                          {ioc.type}
                        </span>
                        <span className="hig-body font-mono text-gray-900 dark:text-gray-100">{ioc.value}</span>
                      </div>
                      <div className="hig-caption text-gray-600 dark:text-gray-400 mb-2">{ioc.threat}</div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full" 
                          style={{ 
                            width: `${ioc.confidence}%`,
                            backgroundColor: confidenceColor
                          }}
                        ></div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="hig-body font-semibold text-gray-900 dark:text-gray-100">{ioc.confidence}%</div>
                      <div className="hig-caption text-gray-500 dark:text-gray-400">{ioc.source}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Critical Vulnerabilities */}
        <div className="col-span-12">
          <div className="hig-card">
            <div className="flex items-center justify-between mb-3 pb-4 border-b border-gray-200 dark:border-gray-700/60">
              <h2 className="hig-headline text-gray-900 dark:text-gray-100">Critical Vulnerabilities</h2>
              <Link href="/overview/vulnerability/dashboard" className="hig-caption hig-link-hover font-semibold">
                View All →
              </Link>
            </div>
            <div className="space-y-0">
              {vulnerabilities.map((vuln, idx) => {
                const severityColor = vuln.severity === 'Critical' ? '#e11d48' : '#ea580c'
                
                return (
                  <div key={idx} className={`flex items-center gap-4 p-4 ${
                    idx !== vulnerabilities.length - 1 ? 'border-b border-gray-200 dark:border-gray-700/60' : ''
                  }`}>
                    <div 
                      className="w-1 h-12 rounded-full flex-shrink-0"
                      style={{ 
                        backgroundColor: severityColor,
                        boxShadow: `0 0 8px ${severityColor}40`
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="hig-body font-mono text-gray-900 dark:text-gray-100">{vuln.cve}</span>
                        <span 
                          className="hig-badge"
                          style={{
                            backgroundColor: `${severityColor}20`,
                            color: severityColor
                          }}
                        >
                          {vuln.severity}
                        </span>
                        {vuln.exploited && (
                          <span 
                            className="hig-badge"
                            style={{
                              backgroundColor: '#e11d4820',
                              color: '#e11d48'
                            }}
                          >
                            Actively Exploited
                          </span>
                        )}
                      </div>
                      <div className="hig-caption text-gray-600 dark:text-gray-400 mb-1">{vuln.description}</div>
                      <div className="flex items-center gap-2 hig-caption text-gray-500 dark:text-gray-400">
                        <span>CVSS: {vuln.cvss}</span>
                        <span>•</span>
                        <span>{vuln.publishedDays} days ago</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Threat Feed Status & Dark Web Quick Access */}
        <div className="col-span-12 lg:col-span-6">
          <div className="hig-card">
            <div className="flex items-center justify-between mb-3 pb-4 border-b border-gray-200 dark:border-gray-700/60">
              <h2 className="hig-headline text-gray-900 dark:text-gray-100">Threat Feed Status</h2>
              <Link href="/overview/threat-intelligence/feeds" className="hig-caption hig-link-hover font-semibold">
                Manage →
              </Link>
            </div>
            <div className="space-y-0">
              {[
                { name: 'MISP Threat Sharing', status: 'active', lastUpdate: '2 min ago', indicators: 1247 },
                { name: 'AlienVault OTX', status: 'active', lastUpdate: '5 min ago', indicators: 892 },
                { name: 'Abuse.ch', status: 'active', lastUpdate: '10 min ago', indicators: 456 },
                { name: 'VirusTotal', status: 'active', lastUpdate: '1 min ago', indicators: 2341 },
              ].map((feed, idx) => (
                <div key={idx} className={`flex items-center justify-between p-4 ${
                  idx !== 3 ? 'border-b border-gray-200 dark:border-gray-700/60' : ''
                }`}>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-[#059669] rounded-full"></div>
                    <div>
                      <div className="hig-body font-medium text-gray-900 dark:text-gray-100">{feed.name}</div>
                      <div className="hig-caption text-gray-500 dark:text-gray-400">{feed.lastUpdate} • {feed.indicators} indicators</div>
                    </div>
                  </div>
                  <span className="hig-caption text-[#059669] font-medium">{feed.status.toUpperCase()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Dark Web Monitoring Quick Access */}
        <div className="col-span-12 lg:col-span-6">
          <div className="hig-card bg-gradient-to-br from-indigo-600 to-indigo-800 p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <h2 className="hig-headline text-white">Dark Web Monitoring</h2>
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center text-2xl">
                🌐
              </div>
            </div>
            <p className="hig-body text-white/90 mb-4">Monitor mentions of your organization across dark web forums, marketplaces, and paste sites.</p>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="hig-card bg-white/10 p-3 text-center">
                <div className="hig-metric-value text-white text-3xl" style={{ WebkitTextFillColor: 'white' }}>5</div>
                <div className="hig-caption text-white/80 mt-1">New Mentions</div>
              </div>
              <div className="hig-card bg-white/10 p-3 text-center">
                <div className="hig-metric-value text-white text-3xl" style={{ WebkitTextFillColor: 'white' }}>2</div>
                <div className="hig-caption text-white/80 mt-1">Critical</div>
              </div>
              <div className="hig-card bg-white/10 p-3 text-center">
                <div className="hig-metric-value text-white text-3xl" style={{ WebkitTextFillColor: 'white' }}>247</div>
                <div className="hig-caption text-white/80 mt-1">Sources</div>
              </div>
            </div>
            <Link href="/overview/threat-intelligence/dark-web" className="hig-button hig-button-secondary bg-white hover:bg-gray-100 text-indigo-700 w-full text-center">
              View Dark Web Dashboard
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}

