'use client'
import { formatDate, formatDateTime } from '@/lib/utils'
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
  const [expandedAlertId, setExpandedAlertId] = useState<string | null>(null)
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

  const handleExpandAlert = (alertId: string) => {
    setExpandedAlertId(expandedAlertId === alertId ? null : alertId)
  }

  const getSeverityColor = (severity: string): string => {
    const colors: Record<string, string> = {
      'CRITICAL': '#FF3B30',  // System red
      'HIGH': '#FF9500',      // System orange
      'MEDIUM': '#FFCC00',    // System yellow
      'LOW': '#007AFF'        // System blue
    }
    return colors[severity.toUpperCase()] || '#8E8E93'
  }

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      'NEW': '#FF3B30',        // System red
      'ACTIVE': '#FF3B30',     // System red
      'INVESTIGATING': '#FF9500', // System orange
      'RESOLVED': '#34C759',   // System green
      'CLOSED': '#8E8E93'      // System gray
    }
    return colors[status.toUpperCase()] || '#8E8E93'
  }

  const formatAlertDate = (dateString: string) => {
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
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = Math.min(startIndex + itemsPerPage, filteredAlerts.length)

    return (
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700/60">
        <div className="flex items-center justify-between">
          <div className="hig-caption text-gray-600 dark:text-gray-400">
            Showing <span className="font-semibold text-gray-900 dark:text-gray-100">{startIndex + 1}</span> to{' '}
            <span className="font-semibold text-gray-900 dark:text-gray-100">{endIndex}</span> of{' '}
            <span className="font-semibold text-gray-900 dark:text-gray-100">{filteredAlerts.length}</span> results
          </div>
          <nav className="flex items-center gap-2" role="navigation">
            <button
              className={`hig-button hig-button-secondary ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => {
                handlePageChange(currentPage - 1)
                setExpandedAlertId(null)
              }}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum
                if (totalPages <= 5) {
                  pageNum = i + 1
                } else if (currentPage <= 3) {
                  pageNum = i + 1
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i
                } else {
                  pageNum = currentPage - 2 + i
                }
                return (
                    <button
                    key={pageNum}
                    className={`hig-button ${currentPage === pageNum ? 'hig-button-primary' : 'hig-button-secondary'}`}
                    onClick={() => {
                      handlePageChange(pageNum)
                      setExpandedAlertId(null)
                    }}
                  >
                    {pageNum}
                    </button>
                )
              })}
          </div>
            <button
              className={`hig-button hig-button-secondary ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => {
                handlePageChange(currentPage + 1)
                setExpandedAlertId(null)
              }}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
        </nav>
        </div>
      </div>
    )
  }

  return (
    <div className="py-8 w-full max-w-7xl mx-auto">
      {/* Page header */}
      <div className="sm:flex sm:justify-between sm:items-center mb-6 px-4 hig-fade-in">
        {/* Left: Title */}
        <div className="mb-4 sm:mb-0">
          <h1 className="hig-title-large text-gray-900 dark:text-gray-100 mb-2">All Alerts</h1>
          <p className="hig-body text-gray-600 dark:text-gray-400">Complete list of security alerts and detections</p>
        </div>

        {/* Right: Actions */}
        <div className="grid grid-flow-col sm:auto-cols-max justify-start sm:justify-end gap-2">
          {/* Search form */}
          <form className="relative">
            <label htmlFor="alert-search" className="sr-only">Search</label>
            <input 
              id="alert-search" 
              className="hig-input pl-9" 
              type="search" 
              placeholder="Search alerts…"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1) // Reset to first page on search
              }}
            />
          </form>
          {/* Date range select */}
          <select 
            className="hig-input"
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
      <div className="sticky top-16 z-40 before:absolute before:inset-0 before:backdrop-blur-xl before:bg-white/80 dark:before:bg-[#0F172A]/80 before:-z-10 border-b border-gray-200 dark:border-gray-700/60 mb-6 -mx-4 sm:-mx-6 lg:-mx-8">
        <div className="px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-6">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#FF3B30] rounded-full animate-pulse"></div>
                <span className="hig-caption font-semibold text-gray-900 dark:text-gray-100">
                  Critical: {alertsData.filter(a => a.severity === 'CRITICAL').length}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#FF9500] rounded-full"></div>
                <span className="hig-caption font-semibold text-gray-900 dark:text-gray-100">
                  High: {alertsData.filter(a => a.severity === 'HIGH').length}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#34C759] rounded-full"></div>
                <span className="hig-caption font-semibold text-gray-900 dark:text-gray-100">
                  Active: {alertsData.filter(a => a.status === 'ACTIVE').length}
                </span>
              </div>
              <div className="hig-caption">
                Total: {alertsData.length} alerts
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="hig-caption">
                Showing: {filteredAlerts.length} results
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* More actions */}
      <div className="mb-6 px-4">
        <div className="flex flex-wrap gap-2">
          <button 
            className={`hig-button ${activeFilter === 'all' ? 'hig-button-primary' : 'hig-button-secondary'}`}
            onClick={() => handleFilterChange('all')}
          >
            All <span className={`ml-2 ${activeFilter === 'all' ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'}`}>{alertsData.length}</span>
          </button>
          <button 
            className={`hig-button ${activeFilter === 'critical' ? 'hig-button-primary' : 'hig-button-secondary'}`}
            onClick={() => handleFilterChange('critical')}
          >
            Critical <span className={`ml-2 ${activeFilter === 'critical' ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'}`}>{alertsData.filter(a => a.severity === 'CRITICAL').length}</span>
          </button>
          <button 
            className={`hig-button ${activeFilter === 'high' ? 'hig-button-primary' : 'hig-button-secondary'}`}
            onClick={() => handleFilterChange('high')}
          >
            High <span className={`ml-2 ${activeFilter === 'high' ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'}`}>{alertsData.filter(a => a.severity === 'HIGH').length}</span>
          </button>
          <button 
            className={`hig-button ${activeFilter === 'active' ? 'hig-button-primary' : 'hig-button-secondary'}`}
            onClick={() => handleFilterChange('active')}
          >
            Active <span className={`ml-2 ${activeFilter === 'active' ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'}`}>{alertsData.filter(a => a.status === 'ACTIVE').length}</span>
          </button>
        </div>
      </div>

      {/* Alerts List with Expandable Details */}
      <div className="px-4">
        <div className="hig-card relative">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-gray-700/60">
            <h2 className="hig-headline text-gray-900 dark:text-gray-100">Security Alerts</h2>
            <span className="hig-caption text-gray-600 dark:text-gray-400">{filteredAlerts.length} total</span>
          </div>

              {loading ? (
          <div className="py-8 text-center">
            <div className="hig-body text-gray-500 dark:text-gray-400">Loading alerts...</div>
                    </div>
              ) : currentPageAlerts.length === 0 ? (
          <div className="py-8 text-center">
            <div className="hig-body text-gray-500 dark:text-gray-400">No alerts found</div>
                    </div>
        ) : (
          <div className="space-y-0">
            {currentPageAlerts.map((alert, idx) => {
              const isExpanded = expandedAlertId === alert.id
              const severityColor = getSeverityColor(alert.severity)
              const statusColor = getStatusColor(alert.status)
              
              return (
                <div key={alert.id}>
                  <div 
                    className={`flex items-center gap-4 p-4 cursor-pointer transition-colors ${
                      idx !== currentPageAlerts.length - 1 ? 'border-b border-gray-200 dark:border-gray-700/60' : ''
                    } ${isExpanded ? 'bg-gray-50 dark:bg-[#334155]/30' : 'hover:bg-gray-50 dark:hover:bg-[#334155]/20'}`}
                    onClick={() => handleExpandAlert(alert.id)}
                  >
                    {/* Severity Indicator */}
                    <div 
                      className="w-1 h-12 rounded-full flex-shrink-0"
                      style={{ 
                        backgroundColor: severityColor,
                        boxShadow: `0 0 8px ${severityColor}40`
                      }}
                    />
                    
                    {/* Alert ID */}
                    <div className="w-32 flex-shrink-0">
                      <span className="hig-caption font-mono text-gray-600 dark:text-gray-400">
                        {alert.id}
                      </span>
                      </div>
                    
                    {/* Title and Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="hig-body font-semibold text-gray-900 dark:text-gray-100 mb-1 line-clamp-2" title={alert.title}>
                        {alert.title}
                      </h3>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span 
                          className="hig-badge"
                          style={{
                            backgroundColor: `${severityColor}20`,
                            color: severityColor
                          }}
                        >
                          {alert.severity}
                        </span>
                        <span 
                          className="hig-badge"
                          style={{
                            backgroundColor: `${statusColor}20`,
                            color: statusColor
                          }}
                        >
                        {alert.status}
                        </span>
                        <span className="hig-caption text-gray-600 dark:text-gray-400">{alert.source}</span>
                      </div>
                    </div>
                    
                    {/* Metrics */}
                    <div className="flex items-center gap-6 flex-shrink-0">
                      <div className="text-right">
                        <div className="hig-caption text-gray-600 dark:text-gray-400">Detected</div>
                        <div className="hig-caption text-gray-900 dark:text-gray-100 font-medium mt-1">
                          {formatAlertDate(alert.detectedAt)}
                        </div>
                      </div>
                        <button 
                        onClick={(e) => {
                          e.stopPropagation()
                          handleAlertClick(alert)
                        }}
                        className="hig-caption hig-link-hover transition-colors"
                      >
                        View Details →
                        </button>
                      </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="px-4 pb-4 bg-gray-50 dark:bg-[#334155]/30 border-b border-gray-200 dark:border-gray-700/60">
                      <div className="pt-4 space-y-4">
                        {/* Description */}
                        {alert.description && (
                          <div>
                            <div className="hig-caption text-gray-600 dark:text-gray-400 mb-2 font-semibold">Description</div>
                            <div className="hig-body text-gray-700 dark:text-gray-300 leading-relaxed">
                              {alert.description}
                            </div>
                          </div>
                        )}

                        {/* Technical Details */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="hig-caption text-gray-600 dark:text-gray-400 mb-1">Source IP</div>
                            <div className="hig-body text-gray-900 dark:text-gray-100 font-mono">{alert.sourceIp}</div>
          </div>
                          <div>
                            <div className="hig-caption text-gray-600 dark:text-gray-400 mb-1">Location</div>
                            <div className="hig-body text-gray-900 dark:text-gray-100">{alert.geolocation.city}, {alert.geolocation.country}</div>
                          </div>
                          <div>
                            <div className="hig-caption text-gray-600 dark:text-gray-400 mb-1">Assigned To</div>
                            <div className="hig-body text-gray-900 dark:text-gray-100">{alert.assignedTo.analyst}</div>
                          </div>
                          <div>
                            <div className="hig-caption text-gray-600 dark:text-gray-400 mb-1">Last Updated</div>
                            <div className="hig-body text-gray-900 dark:text-gray-100">{formatAlertDate(alert.lastUpdated)}</div>
        </div>
      </div>

                        {/* Action Button */}
                        <div className="flex gap-3 pt-2">
                          <button 
                            className="hig-button hig-button-primary flex-1"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleAlertClick(alert)
                            }}
                          >
                            View Full Details
                          </button>
                        </div>
                      </div>
        </div>
      )}
                </div>
              )
            })}
          </div>
        )}
        </div>
      </div>

      {/* Pagination */}
      {!loading && filteredAlerts.length > 0 && totalPages > 1 && (
        <div className="px-4">
          {renderPagination()}
        </div>
      )}

      {/* Modal for Alert Details */}
      {selectedAlert && (
        <div className="hig-modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="hig-modal p-0 max-w-4xl w-full flex flex-col max-h-[90vh]">
            {/* Fixed Header */}
            <div 
              className="sticky top-0 z-10 backdrop-blur-xl backdrop-saturate-150 bg-white/80 dark:bg-[#1E293B]/80 border-b border-gray-200 dark:border-gray-700/60 p-6 pb-4"
              style={{
                WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                backdropFilter: 'blur(20px) saturate(180%)'
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <h2 className="hig-headline text-gray-900 dark:text-gray-100">Alert Details</h2>
                <button
                  onClick={handleClosePanel}
                  className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
                >
                  <span className="sr-only">Close</span>
                  <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  </svg>
                </button>
              </div>
              {/* Risk Indicator Bar */}
              <div 
                className="h-1 rounded-full" 
                style={{ backgroundColor: getSeverityColor(selectedAlert.severity) }}
              />
              </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
              {/* Metric Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="hig-card bg-gray-50 dark:bg-[#334155]/30 p-4 text-center">
                  <div className="hig-caption text-gray-600 dark:text-gray-400 mb-2">Confidence</div>
                  <div className="hig-metric-value text-3xl text-gray-900 dark:text-gray-100">
                    {selectedAlert.confidence}%
                      </div>
                      </div>
                <div className="hig-card bg-gray-50 dark:bg-[#334155]/30 p-4 text-center">
                  <div className="hig-caption text-gray-600 dark:text-gray-400 mb-2">False Positive Risk</div>
                  <div className="hig-metric-value text-3xl text-gray-900 dark:text-gray-100">
                    {selectedAlert.falsePositiveRisk}%
                    </div>
                  </div>
                <div className="hig-card bg-gray-50 dark:bg-[#334155]/30 p-4 text-center">
                  <div className="hig-caption text-gray-600 dark:text-gray-400 mb-2">Escalation Level</div>
                  <div className="hig-metric-value text-3xl text-gray-900 dark:text-gray-100">
                    {selectedAlert.escalationLevel}
                  </div>
                </div>
                <div className="hig-card bg-gray-50 dark:bg-[#334155]/30 p-4 text-center">
                  <div className="hig-caption text-gray-600 dark:text-gray-400 mb-2">Affected Devices</div>
                  <div className="hig-metric-value text-3xl text-gray-900 dark:text-gray-100">
                    {selectedAlert.affectedDevices.length}
                  </div>
                    </div>
                  </div>

              {/* Alert Information */}
              <div className="space-y-4 pb-4 border-b border-gray-200 dark:border-gray-700/60 mb-4">
                  <div>
                  <div className="hig-caption text-gray-600 dark:text-gray-400 mb-1">Alert ID</div>
                  <div className="hig-body font-mono text-gray-900 dark:text-gray-100">{selectedAlert.id}</div>
                  </div>
                    <div>
                  <div className="hig-caption text-gray-600 dark:text-gray-400 mb-1">Title</div>
                  <div className="hig-headline text-gray-900 dark:text-gray-100">{selectedAlert.title}</div>
                    </div>
                <div className="flex items-center gap-3">
                    <div>
                    <div className="hig-caption text-gray-600 dark:text-gray-400 mb-1">Severity</div>
                    <span 
                      className="hig-badge"
                      style={{
                        backgroundColor: `${getSeverityColor(selectedAlert.severity)}20`,
                        color: getSeverityColor(selectedAlert.severity)
                      }}
                    >
                      {selectedAlert.severity}
                    </span>
                    </div>
                  <div>
                    <div className="hig-caption text-gray-600 dark:text-gray-400 mb-1">Status</div>
                    <span 
                      className="hig-badge"
                      style={{
                        backgroundColor: `${getStatusColor(selectedAlert.status)}20`,
                        color: getStatusColor(selectedAlert.status)
                      }}
                    >
                      {selectedAlert.status}
                    </span>
                      </div>
                      </div>
                {selectedAlert.description && (
                  <div>
                    <div className="hig-caption text-gray-600 dark:text-gray-400 mb-1">Description</div>
                    <div className="hig-body text-gray-700 dark:text-gray-300 leading-relaxed">{selectedAlert.description}</div>
                    </div>
                )}
                  </div>

              {/* Detailed Information */}
              <div className="space-y-4 pb-4 border-b border-gray-200 dark:border-gray-700/60 mb-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="hig-caption text-gray-600 dark:text-gray-400 mb-1">Detected At</div>
                    <div className="hig-body text-gray-900 dark:text-gray-100">{formatAlertDate(selectedAlert.detectedAt)}</div>
                      </div>
                  <div>
                    <div className="hig-caption text-gray-600 dark:text-gray-400 mb-1">Last Updated</div>
                    <div className="hig-body text-gray-900 dark:text-gray-100">{formatAlertDate(selectedAlert.lastUpdated)}</div>
                      </div>
                  <div>
                    <div className="hig-caption text-gray-600 dark:text-gray-400 mb-1">Source</div>
                    <div className="hig-body text-gray-900 dark:text-gray-100">{selectedAlert.source}</div>
                      </div>
                  <div>
                    <div className="hig-caption text-gray-600 dark:text-gray-400 mb-1">Source IP</div>
                    <div className="hig-body font-mono text-gray-900 dark:text-gray-100">{selectedAlert.sourceIp}</div>
                    </div>
                  <div>
                    <div className="hig-caption text-gray-600 dark:text-gray-400 mb-1">Location</div>
                    <div className="hig-body text-gray-900 dark:text-gray-100">{selectedAlert.geolocation.city}, {selectedAlert.geolocation.country}</div>
                  </div>
                  <div>
                    <div className="hig-caption text-gray-600 dark:text-gray-400 mb-1">ASN</div>
                    <div className="hig-body font-mono text-gray-900 dark:text-gray-100">{selectedAlert.geolocation.asn}</div>
                      </div>
                  <div>
                    <div className="hig-caption text-gray-600 dark:text-gray-400 mb-1">Assigned To</div>
                    <div className="hig-body text-gray-900 dark:text-gray-100">{selectedAlert.assignedTo.analyst}</div>
                  </div>
                  <div>
                    <div className="hig-caption text-gray-600 dark:text-gray-400 mb-1">Team</div>
                    <div className="hig-body text-gray-900 dark:text-gray-100">{selectedAlert.assignedTo.team}</div>
                      </div>
                    </div>
                  </div>

                  {/* Affected Devices */}
                  {selectedAlert.affectedDevices.length > 0 && (
                <div className="pb-4 border-b border-gray-200 dark:border-gray-700/60 mb-4">
                  <h3 className="hig-headline mb-4">Affected Devices</h3>
                  <div className="space-y-3">
                        {selectedAlert.affectedDevices.map((device, index) => (
                      <div key={index} className="hig-card bg-gray-50 dark:bg-[#334155]/30 p-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="hig-caption text-gray-600 dark:text-gray-400 mb-1">Hostname</div>
                            <div className="hig-body text-gray-900 dark:text-gray-100">{device.hostname}</div>
                            </div>
                          <div>
                            <div className="hig-caption text-gray-600 dark:text-gray-400 mb-1">IP Address</div>
                            <div className="hig-body font-mono text-gray-900 dark:text-gray-100">{device.ip}</div>
                            </div>
                          <div>
                            <div className="hig-caption text-gray-600 dark:text-gray-400 mb-1">User</div>
                            <div className="hig-body text-gray-900 dark:text-gray-100">{device.user}</div>
                            </div>
                          <div>
                            <div className="hig-caption text-gray-600 dark:text-gray-400 mb-1">Risk Score</div>
                            <div 
                              className="hig-body font-semibold"
                              style={{
                                color: device.riskScore >= 70 ? '#FF3B30' : device.riskScore >= 40 ? '#FF9500' : '#34C759',
                                WebkitTextFillColor: device.riskScore >= 70 ? '#FF3B30' : device.riskScore >= 40 ? '#FF9500' : '#34C759'
                              }}
                            >
                                {device.riskScore}
                            </div>
                          </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Business Impact */}
              <div className="pb-4 border-b border-gray-200 dark:border-gray-700/60 mb-4">
                <h3 className="hig-headline mb-4">Business Impact</h3>
                <div className="hig-card bg-gray-50 dark:bg-[#334155]/30 p-4">
                  <div className="grid grid-cols-2 gap-4">
                  <div>
                      <div className="hig-caption text-gray-600 dark:text-gray-400 mb-1">Impact Level</div>
                      <div className="hig-body text-gray-900 dark:text-gray-100">{selectedAlert.businessImpact.level}</div>
                      </div>
                    <div>
                      <div className="hig-caption text-gray-600 dark:text-gray-400 mb-1">Potential Data Exposure</div>
                      <div className="hig-body text-gray-900 dark:text-gray-100">{selectedAlert.businessImpact.potentialDataExposure}</div>
                    </div>
                      </div>
                    </div>
                  </div>

                  {/* Containment Status */}
              <div className="pb-4 border-b border-gray-200 dark:border-gray-700/60 mb-4">
                <h3 className="hig-headline mb-4">Containment Status</h3>
                <div className="hig-card bg-gray-50 dark:bg-[#334155]/30 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="hig-caption text-gray-600 dark:text-gray-400">Contained</div>
                    <div 
                      className="hig-body font-semibold"
                      style={{
                        color: selectedAlert.containmentStatus.isContained ? '#34C759' : '#FF3B30',
                        WebkitTextFillColor: selectedAlert.containmentStatus.isContained ? '#34C759' : '#FF3B30'
                      }}
                    >
                          {selectedAlert.containmentStatus.isContained ? 'Yes' : 'No'}
                    </div>
                      </div>
                      {selectedAlert.containmentStatus.actions.length > 0 && (
                        <div>
                      <div className="hig-caption text-gray-600 dark:text-gray-400 mb-2">Actions Taken</div>
                      <ul className="space-y-1">
                            {selectedAlert.containmentStatus.actions.map((action, index) => (
                          <li key={index} className="hig-body text-gray-700 dark:text-gray-300 flex items-start gap-2">
                            <span>•</span>
                            <span>{action}</span>
                          </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Recommended Action */}
              {selectedAlert.recommendedAction && (
                <div className="pb-4 border-b border-gray-200 dark:border-gray-700/60 mb-4">
                  <h3 className="hig-headline mb-4">Recommended Action</h3>
                  <div className="hig-card bg-[#007AFF]/10 dark:bg-[#007AFF]/20 border border-[#007AFF]/30 p-4">
                    <div className="hig-body text-gray-900 dark:text-gray-100">{selectedAlert.recommendedAction}</div>
                  </div>
                </div>
              )}

                  {/* Tags */}
                  {selectedAlert.tags.length > 0 && (
                <div className="pb-4 border-b border-gray-200 dark:border-gray-700/60 mb-4">
                  <h3 className="hig-headline mb-4">Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedAlert.tags.map((tag, index) => (
                      <span 
                        key={index} 
                        className="hig-badge"
                        style={{
                          backgroundColor: 'rgba(142, 142, 147, 0.2)',
                          color: '#8E8E93'
                        }}
                      >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* MITRE Techniques */}
                  {selectedAlert.mitreTechniques.length > 0 && (
                <div className="pb-4 border-b border-gray-200 dark:border-gray-700/60 mb-4">
                  <h3 className="hig-headline mb-4">MITRE ATT&CK Techniques</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedAlert.mitreTechniques.map((technique, index) => (
                      <span 
                        key={index} 
                        className="hig-badge font-mono"
                        style={{
                          backgroundColor: '#FF3B3020',
                          color: '#FF3B30'
                        }}
                      >
                            {technique}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
            </div>

            {/* Fixed Footer */}
            <div 
              className="sticky bottom-0 z-10 backdrop-blur-xl backdrop-saturate-150 bg-white/80 dark:bg-[#1E293B]/80 border-t border-gray-200 dark:border-gray-700/60 p-6 pt-4"
              style={{
                WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                backdropFilter: 'blur(20px) saturate(180%)'
              }}
            >
              <div className="flex gap-3">
                <button className="hig-button hig-button-primary flex-1">
                  Update Status
                </button>
                <button className="hig-button hig-button-secondary flex-1" onClick={handleClosePanel}>
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

