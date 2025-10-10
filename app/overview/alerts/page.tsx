'use client'

import { useEffect, useState } from 'react'
import { usePageTitle } from '@/app/page-title-context'

interface AlertData {
  id: string
  status: string
  title: string
  severity: string
  detectedAt: string
  lastUpdated: string
  closingDate: string | null
  slaDeadline: string
  assignedTo: {
    analyst: string
    team: string
    assignedAt: string
  }
  source: string
  alertRule: {
    id: string
    name: string
    version: string
  }
  sourceIp: string
  geolocation: {
    country: string
    city: string
    coordinates: number[]
    asn: string
  }
  affectedDevices: Array<{
    hostname: string
    ip: string
    os: string
    user: string
    riskScore: number
    department: string
    lastSeen: string
  }>
  userRisk: {
    score: number
    factors: string[]
    lastRiskAssessment: string
  }
  businessImpact: {
    level: string
    affectedSystems: string[]
    potentialDataExposure: string
  }
  containmentStatus: {
    isContained: boolean
    actions: string[]
    containedAt: string | null
  }
  tags: string[]
  description: string
  recommendedAction: string
  remediationSteps: Array<{
    action: string
    completedAt: string
    completedBy: string
  }>
  relatedEvents: string[]
  similarIncidents: string[]
  confidence: number
  falsePositiveRisk: number
  escalationLevel: number
  escalationCriteria: string
  mitreTechniques: string[]
  evidenceUrls: string[]
  createdBy: string
}

type FilterType = 'all' | 'critical' | 'high' | 'active'

