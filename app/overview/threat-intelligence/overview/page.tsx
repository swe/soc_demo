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
    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-[96rem] mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold mb-2">Threat Intelligence</h1>
        <p className="text-gray-600  dark:text-gray-400">Monitor emerging threats, indicators of compromise, and threat actor activities</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-12 gap-4 mb-6">
        <div className="col-span-12 sm:col-span-6 lg:col-span-3">
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-600 dark:text-gray-400">Active Threat Actors</div>
              <div className="w-10 h-10 bg-rose-600 dark:bg-rose-700/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-rose-700 dark:text-rose-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">24</div>
            <div className="text-sm text-rose-700 dark:text-rose-400 mt-1">+3 this week</div>
          </div>
        </div>

        <div className="col-span-12 sm:col-span-6 lg:col-span-3">
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-600 dark:text-gray-400">IOCs Detected</div>
              <div className="w-10 h-10 bg-orange-600 dark:bg-orange-700/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-orange-700 dark:text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">1,247</div>
            <div className="text-sm text-orange-700 dark:text-orange-400 mt-1">+89 today</div>
          </div>
        </div>

        <div className="col-span-12 sm:col-span-6 lg:col-span-3">
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-600 dark:text-gray-400">Critical CVEs</div>
              <div className="w-10 h-10 bg-indigo-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-indigo-600 dark:text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">12</div>
            <div className="text-sm text-indigo-600 dark:text-purple-400 mt-1">3 exploited</div>
          </div>
        </div>

        <div className="col-span-12 sm:col-span-6 lg:col-span-3">
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-600 dark:text-gray-400">Threat Feeds</div>
              <div className="w-10 h-10 bg-indigo-600 dark:bg-indigo-600/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-indigo-700 dark:text-indigo-300" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">15</div>
            <div className="text-sm text-indigo-700 dark:text-indigo-300 mt-1">All active</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-12 gap-4">
        
        {/* Active Threat Actors */}
        <div className="col-span-12 lg:col-span-6">
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Active Threat Actors</h2>
              <Link href="/threat-intelligence/actors" className="text-sm text-indigo-600 hover:text-indigo-700 dark:hover:text-indigo-500 font-medium">
                View All →
              </Link>
            </div>
            <div className="space-y-4">
              {threatActors.map((actor, idx) => (
                <div key={idx} className="border-l-3 border-red-500 pl-4 py-3 bg-gray-50 dark:bg-gray-900/20 rounded-r">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">{actor.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500 dark:text-gray-400">Origin: {actor.country}</span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{actor.lastSeen}</span>
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      actor.activity === 'Critical' ? 'bg-rose-600 dark:bg-rose-700/20 text-red-700 dark:text-red-400' :
                      actor.activity === 'High' ? 'bg-orange-600 dark:bg-orange-700/20 text-orange-700 dark:text-orange-400' :
                      'bg-amber-600 dark:bg-amber-700/20 text-yellow-700 dark:text-yellow-400'
                    }`}>
                      {actor.activity}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {actor.targetSectors.map((sector, i) => (
                      <span key={i} className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                        {sector}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Indicators */}
        <div className="col-span-12 lg:col-span-6">
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Recent Indicators of Compromise</h2>
              <Link href="/threat-intelligence/iocs" className="text-sm text-indigo-600 hover:text-indigo-700 dark:hover:text-indigo-500 font-medium">
                View All →
              </Link>
            </div>
            <div className="space-y-3">
              {recentIndicators.map((ioc, idx) => (
                <div key={idx} className="bg-gray-50 dark:bg-gray-900/20 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-600 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-500">
                          {ioc.type}
                        </span>
                        <span className="text-sm font-mono text-gray-800 dark:text-gray-100">{ioc.value}</span>
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">{ioc.threat}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{ioc.confidence}%</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{ioc.source}</div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-2">
                    <div className={`${ioc.confidence >= 90 ? 'bg-rose-600 dark:bg-rose-700' : 'bg-orange-600 dark:bg-orange-700'} h-1.5 rounded-full`} style={{ width: `${ioc.confidence}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Critical Vulnerabilities */}
        <div className="col-span-12">
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Critical Vulnerabilities</h2>
              <Link href="/vulnerability/dashboard" className="text-sm text-indigo-600 hover:text-indigo-700 dark:hover:text-indigo-500 font-medium">
                View All →
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20">
                  <tr>
                    <th className="px-4 py-3 text-left">CVE ID</th>
                    <th className="px-4 py-3 text-left">Severity</th>
                    <th className="px-4 py-3 text-left">CVSS Score</th>
                    <th className="px-4 py-3 text-left">Description</th>
                    <th className="px-4 py-3 text-left">Published</th>
                    <th className="px-4 py-3 text-left">Status</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-gray-200 dark:divide-gray-700">
                  {vulnerabilities.map((vuln, idx) => (
                    <tr key={idx}>
                      <td className="px-4 py-3">
                        <span className="font-mono text-indigo-600 hover:text-indigo-700 dark:hover:text-indigo-500 cursor-pointer">{vuln.cve}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          vuln.severity === 'Critical' ? 'bg-rose-600 dark:bg-rose-700/20 text-red-700 dark:text-red-400' : 'bg-orange-600 dark:bg-orange-700/20 text-orange-700 dark:text-orange-400'
                        }`}>
                          {vuln.severity}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-gray-900 dark:text-gray-100">{vuln.cvss}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-gray-700 dark:text-gray-300">{vuln.description}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-gray-600 dark:text-gray-400">{vuln.publishedDays} days ago</span>
                      </td>
                      <td className="px-4 py-3">
                        {vuln.exploited ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-rose-600 dark:bg-rose-700/20 text-red-700 dark:text-red-400">
                            Actively Exploited
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-600 dark:bg-amber-700/20 text-yellow-700 dark:text-yellow-400">
                            Monitoring
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Threat Feed Status & Dark Web Quick Access */}
        <div className="col-span-12 lg:col-span-6">
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Threat Feed Status</h2>
              <Link href="/threat-intelligence/feeds" className="text-sm text-indigo-600 hover:text-indigo-700 dark:hover:text-indigo-500 font-medium">
                Manage →
              </Link>
            </div>
            <div className="space-y-3">
              {[
                { name: 'MISP Threat Sharing', status: 'active', lastUpdate: '2 min ago', indicators: 1247 },
                { name: 'AlienVault OTX', status: 'active', lastUpdate: '5 min ago', indicators: 892 },
                { name: 'Abuse.ch', status: 'active', lastUpdate: '10 min ago', indicators: 456 },
                { name: 'VirusTotal', status: 'active', lastUpdate: '1 min ago', indicators: 2341 },
              ].map((feed, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-emerald-600 dark:bg-emerald-700 rounded-full"></div>
                    <div>
                      <div className="text-sm font-medium text-gray-800 dark:text-gray-100">{feed.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{feed.lastUpdate} • {feed.indicators} indicators</div>
                    </div>
                  </div>
                  <span className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">{feed.status.toUpperCase()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Dark Web Monitoring Quick Access */}
        <div className="col-span-12 lg:col-span-6">
          <div className="bg-gradient-to-br from-purple-500 to-indigo-600 shadow-sm rounded-xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Dark Web Monitoring</h2>
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center text-2xl">
                🌐
              </div>
            </div>
            <p className="text-white/90 mb-4">Monitor mentions of your organization across dark web forums, marketplaces, and paste sites.</p>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-white/10 rounded-lg p-3">
                <div className="text-2xl font-bold">5</div>
                <div className="text-xs text-white/80">New Mentions</div>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <div className="text-2xl font-bold">2</div>
                <div className="text-xs text-white/80">Critical</div>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <div className="text-2xl font-bold">247</div>
                <div className="text-xs text-white/80">Sources</div>
              </div>
            </div>
            <Link href="/threat-intelligence/dark-web" className="btn bg-white hover:bg-gray-100 text-indigo-600 w-full">
              View Dark Web Dashboard
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}