export default function AllAlerts() {
  const { setPageTitle } = usePageTitle()
  const [alertsData, setAlertsData] = useState<AlertData[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [dateRange, setDateRange] = useState<'all' | 'today' | 'week' | 'month'>('all')
  const [selectedAlert, setSelectedAlert] = useState<AlertData | null>(null)
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const itemsPerPage = 15

  useEffect(() => {
    setPageTitle('All Alerts')
  }, [setPageTitle])

  const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0
      const v = c === 'x' ? r : (r & 0x3 | 0x8)
      return v.toString(16)
    })
  }

  const generateAlertId = () => {
    const uuid = generateUUID()
    const shortId = uuid.substring(0, 8)
    return `SA-${shortId}`
  }

  const generateFallbackAlertsData = (): AlertData[] => {
    const now = new Date()
    const severities = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']
    const statuses = ['NEW', 'ACTIVE', 'INVESTIGATING', 'RESOLVED', 'CLOSED']
    const sources = ['SIEM', 'EDR', 'Network IDS', 'Email Security', 'Cloud Security']
    const titles = [
      'Suspicious Login Attempt',
      'Malware Detection',
      'Network Anomaly',
      'Data Exfiltration Attempt',
      'Privilege Escalation',
      'Brute Force Attack',
      'SQL Injection Attempt',
      'Ransomware Activity',
      'Unauthorized Access',
      'DDoS Attack',
      'Phishing Email',
      'Insider Threat',
      'Zero-Day Exploit',
      'Cryptomining Activity',
      'Lateral Movement'
    ]
    
    const alerts: AlertData[] = []
    
    for (let i = 0; i < 45; i++) {
      const detectedAt = new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000)
      const status = statuses[Math.floor(Math.random() * statuses.length)]
      
      alerts.push({
        id: generateAlertId(),
        status: status,
        title: titles[Math.floor(Math.random() * titles.length)],
        severity: severities[Math.floor(Math.random() * severities.length)],
        detectedAt: detectedAt.toISOString(),
        lastUpdated: new Date(detectedAt.getTime() + Math.random() * 60 * 60 * 1000).toISOString(),
        closingDate: status === 'RESOLVED' || status === 'CLOSED' ? new Date(detectedAt.getTime() + Math.random() * 24 * 60 * 60 * 1000).toISOString() : null,
        slaDeadline: new Date(detectedAt.getTime() + 8 * 60 * 60 * 1000).toISOString(),
        assignedTo: {
          analyst: ['Sarah Chen', 'James Rodriguez', 'Michael Kim', 'Emily Taylor', 'Alex Petrov', 'Maria Garcia'][Math.floor(Math.random() * 6)],
          team: ['Security Team A', 'Security Team B', 'Incident Response'][Math.floor(Math.random() * 3)],
          assignedAt: new Date(detectedAt.getTime() + 30 * 60 * 1000).toISOString()
        },
        source: sources[Math.floor(Math.random() * sources.length)],
        alertRule: {
          id: `rule-${String(Math.floor(Math.random() * 100) + 1).padStart(3, '0')}`,
          name: 'Detection Rule',
          version: '1.' + Math.floor(Math.random() * 10)
        },
        sourceIp: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        geolocation: {
          country: ['United States', 'China', 'Russia', 'Brazil', 'India', 'Germany'][Math.floor(Math.random() * 6)],
          city: ['New York', 'Beijing', 'Moscow', 'São Paulo', 'Mumbai', 'Berlin'][Math.floor(Math.random() * 6)],
          coordinates: [-74.006 + Math.random() * 10, 40.7128 + Math.random() * 10],
          asn: `AS${Math.floor(Math.random() * 90000) + 10000}`
        },
        affectedDevices: [{
          hostname: `workstation-${String(Math.floor(Math.random() * 100) + 1).padStart(2, '0')}`,
          ip: `192.168.1.${Math.floor(Math.random() * 255)}`,
          os: ['Windows 10', 'Windows 11', 'Ubuntu 22.04', 'macOS'][Math.floor(Math.random() * 4)],
          user: ['sarah.chen', 'james.rodriguez', 'michael.kim', 'emily.taylor', 'alex.petrov', 'maria.garcia'][Math.floor(Math.random() * 6)],
          riskScore: Math.floor(Math.random() * 100),
          department: ['IT', 'Finance', 'HR', 'Operations'][Math.floor(Math.random() * 4)],
          lastSeen: new Date(now.getTime() - Math.random() * 60 * 60 * 1000).toISOString()
        }],
        userRisk: {
          score: Math.floor(Math.random() * 100),
          factors: ['Unusual login time', 'New device', 'Multiple failed attempts'],
          lastRiskAssessment: detectedAt.toISOString()
        },
        businessImpact: {
          level: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'][Math.floor(Math.random() * 4)],
          affectedSystems: ['Email Server', 'Database', 'Web Server'],
          potentialDataExposure: 'User credentials'
        },
        containmentStatus: {
          isContained: Math.random() > 0.5,
          actions: ['Monitor activity', 'Block IP'],
          containedAt: Math.random() > 0.5 ? new Date(detectedAt.getTime() + 60 * 60 * 1000).toISOString() : null
        },
        tags: ['Security', 'Authentication', 'Network'],
        description: 'Alert detected by automated system',
        recommendedAction: 'Investigate and respond according to playbook',
        remediationSteps: [],
        relatedEvents: [],
        similarIncidents: [],
        confidence: Math.floor(Math.random() * 40) + 60,
        falsePositiveRisk: Math.floor(Math.random() * 30),
        escalationLevel: Math.floor(Math.random() * 3) + 1,
        escalationCriteria: 'Standard criteria',
        mitreTechniques: ['T1078', 'T1110'],
        evidenceUrls: [],
        createdBy: 'Automated System'
      })
    }
    
    return alerts.sort((a, b) => new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime())
  }

  useEffect(() => {
    const fetchAlertsData = async () => {
      try {
        setLoading(true)
        
        const response = await fetch('https://raw.githubusercontent.com/swe/jsoncsvdata/refs/heads/master/soc_new.json')
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`)
        }
        
        const rawData = await response.json()
        
        if (!rawData || (typeof rawData === 'object' && Object.keys(rawData).length === 0)) {
          const fallbackData = generateFallbackAlertsData()
          setAlertsData(fallbackData)
          return
        }
        
        let data: AlertData[]
        if (Array.isArray(rawData)) {
          data = rawData
        } else if (rawData && Array.isArray(rawData.alerts)) {
          data = rawData.alerts
        } else if (rawData && Array.isArray(rawData.data)) {
          data = rawData.data
        } else {
          const fallbackData = generateFallbackAlertsData()
          setAlertsData(fallbackData)
          return
        }
        
        setAlertsData(data)
      } catch (error) {
        console.error('Error fetching alerts data:', error)
        const fallbackData = generateFallbackAlertsData()
        setAlertsData(fallbackData)
      } finally {
        setLoading(false)
      }
    }

    fetchAlertsData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const getFilteredAlerts = () => {
    let filtered = alertsData

    // Apply status/severity filter
    switch (activeFilter) {
      case 'critical':
        filtered = filtered.filter(a => a.severity === 'CRITICAL')
        break
      case 'high':
        filtered = filtered.filter(a => a.severity === 'HIGH')
        break
      case 'active':
        filtered = filtered.filter(a => a.status === 'ACTIVE')
        break
    }

    // Apply date range filter
    if (dateRange !== 'all') {
      const now = new Date()
      let startDate: Date

      switch (dateRange) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
          break
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        case 'month':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          break
        default:
          startDate = new Date(0)
      }

      filtered = filtered.filter(alert => {
        const alertDate = new Date(alert.detectedAt)
        return alertDate >= startDate
      })
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(alert => 
        alert.id.toLowerCase().includes(query) ||
        alert.title.toLowerCase().includes(query) ||
        alert.severity.toLowerCase().includes(query) ||
        alert.status.toLowerCase().includes(query) ||
        alert.source.toLowerCase().includes(query) ||
        alert.sourceIp.toLowerCase().includes(query)
      )
    }

    return filtered
  }

  const filteredAlerts = getFilteredAlerts()
  const totalPages = Math.ceil(filteredAlerts.length / itemsPerPage)
  
  const getCurrentPageAlerts = () => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredAlerts.slice(startIndex, endIndex)
  }

  const currentPageAlerts = getCurrentPageAlerts()

  const handleFilterChange = (filter: FilterType) => {
    setActiveFilter(filter)
    setCurrentPage(1) // Reset to first page when filter changes
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleAlertClick = (alert: AlertData) => {
    setSelectedAlert(alert)
    // Small delay to ensure the panel renders before animating
    setTimeout(() => setIsPanelOpen(true), 10)
  }

  const handleClosePanel = () => {
    setIsPanelOpen(false)
    // Wait for animation to complete before clearing selected alert
    setTimeout(() => setSelectedAlert(null), 300)
  }

  const getSeverityColor = (severity: string) => {
    switch (severity.toUpperCase()) {
      case 'CRITICAL':
        return 'bg-rose-100 dark:bg-rose-900/40 text-rose-800 dark:text-rose-300'
      case 'HIGH':
        return 'bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-300'
      case 'MEDIUM':
        return 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300'
      case 'LOW':
        return 'bg-slate-100 dark:bg-slate-900/40 text-slate-800 dark:text-slate-300'
      default:
        return 'bg-slate-100 dark:bg-slate-900/40 text-slate-800 dark:text-slate-300'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'NEW':
        return 'bg-rose-100 dark:bg-rose-900/40 text-rose-800 dark:text-rose-300'
      case 'ACTIVE':
        return 'bg-rose-100 dark:bg-rose-900/40 text-rose-800 dark:text-rose-300'
      case 'INVESTIGATING':
        return 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300'
      case 'RESOLVED':
        return 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300'
      case 'CLOSED':
        return 'bg-slate-100 dark:bg-slate-900/40 text-slate-800 dark:text-slate-300'
      default:
        return 'bg-slate-100 dark:bg-slate-900/40 text-slate-800 dark:text-slate-300'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const renderPagination = () => {
    const pageNumbers = []
    const maxVisiblePages = 5

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i)
    }

    return (
      <div>
        <nav className="flex justify-between" role="navigation" aria-label="Navigation">
          <div className="flex-1 mr-2">
            <button
              className={`btn ${currentPage === 1 ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700/60 text-gray-300 dark:text-gray-600' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700/60 hover:border-gray-300 dark:hover:border-gray-600 text-gray-800 dark:text-gray-300'}`}
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              &lt;-<span className="hidden sm:inline">&nbsp;Previous</span>
            </button>
          </div>
          <div className="grow text-center">
            <ul className="inline-flex text-sm font-medium -space-x-px">
              {startPage > 1 && (
                <>
                  <li>
                    <button
                      className="inline-flex items-center justify-center leading-5 px-2 py-2 text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-600 border border-transparent"
                      onClick={() => handlePageChange(1)}
                    >
                      <span className="w-5">1</span>
                    </button>
                  </li>
                  {startPage > 2 && (
                    <li>
                      <span className="inline-flex items-center justify-center leading-5 px-2 py-2 text-gray-400 dark:text-gray-500">…</span>
                    </li>
                  )}
                </>
              )}
              {pageNumbers.map(page => (
                <li key={page}>
                  {page === currentPage ? (
                    <span className="inline-flex items-center justify-center rounded-full leading-5 px-2 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 text-indigo-600 shadow-sm">
                      <span className="w-5">{page}</span>
                    </span>
                  ) : (
                    <button
                      className="inline-flex items-center justify-center leading-5 px-2 py-2 text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-600 border border-transparent"
                      onClick={() => handlePageChange(page)}
                    >
                      <span className="w-5">{page}</span>
                    </button>
                  )}
                </li>
              ))}
              {endPage < totalPages && (
                <>
                  {endPage < totalPages - 1 && (
                    <li>
                      <span className="inline-flex items-center justify-center leading-5 px-2 py-2 text-gray-400 dark:text-gray-500">…</span>
                    </li>
                  )}
                  <li>
                    <button
                      className="inline-flex items-center justify-center leading-5 px-2 py-2 text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-600 border border-transparent"
                      onClick={() => handlePageChange(totalPages)}
                    >
                      <span className="w-5">{totalPages}</span>
                    </button>
                  </li>
                </>
              )}
            </ul>
          </div>
          <div className="flex-1 ml-2 text-right">
            <button
              className={`btn ${currentPage === totalPages ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700/60 text-gray-300 dark:text-gray-600' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700/60 hover:border-gray-300 dark:hover:border-gray-600 text-gray-800 dark:text-gray-300'}`}
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <span className="hidden sm:inline">Next&nbsp;</span>-&gt;
            </button>
          </div>
        </nav>
      </div>
    )
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-[96rem] mx-auto">
      {/* Page header */}
      <div className="sm:flex sm:justify-between sm:items-center mb-5">
        {/* Left: Title */}
        <div className="mb-4 sm:mb-0">
          <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">All Alerts</h1>
          <p className="text-gray-600 dark:text-gray-400">Complete list of security alerts and detections</p>
        </div>

        {/* Right: Actions */}
        <div className="grid grid-flow-col sm:auto-cols-max justify-start sm:justify-end gap-2">
          {/* Search form */}
          <form className="relative">
            <label htmlFor="alert-search" className="sr-only">Search</label>
            <input 
              id="alert-search" 
              className="form-input pl-9 bg-white dark:bg-gray-800" 
              type="search" 
              placeholder="Search alerts…"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1) // Reset to first page on search
              }}
            />
            <button className="absolute inset-0 right-auto group" type="submit" aria-label="Search" onClick={(e) => e.preventDefault()}>
              <svg className="shrink-0 fill-current text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-400 ml-3 mr-2" width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 14c-3.86 0-7-3.14-7-7s3.14-7 7-7 7 3.14 7 7-3.14 7-7 7zM7 2C4.243 2 2 4.243 2 7s2.243 5 5 5 5-2.243 5-5-2.243-5-5-5z" />
                <path d="M15.707 14.293L13.314 11.9a8.019 8.019 0 01-1.414 1.414l2.393 2.393a.997.997 0 001.414 0 .999.999 0 000-1.414z" />
              </svg>
            </button>
          </form>
          {/* Date range select */}
          <select 
            className="form-select bg-white dark:bg-gray-800"
            value={dateRange}
            onChange={(e) => {
              setDateRange(e.target.value as 'all' | 'today' | 'week' | 'month')
              setCurrentPage(1) // Reset to first page on date change
            }}
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
          </select>
        </div>
      </div>

      {/* Sticky Status Bar */}
      <div className="sticky top-16 z-40 before:absolute before:inset-0 before:backdrop-blur-md before:bg-white/90 dark:before:bg-gray-800/90 before:-z-10 border-b border-gray-200 dark:border-gray-700/60 mb-5 -mx-4 sm:-mx-6 lg:-mx-8">
        <div className="px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-6">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-rose-600 dark:bg-rose-500 rounded-full animate-pulse"></div>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  Critical: {alertsData.filter(a => a.severity === 'CRITICAL').length}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-600 dark:bg-orange-500 rounded-full"></div>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  High: {alertsData.filter(a => a.severity === 'HIGH').length}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-600 dark:bg-emerald-500 rounded-full"></div>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  Active: {alertsData.filter(a => a.status === 'ACTIVE').length}
                </span>
              </div>
              <div className="text-gray-500 dark:text-gray-400">
                Total: {alertsData.length} alerts
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-gray-500 dark:text-gray-400">
                Showing: {filteredAlerts.length} results
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* More actions */}
      <div className="mb-5">
        <div className="flex flex-wrap gap-2">
          <button 
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeFilter === 'all'
                ? 'bg-indigo-600 dark:bg-indigo-500 text-white shadow-sm'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50'
            }`}
            onClick={() => handleFilterChange('all')}
          >
            All <span className={`ml-2 ${activeFilter === 'all' ? 'text-slate-200' : 'text-gray-500 dark:text-gray-400'}`}>{alertsData.length}</span>
          </button>
          <button 
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeFilter === 'critical'
                ? 'bg-indigo-600 dark:bg-indigo-500 text-white shadow-sm'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50'
            }`}
            onClick={() => handleFilterChange('critical')}
          >
            Critical <span className={`ml-2 ${activeFilter === 'critical' ? 'text-slate-200' : 'text-gray-500 dark:text-gray-400'}`}>{alertsData.filter(a => a.severity === 'CRITICAL').length}</span>
          </button>
          <button 
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeFilter === 'high'
                ? 'bg-indigo-600 dark:bg-indigo-500 text-white shadow-sm'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50'
            }`}
            onClick={() => handleFilterChange('high')}
          >
            High <span className={`ml-2 ${activeFilter === 'high' ? 'text-slate-200' : 'text-gray-500 dark:text-gray-400'}`}>{alertsData.filter(a => a.severity === 'HIGH').length}</span>
          </button>
          <button 
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeFilter === 'active'
                ? 'bg-indigo-600 dark:bg-indigo-500 text-white shadow-sm'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50'
            }`}
            onClick={() => handleFilterChange('active')}
          >
            Active <span className={`ml-2 ${activeFilter === 'active' ? 'text-slate-200' : 'text-gray-500 dark:text-gray-400'}`}>{alertsData.filter(a => a.status === 'ACTIVE').length}</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl relative">
        <header className="px-5 py-4">
          <h2 className="font-semibold text-gray-800 dark:text-gray-100">
            Security Alerts <span className="text-gray-400 dark:text-gray-500 font-medium">{filteredAlerts.length}</span>
          </h2>
        </header>
        <div>
          {/* Table */}
          <div className="overflow-x-auto">
            <table className="table-auto w-full dark:text-gray-300">
              {/* Table header */}
              <thead className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20 border-t border-b border-gray-100 dark:border-gray-700/60">
                <tr>
                  <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                    <div className="font-semibold text-left">Alert ID</div>
                  </th>
                  <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                    <div className="font-semibold text-left">Title</div>
                  </th>
                  <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                    <div className="font-semibold text-left">Severity</div>
                  </th>
                  <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                    <div className="font-semibold text-left">Status</div>
                  </th>
                  <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                    <div className="font-semibold text-left">Source</div>
                  </th>
                  <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                    <div className="font-semibold text-left">Detected At</div>
                  </th>
                  <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                    <div className="font-semibold text-left">Actions</div>
                  </th>
                </tr>
              </thead>
              {/* Table body */}
              <tbody className="text-sm divide-y divide-gray-100 dark:divide-gray-700/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-2 first:pl-5 last:pr-5 py-8 text-center">
                    <div className="flex items-center justify-center">
                      <div className="text-gray-500 dark:text-gray-400">Loading alerts...</div>
                    </div>
                  </td>
                </tr>
              ) : currentPageAlerts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-2 first:pl-5 last:pr-5 py-8 text-center">
                    <div className="flex items-center justify-center">
                      <div className="text-gray-500 dark:text-gray-400">No alerts found</div>
                    </div>
                  </td>
                </tr>
              ) : (
                currentPageAlerts.map(alert => (
                  <tr key={alert.id}>
                    <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                      <button 
                        className="font-medium text-indigo-600 hover:text-indigo-700 dark:hover:text-indigo-500 cursor-pointer"
                        onClick={() => handleAlertClick(alert)}
                      >
                        {alert.id}
                      </button>
                    </td>
                    <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                      <div className="font-medium text-gray-800 dark:text-gray-100">{alert.title}</div>
                    </td>
                    <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                      <div className={`inline-flex font-medium rounded-full text-center px-2 py-0.5 text-xs ${getSeverityColor(alert.severity)}`}>
                        {alert.severity}
                      </div>
                    </td>
                    <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                      <div className={`inline-flex font-medium rounded-full text-center px-2 py-0.5 text-xs ${getStatusColor(alert.status)}`}>
                        {alert.status}
                      </div>
                    </td>
                    <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                      <div className="text-left">{alert.source}</div>
                    </td>
                    <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                      <div className="text-left text-gray-500">{formatDate(alert.detectedAt)}</div>
                    </td>
                    <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <button 
                          className="text-gray-400 hover:text-indigo-600 dark:text-gray-500 dark:hover:text-indigo-400 transition-all duration-200 cursor-pointer"
                          onClick={() => handleAlertClick(alert)}
                        >
                          <span className="sr-only">View</span>
                          <svg className="w-8 h-8 fill-current" viewBox="0 0 32 32">
                            <path d="M16 12c-2.2 0-4 1.8-4 4s1.8 4 4 4 4-1.8 4-4-1.8-4-4-4zm0 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
                            <path d="M16 6C9.4 6 3.8 9.9 1.3 15.6c-.2.4-.2.8 0 1.2C3.8 22.1 9.4 26 16 26s12.2-3.9 14.7-9.2c.2-.4.2-.8 0-1.2C28.2 9.9 22.6 6 16 6zm0 18c-5.5 0-10.3-3.2-12.5-8 2.2-4.8 7-8 12.5-8s10.3 3.2 12.5 8c-2.2 4.8-7 8-12.5 8z"/>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Pagination */}
      {!loading && filteredAlerts.length > 0 && (
        <div className="mt-8">
          {renderPagination()}
        </div>
      )}

      {/* Sliding Panel for Alert Details */}
      {selectedAlert && (
        <>
          {/* Backdrop */}
          <div 
            className={`fixed inset-0 bg-gray-900/50 z-40 transition-opacity duration-200 ${isPanelOpen ? 'opacity-100' : 'opacity-0'}`}
            onClick={handleClosePanel}
          />
          
          {/* Sliding Panel */}
          <div className={`fixed inset-y-0 right-0 w-full md:w-4/5 lg:w-3/4 xl:w-2/3 2xl:w-1/2 bg-white dark:bg-gray-800 shadow-xl z-50 transform transition-transform duration-200 ease-in-out ${isPanelOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="h-full flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Alert Details</h2>
                <button
                  onClick={handleClosePanel}
                  className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-all duration-200"
                >
                  <span className="sr-only">Close</span>
                  <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {/* Alert ID and Status */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Alert ID</p>
                        <p className="text-lg font-semibold text-indigo-600">{selectedAlert.id}</p>
                      </div>
                      <div className={`inline-flex font-medium rounded-full text-center px-3 py-1 text-sm ${getStatusColor(selectedAlert.status)}`}>
                        {selectedAlert.status}
                      </div>
                    </div>
                  </div>

                  {/* Title */}
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Title</p>
                    <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">{selectedAlert.title}</p>
                  </div>

                  {/* Severity */}
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Severity</p>
                    <div className={`inline-flex font-medium rounded-full text-center px-3 py-1 text-sm ${getSeverityColor(selectedAlert.severity)}`}>
                      {selectedAlert.severity}
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Description</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{selectedAlert.description}</p>
                  </div>

                  {/* Timestamps */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Detected At</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{formatDate(selectedAlert.detectedAt)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Last Updated</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{formatDate(selectedAlert.lastUpdated)}</p>
                    </div>
                  </div>

                  {/* Source Information */}
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Source</p>
                    <div className="bg-gray-50 dark:bg-gray-900/20 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Type:</span>
                        <span className="text-sm font-medium text-gray-800 dark:text-gray-100">{selectedAlert.source}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">IP:</span>
                        <span className="text-sm font-medium text-gray-800 dark:text-gray-100">{selectedAlert.sourceIp}</span>
                      </div>
                    </div>
                  </div>

                  {/* Geolocation */}
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Geolocation</p>
                    <div className="bg-gray-50 dark:bg-gray-900/20 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Country:</span>
                        <span className="text-sm font-medium text-gray-800 dark:text-gray-100">{selectedAlert.geolocation.country}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">City:</span>
                        <span className="text-sm font-medium text-gray-800 dark:text-gray-100">{selectedAlert.geolocation.city}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">ASN:</span>
                        <span className="text-sm font-medium text-gray-800 dark:text-gray-100">{selectedAlert.geolocation.asn}</span>
                      </div>
                    </div>
                  </div>

                  {/* Assigned To */}
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Assigned To</p>
                    <div className="bg-gray-50 dark:bg-gray-900/20 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Analyst:</span>
                        <span className="text-sm font-medium text-gray-800 dark:text-gray-100">{selectedAlert.assignedTo.analyst}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Team:</span>
                        <span className="text-sm font-medium text-gray-800 dark:text-gray-100">{selectedAlert.assignedTo.team}</span>
                      </div>
                    </div>
                  </div>

                  {/* Affected Devices */}
                  {selectedAlert.affectedDevices.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Affected Devices</p>
                      <div className="space-y-2">
                        {selectedAlert.affectedDevices.map((device, index) => (
                          <div key={index} className="bg-gray-50 dark:bg-gray-900/20 rounded-lg p-4 space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600 dark:text-gray-400">Hostname:</span>
                              <span className="text-sm font-medium text-gray-800 dark:text-gray-100">{device.hostname}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600 dark:text-gray-400">IP:</span>
                              <span className="text-sm font-medium text-gray-800 dark:text-gray-100">{device.ip}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600 dark:text-gray-400">User:</span>
                              <span className="text-sm font-medium text-gray-800 dark:text-gray-100">{device.user}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600 dark:text-gray-400">Risk Score:</span>
                              <span className={`text-sm font-medium ${device.riskScore > 70 ? 'text-red-600 dark:text-red-400' : device.riskScore > 40 ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'}`}>
                                {device.riskScore}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Business Impact */}
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Business Impact</p>
                    <div className="bg-gray-50 dark:bg-gray-900/20 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Level:</span>
                        <span className="text-sm font-medium text-gray-800 dark:text-gray-100">{selectedAlert.businessImpact.level}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Data Exposure:</span>
                        <span className="text-sm font-medium text-gray-800 dark:text-gray-100">{selectedAlert.businessImpact.potentialDataExposure}</span>
                      </div>
                    </div>
                  </div>

                  {/* Containment Status */}
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Containment Status</p>
                    <div className="bg-gray-50 dark:bg-gray-900/20 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Contained:</span>
                        <span className={`text-sm font-medium ${selectedAlert.containmentStatus.isContained ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          {selectedAlert.containmentStatus.isContained ? 'Yes' : 'No'}
                        </span>
                      </div>
                      {selectedAlert.containmentStatus.actions.length > 0 && (
                        <div>
                          <span className="text-sm text-gray-600 dark:text-gray-400">Actions:</span>
                          <ul className="mt-1 space-y-1">
                            {selectedAlert.containmentStatus.actions.map((action, index) => (
                              <li key={index} className="text-sm text-gray-700 dark:text-gray-300 ml-4">• {action}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Recommended Action */}
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Recommended Action</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-3 rounded">
                      {selectedAlert.recommendedAction}
                    </p>
                  </div>

                  {/* Tags */}
                  {selectedAlert.tags.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Tags</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedAlert.tags.map((tag, index) => (
                          <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* MITRE Techniques */}
                  {selectedAlert.mitreTechniques.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">MITRE ATT&CK Techniques</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedAlert.mitreTechniques.map((technique, index) => (
                          <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400">
                            {technique}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

