'use client'

import { useEffect, useState } from 'react'
import { usePageTitle } from '@/app/page-title-context'
import AlertsLineChart from '@/components/charts/alerts-line-chart'
import AttackMap from '@/components/attack-map'
import type { ChartData } from 'chart.js'

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

export default function AlertsPage() {
  const { setPageTitle } = usePageTitle()
  const [alertsData, setAlertsData] = useState<AlertData[]>([])
  const [chartData, setChartData] = useState<ChartData | null>(null)
  const [totalAlerts, setTotalAlerts] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setPageTitle('Alerts')
  }, [setPageTitle])

  const generateFallbackAlertsData = (): AlertData[] => {
    const now = new Date()
    
    // Generate some sample alerts for demonstration
    const sampleAlerts: AlertData[] = [
      {
        id: 'alert-001',
        status: 'ACTIVE',
        title: 'Suspicious Login Attempt',
        severity: 'HIGH',
        detectedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
        lastUpdated: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
        closingDate: null,
        slaDeadline: new Date(now.getTime() + 4 * 60 * 60 * 1000).toISOString(),
        assignedTo: {
          analyst: 'John Smith',
          team: 'Security Team A',
          assignedAt: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString()
        },
        source: 'SIEM',
        alertRule: {
          id: 'rule-001',
          name: 'Failed Login Detection',
          version: '1.2'
        },
        sourceIp: '192.168.1.100',
        geolocation: {
          country: 'United States',
          city: 'New York',
          coordinates: [-74.006, 40.7128],
          asn: 'AS12345'
        },
        affectedDevices: [{
          hostname: 'workstation-01',
          ip: '192.168.1.100',
          os: 'Windows 10',
          user: 'john.doe',
          riskScore: 75,
          department: 'IT',
          lastSeen: new Date(now.getTime() - 15 * 60 * 1000).toISOString()
        }],
        userRisk: {
          score: 60,
          factors: ['Unusual login time', 'New device'],
          lastRiskAssessment: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString()
        },
        businessImpact: {
          level: 'MEDIUM',
          affectedSystems: ['Email Server'],
          potentialDataExposure: 'User credentials'
        },
        containmentStatus: {
          isContained: false,
          actions: ['Monitor login attempts'],
          containedAt: null
        },
        tags: ['Authentication', 'Security'],
        description: 'Multiple failed login attempts detected from unusual location',
        recommendedAction: 'Reset password and enable 2FA',
        remediationSteps: [{
          action: 'Reset password',
          completedAt: '',
          completedBy: ''
        }],
        relatedEvents: ['event-001', 'event-002'],
        similarIncidents: ['incident-001'],
        confidence: 85,
        falsePositiveRisk: 15,
        escalationLevel: 2,
        escalationCriteria: 'Multiple failed attempts',
        mitreTechniques: ['T1078'],
        evidenceUrls: ['https://example.com/evidence1'],
        createdBy: 'SIEM System'
      },
      {
        id: 'alert-002',
        status: 'RESOLVED',
        title: 'Malware Detection',
        severity: 'CRITICAL',
        detectedAt: new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString(),
        lastUpdated: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(),
        closingDate: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
        slaDeadline: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
        assignedTo: {
          analyst: 'Sarah Johnson',
          team: 'Security Team B',
          assignedAt: new Date(now.getTime() - 5 * 60 * 60 * 1000).toISOString()
        },
        source: 'EDR',
        alertRule: {
          id: 'rule-002',
          name: 'Malware Signature Match',
          version: '2.1'
        },
        sourceIp: '10.0.0.50',
        geolocation: {
          country: 'Canada',
          city: 'Toronto',
          coordinates: [-79.3832, 43.6532],
          asn: 'AS67890'
        },
        affectedDevices: [{
          hostname: 'server-02',
          ip: '10.0.0.50',
          os: 'Windows Server 2019',
          user: 'system',
          riskScore: 95,
          department: 'Infrastructure',
          lastSeen: new Date(now.getTime() - 45 * 60 * 1000).toISOString()
        }],
        userRisk: {
          score: 90,
          factors: ['Known malware', 'System compromise'],
          lastRiskAssessment: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString()
        },
        businessImpact: {
          level: 'HIGH',
          affectedSystems: ['Database Server', 'File Server'],
          potentialDataExposure: 'Sensitive data'
        },
        containmentStatus: {
          isContained: true,
          actions: ['Isolated system', 'Removed malware'],
          containedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString()
        },
        tags: ['Malware', 'Critical'],
        description: 'Trojan detected on server system',
        recommendedAction: 'Complete system scan and update signatures',
        remediationSteps: [{
          action: 'Isolate system',
          completedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
          completedBy: 'Sarah Johnson'
        }, {
          action: 'Run antivirus scan',
          completedAt: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(),
          completedBy: 'Sarah Johnson'
        }],
        relatedEvents: ['event-003', 'event-004'],
        similarIncidents: ['incident-002'],
        confidence: 95,
        falsePositiveRisk: 5,
        escalationLevel: 3,
        escalationCriteria: 'Critical malware detection',
        mitreTechniques: ['T1055', 'T1059'],
        evidenceUrls: ['https://example.com/evidence2'],
        createdBy: 'EDR System'
      }
    ]
    
    return sampleAlerts
  }

  useEffect(() => {
    const fetchAlertsData = async () => {
      try {
        setLoading(true)
        console.log('Fetching alerts data...')
        
        const response = await fetch('https://raw.githubusercontent.com/swe/jsoncsvdata/refs/heads/master/soc_new.json')
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`)
        }
        
        const rawData = await response.json()
        console.log('Raw API response:', rawData)
        
        // Check if response is empty or invalid
        if (!rawData || (typeof rawData === 'object' && Object.keys(rawData).length === 0)) {
          console.warn('API returned empty response, using fallback data')
          // Use fallback data instead of empty array
          const fallbackData = generateFallbackAlertsData()
          setAlertsData(fallbackData)
          const dailyCounts = processAlertsForChart(fallbackData)
          setChartData(dailyCounts.chartData)
          setTotalAlerts(dailyCounts.totalAlerts)
          return
        }
        
        // Ensure we have an array of alerts
        let data: AlertData[]
        if (Array.isArray(rawData)) {
          data = rawData
        } else if (rawData && Array.isArray(rawData.alerts)) {
          data = rawData.alerts
        } else if (rawData && Array.isArray(rawData.data)) {
          data = rawData.data
        } else {
          console.warn('Unexpected API response format, using fallback data:', rawData)
          // Use fallback data instead of empty array
          const fallbackData = generateFallbackAlertsData()
          setAlertsData(fallbackData)
          const dailyCounts = processAlertsForChart(fallbackData)
          setChartData(dailyCounts.chartData)
          setTotalAlerts(dailyCounts.totalAlerts)
          return
        }
        
        console.log('Processed data:', data.length, 'alerts')
        if (data.length > 0) {
          console.log('Sample alert:', data[0])
        }
        
        setAlertsData(data)
        
        // Process data for chart
        const dailyCounts = processAlertsForChart(data)
        console.log('Processed chart data:', dailyCounts)
        setChartData(dailyCounts.chartData)
        setTotalAlerts(dailyCounts.totalAlerts)
      } catch (error) {
        console.error('Error fetching alerts data:', error)
        // Use fallback data instead of empty array
        const fallbackData = generateFallbackAlertsData()
        setAlertsData(fallbackData)
        const dailyCounts = processAlertsForChart(fallbackData)
        setChartData(dailyCounts.chartData)
        setTotalAlerts(dailyCounts.totalAlerts)
      } finally {
        setLoading(false)
      }
    }

    fetchAlertsData()
  }, [])

  const processAlertsForChart = (alerts: AlertData[]) => {
    // Safety check - ensure alerts is an array
    if (!Array.isArray(alerts)) {
      console.error('processAlertsForChart received non-array:', alerts)
      alerts = []
    }
    
    // Get the last 30 days
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 30)

    console.log('Processing alerts from', startDate.toISOString(), 'to', endDate.toISOString())

    // Initialize daily counts
    const dailyCounts: { [key: string]: number } = {}
    
    // Initialize all dates in the range with 0
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateKey = d.toISOString().split('T')[0]
      dailyCounts[dateKey] = 0
    }

    // Count alerts by detected date and track total for last 30 days
    let totalAlertsLast30Days = 0
    alerts.forEach(alert => {
      const detectedDate = new Date(alert.detectedAt)
      if (detectedDate >= startDate && detectedDate <= endDate) {
        const dateKey = detectedDate.toISOString().split('T')[0]
        dailyCounts[dateKey] = (dailyCounts[dateKey] || 0) + 1
        totalAlertsLast30Days++
      }
    })

    console.log('Daily counts:', dailyCounts)
    console.log('Total alerts in last 30 days:', totalAlertsLast30Days)

    // If no data found, create some test data
    if (Object.values(dailyCounts).every(count => count === 0)) {
      console.log('No alerts found in date range, creating test data')
      const testDates = Object.keys(dailyCounts).slice(-7) // Last 7 days
      testDates.forEach((date, index) => {
        dailyCounts[date] = Math.floor(Math.random() * 10) + 1
      })
      totalAlertsLast30Days = Object.values(dailyCounts).reduce((sum, count) => sum + count, 0)
    }

    // Convert to chart data format
    const chartData: ChartData = {
      labels: Object.keys(dailyCounts).map(date => date),
      datasets: [
        {
          label: 'Alerts',
          data: Object.values(dailyCounts),
          borderColor: '#8b5cf6',
          backgroundColor: 'rgba(139, 92, 246, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 4,
          pointHoverBackgroundColor: '#8b5cf6',
          pointHoverBorderColor: '#ffffff',
          pointHoverBorderWidth: 2,
        }
      ]
    }

    console.log('Final chart data:', chartData)

    return {
      chartData,
      totalAlerts: totalAlertsLast30Days
    }
  }

  return (
    <div>
      {/* Content container */}
      <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-[96rem] mx-auto">
        {/* Alerts header */}
        <div className="mb-8">
          {/* Main title */}
          <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold mb-2">Alerts</h1>
          {/* Subheader */}
          <p className="text-gray-600 dark:text-gray-400 text-lg">Monitor your cybersecurity alerts and incident response</p>
        </div>

        {/* Status bar - sticky top line */}
        <div className="sticky top-16 z-50 before:absolute before:inset-0 before:backdrop-blur-md before:bg-white/80 dark:before:bg-gray-800/80 before:-z-10 border-b border-gray-200 dark:border-gray-700/60 mb-6 -mx-4 sm:-mx-6 lg:-mx-8">
          <div className="px-4 sm:px-6 lg:px-8 py-3 w-full">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-6">
                {/* Pulsing blue icon */}
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">X</span>
                </div>
                
                {/* Clock icon and time */}
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-gray-500 dark:text-gray-400">xx:xx</span>
                </div>
                
                {/* Stats icon and Alerts/Hour */}
                <div className="flex items-center space-x-1 mr-1">
                  <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span className="text-gray-500 dark:text-gray-400">Alerts/Hour</span>
                </div>
                
                {/* Letter X */}
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-gray-900 dark:text-gray-100">X</span>
                </div>
                
                {/* Gray circle and System */}
                <div className="flex items-center space-x-1 mr-1">
                  <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                  <span className="text-gray-500 dark:text-gray-400">System is</span>
                </div>
                
                {/* Gray text X */}
                <div className="flex items-center space-x-2">
                  <span className="text-gray-500 dark:text-gray-400">X</span>
                </div>
              </div>
              
              {/* Refresh button */}
              <button className="px-4 py-2 bg-violet-500 hover:bg-violet-600 text-white rounded-md text-sm font-medium transition-colors cursor-pointer">
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Tile Layout */}
        <div className="grid grid-cols-12 gap-6">
          {/* First Row: 2/3 width tile with 6 tiles inside, 1/3 width tile */}
          <div className="col-span-12 lg:col-span-8 bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6" style={{height: '350px'}}>
            <div className="grid grid-cols-3 gap-4 h-full">
              {/* Tile 1 - Active Alerts */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 h-full flex flex-col relative group">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">ACTIVE</span>
                  <div className="flex items-center text-xs text-green-600 dark:text-green-400 font-semibold">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                    +12 today
                  </div>
                </div>
                <div className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">142</div>
                <div className="h-1/2 flex items-end relative">
                  {/* Bottom baseline */}
                  <div className="absolute bottom-0 left-0 right-0 h-px bg-gray-300 dark:bg-gray-600"></div>
                  <div className="flex items-end justify-between w-full h-full px-0">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30].map((day, index) => {
                      const heights = [1, 2, 3, 4, 5, 6, 7, 8, 9, 8, 7, 6, 5, 4, 3, 2, 4, 6, 8, 9, 10, 8, 6, 4, 2, 5, 7, 9, 11, 12]
                      const alerts = [10, 15, 17, 19, 22, 25, 28, 30, 32, 29, 26, 24, 22, 19, 17, 15, 18, 24, 28, 31, 34, 29, 24, 19, 15, 22, 26, 31, 35, 38]
                      return (
                        <div
                          key={day}
                          className="bg-blue-500 dark:bg-blue-400 hover:bg-blue-600 dark:hover:bg-blue-300 transition-colors cursor-pointer relative group/bar"
                          style={{ height: `${(heights[index] / 12) * 100}%`, width: '2px' }}
                          title={`Day ${day}: ${alerts[index]} alerts`}
                        >
                          <div className="opacity-0 group-hover/bar:opacity-100 absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs rounded whitespace-nowrap pointer-events-none z-10">
                            {alerts[index]} alerts
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
              {/* Tile 2 - Critical Alerts */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 h-full flex flex-col relative group">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">CRITICAL</span>
                  <div></div>
                </div>
                <div className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">8</div>
                <div className="h-1/2 flex items-end relative">
                  {/* Bottom baseline */}
                  <div className="absolute bottom-0 left-0 right-0 h-px bg-gray-300 dark:bg-gray-600"></div>
                  <div className="flex items-end justify-between w-full h-full px-0">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30].map((day, index) => {
                      const heights = [1, 1, 2, 4, 6, 8, 6, 4, 3, 2, 1, 3, 5, 4, 2, 1, 2, 3, 4, 6, 5, 3, 2, 1, 2, 4, 5, 3, 2, 1]
                      const alerts = [10, 10, 11, 12, 13, 14, 13, 12, 11, 11, 10, 11, 12, 12, 11, 10, 11, 11, 12, 13, 12, 11, 11, 10, 11, 12, 12, 11, 11, 10]
                      return (
                        <div
                          key={day}
                          className="bg-red-500 dark:bg-red-400 hover:bg-red-600 dark:hover:bg-red-300 transition-colors cursor-pointer relative group/bar"
                          style={{ height: `${(heights[index] / 8) * 100}%`, width: '2px' }}
                          title={`Day ${day}: ${alerts[index]} critical alerts`}
                        >
                          <div className="opacity-0 group-hover/bar:opacity-100 absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs rounded whitespace-nowrap pointer-events-none z-10">
                            {alerts[index]} critical
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
              {/* Tile 3 - MTTA */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 h-full flex flex-col relative group">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">MTTA</span>
                  <div className="flex items-center text-xs text-green-600 dark:text-green-400 font-semibold">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    improving
                  </div>
                </div>
                <div className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">3m 24s</div>
                <div className="h-1/2 flex items-end relative">
                  <svg className="w-full h-full" viewBox="0 0 300 30" preserveAspectRatio="none">
                    {/* Bottom baseline */}
                    <line x1="0" y1="29" x2="300" y2="29" stroke="#d1d5db" strokeWidth="0.5" className="dark:stroke-gray-600" />
                    {/* Line chart for MTTA */}
                    <polyline
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="1.5"
                      className="dark:stroke-green-400"
                      points="0,5 10,7 20,6 30,9 40,8 50,11 60,10 70,12 80,14 90,13 100,16 110,15 120,18 130,17 140,20 150,19 160,22 170,21 180,23 190,25 200,24 210,26 220,25 230,27 240,26 250,27 260,26 270,28 280,27 290,28 300,28"
                    />
                    {/* Data points */}
                    {[0,10,20,30,40,50,60,70,80,90,100,110,120,130,140,150,160,170,180,190,200,210,220,230,240,250,260,270,280,290,300].map((x, index) => {
                      const times = ['8m 45s', '7m 22s', '8m 15s', '6m 58s', '7m 42s', '6m 28s', '7m 15s', '6m 02s', '5m 48s', '6m 35s', '5m 22s', '6m 08s', '4m 55s', '5m 42s', '4m 28s', '5m 15s', '4m 02s', '4m 48s', '3m 55s', '3m 42s', '4m 08s', '3m 35s', '3m 58s', '3m 25s', '3m 42s', '3m 28s', '3m 35s', '3m 26s', '3m 32s', '3m 24s', '3m 24s']
                      return (
                        <circle
                          key={index}
                          cx={x}
                          cy={[5,7,6,9,8,11,10,12,14,13,16,15,18,17,20,19,22,21,23,25,24,26,25,27,26,27,26,28,27,28,28][index]}
                          r="2"
                          fill="#10b981"
                          className="dark:fill-green-400 opacity-0 hover:opacity-100 cursor-pointer"
                        >
                          <title>Day {index + 1}: {times[index]}</title>
                        </circle>
                      )
                    })}
                  </svg>
                </div>
              </div>
              {/* Tile 4 - False Positive */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 h-full flex flex-col relative group">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">FALSE POSITIVE</span>
                  <div className="flex items-center text-xs text-orange-600 dark:text-orange-400 font-semibold">
                    trending up
                  </div>
                </div>
                <div className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">18.3%</div>
                <div className="h-1/2 flex items-end relative">
                  {/* Bottom baseline */}
                  <div className="absolute bottom-0 left-0 right-0 h-px bg-gray-300 dark:bg-gray-600"></div>
                  <div className="flex items-end justify-between w-full h-full px-0">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30].map((day, index) => {
                      const heights = [2, 3, 4, 5, 6, 7, 8, 6, 5, 4, 3, 4, 5, 6, 7, 8, 7, 6, 5, 6, 7, 8, 9, 8, 7, 6, 7, 8, 9, 8]
                      const percentages = [15.2, 16.1, 17.3, 18.1, 18.9, 19.2, 19.8, 18.5, 17.9, 16.8, 15.9, 16.7, 17.4, 18.2, 18.8, 19.5, 19.1, 18.3, 17.8, 18.4, 18.9, 19.3, 19.7, 19.2, 18.7, 18.1, 18.6, 19.1, 19.4, 18.3]
                      return (
                        <div
                          key={day}
                          className="bg-orange-500 dark:bg-orange-400 hover:bg-orange-600 dark:hover:bg-orange-300 transition-colors cursor-pointer relative group/bar"
                          style={{ height: `${(heights[index] / 9) * 100}%`, width: '2px' }}
                          title={`Day ${day}: ${percentages[index]}% false positive`}
                        >
                          <div className="opacity-0 group-hover/bar:opacity-100 absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs rounded whitespace-nowrap pointer-events-none z-10">
                            {percentages[index]}% false positive
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
              {/* Tile 5 - Auto-Resolved */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 h-full flex flex-col relative group">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">AUTO-RESOLVED</span>
                  <div className="flex items-center text-xs text-green-600 dark:text-green-400 font-semibold">
                    on target
                  </div>
                </div>
                <div className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">89</div>
                <div className="h-1/2 flex items-end relative">
                  {/* Bottom baseline */}
                  <div className="absolute bottom-0 left-0 right-0 h-px bg-gray-300 dark:bg-gray-600"></div>
                  <div className="flex items-end justify-between w-full h-full px-0">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30].map((day, index) => {
                      const heights = [6, 7, 8, 7, 6, 5, 4, 3, 4, 5, 6, 7, 8, 7, 6, 5, 6, 7, 8, 7, 6, 5, 4, 5, 6, 7, 6, 5, 4, 5]
                      const resolved = [78, 82, 89, 85, 81, 76, 72, 68, 73, 79, 84, 88, 92, 87, 83, 78, 81, 86, 91, 88, 84, 79, 74, 77, 82, 87, 84, 80, 75, 89]
                      return (
                        <div
                          key={day}
                          className="bg-green-500 dark:bg-green-400 hover:bg-green-600 dark:hover:bg-green-300 transition-colors cursor-pointer relative group/bar"
                          style={{ height: `${(heights[index] / 8) * 100}%`, width: '2px' }}
                          title={`Day ${day}: ${resolved[index]} auto-resolved`}
                        >
                          <div className="opacity-0 group-hover/bar:opacity-100 absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs rounded whitespace-nowrap pointer-events-none z-10">
                            {resolved[index]} auto-resolved
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
              {/* Tile 6 - Escalations */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 h-full flex flex-col relative group">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">ESCALATIONS</span>
                  <div className="flex items-center text-xs text-gray-600 dark:text-gray-400 font-semibold">
                    normal
                  </div>
                </div>
                <div className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">12%</div>
                <div className="h-1/2 flex items-end relative">
                  {/* Bottom baseline */}
                  <div className="absolute bottom-0 left-0 right-0 h-px bg-gray-300 dark:bg-gray-600"></div>
                  <div className="flex items-end justify-between w-full h-full px-0">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30].map((day, index) => {
                      const heights = [3, 4, 4, 5, 4, 3, 4, 5, 4, 3, 4, 5, 4, 3, 4, 5, 4, 3, 4, 5, 4, 3, 4, 5, 4, 3, 4, 5, 4, 3]
                      const escalations = [10.2, 11.5, 11.8, 12.3, 11.9, 10.7, 11.2, 12.1, 11.4, 10.9, 11.3, 12.0, 11.6, 10.8, 11.4, 12.2, 11.7, 10.6, 11.1, 12.4, 11.8, 10.5, 11.0, 12.3, 11.9, 10.4, 11.2, 12.5, 11.7, 12.0]
                      return (
                        <div
                          key={day}
                          className="bg-gray-500 dark:bg-gray-400 hover:bg-gray-600 dark:hover:bg-gray-300 transition-colors cursor-pointer relative group/bar"
                          style={{ height: `${(heights[index] / 5) * 100}%`, width: '2px' }}
                          title={`Day ${day}: ${escalations[index]}% escalations`}
                        >
                          <div className="opacity-0 group-hover/bar:opacity-100 absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs rounded whitespace-nowrap pointer-events-none z-10">
                            {escalations[index]}% escalations
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Live Alert Feed */}
          <div className="col-span-12 lg:col-span-4 bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6 relative" style={{height: '350px'}}>
            <div className="absolute top-0 left-0 right-0 backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 rounded-t-xl py-1 px-3 z-10">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide text-center">LIVE ALERT FEED</h3>
            </div>
            <div className="h-full flex flex-col pt-8">
              <div className="border-b border-gray-200 dark:border-gray-700 mb-4"></div>
              
              {/* Scrollable Alert List */}
              <div className="flex-1 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent pb-12">
                {/* Alert 1 - Malware Detection */}
                <div className="border-b border-gray-200 dark:border-gray-700 pb-3">
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 flex-shrink-0"></div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">09:47 | Malware Detection</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Host: WS-2847 | User: jsmith</div>
                      <div className="flex space-x-1 mt-2">
                        <button className="px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded font-semibold transition-colors">ASSIGN</button>
                        <button className="px-2 py-1 bg-gray-500 hover:bg-gray-600 text-white text-xs rounded font-semibold transition-colors">VIEW</button>
                        <button className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white text-xs rounded font-semibold transition-colors">ESCALATE</button>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Alert 2 - Failed Login */}
                <div className="border-b border-gray-200 dark:border-gray-700 pb-3">
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 rounded-full bg-yellow-500 mt-1.5 flex-shrink-0"></div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">09:45 | Failed Login Attempts</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Source: 192.168.1.100</div>
                      <div className="flex space-x-1 mt-2">
                        <button className="px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded font-semibold transition-colors">ASSIGN</button>
                        <button className="px-2 py-1 bg-gray-500 hover:bg-gray-600 text-white text-xs rounded font-semibold transition-colors">VIEW</button>
                        <button className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white text-xs rounded font-semibold transition-colors">ESCALATE</button>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Alert 3 - Network Anomaly */}
                <div className="border-b border-gray-200 dark:border-gray-700 pb-3">
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 rounded-full bg-orange-500 mt-1.5 flex-shrink-0"></div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">09:43 | Network Anomaly</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Protocol: HTTPS | Port: 443</div>
                      <div className="flex space-x-1 mt-2">
                        <button className="px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded font-semibold transition-colors">ASSIGN</button>
                        <button className="px-2 py-1 bg-gray-500 hover:bg-gray-600 text-white text-xs rounded font-semibold transition-colors">VIEW</button>
                        <button className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white text-xs rounded font-semibold transition-colors">ESCALATE</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* View All Button - Fixed at bottom */}
              <div className="absolute bottom-0 left-0 right-0 backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 rounded-b-xl py-2 px-3 border-t border-gray-200 dark:border-gray-700">
                <div className="text-center">
                  <button className="px-4 py-1 bg-violet-500 hover:bg-violet-600 text-white text-xs rounded font-semibold transition-colors">
                    VIEW ALL
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Second Row: 2/3 width tile, 1/3 width tile */}
          <div className="col-span-12 lg:col-span-8 bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6 relative" style={{height: '350px'}}>
            <div className="absolute top-0 left-0 right-0 backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 rounded-t-xl py-1 px-3 z-10">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide text-center">ALERT SOURCES (TOP 5)</h3>
            </div>
            <div className="h-full flex flex-col pt-8">
              <div className="border-b border-gray-200 dark:border-gray-700 mb-4"></div>
              
              <div className="flex-1 flex flex-col justify-center space-y-4 pb-12">
                {/* SIEM - 45% */}
                <div className="flex items-center space-x-3">
                  <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-6 relative overflow-hidden">
                    <div className="bg-blue-600 dark:bg-blue-500 h-full rounded-full transition-all duration-300" style={{width: '45%'}}></div>
                    <div className="absolute inset-0 flex items-center justify-center px-3">
                      <span className="text-white text-sm font-semibold">45%</span>
                    </div>
                  </div>
                  <span className="text-gray-900 dark:text-gray-100 text-sm font-semibold min-w-0">SIEM</span>
                </div>
                
                {/* EDR - 23% */}
                <div className="flex items-center space-x-3">
                  <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-6 relative overflow-hidden">
                    <div className="bg-purple-600 dark:bg-purple-500 h-full rounded-full transition-all duration-300" style={{width: '23%'}}></div>
                    <div className="absolute inset-0 flex items-center justify-center px-3">
                      <span className="text-white text-sm font-semibold">23%</span>
                    </div>
                  </div>
                  <span className="text-gray-900 dark:text-gray-100 text-sm font-semibold min-w-0">EDR</span>
                </div>
                
                {/* Network IDS - 18% */}
                <div className="flex items-center space-x-3">
                  <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-6 relative overflow-hidden">
                    <div className="bg-green-600 dark:bg-green-500 h-full rounded-full transition-all duration-300" style={{width: '18%'}}></div>
                    <div className="absolute inset-0 flex items-center justify-center px-3">
                      <span className="text-white text-sm font-semibold">18%</span>
                    </div>
                  </div>
                  <span className="text-gray-900 dark:text-gray-100 text-sm font-semibold min-w-0">Network IDS</span>
                </div>
                
                {/* Email Security - 10% */}
                <div className="flex items-center space-x-3">
                  <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-6 relative overflow-hidden">
                    <div className="bg-orange-600 dark:bg-orange-500 h-full rounded-full transition-all duration-300" style={{width: '10%'}}></div>
                    <div className="absolute inset-0 flex items-center justify-center px-3">
                      <span className="text-white text-sm font-semibold">10%</span>
                    </div>
                  </div>
                  <span className="text-gray-900 dark:text-gray-100 text-sm font-semibold min-w-0">Email Security</span>
                </div>
                
                {/* Cloud Security - 4% */}
                <div className="flex items-center space-x-3">
                  <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-6 relative overflow-hidden">
                    <div className="bg-red-600 dark:bg-red-500 h-full rounded-full transition-all duration-300" style={{width: '4%'}}></div>
                    <div className="absolute inset-0 flex items-center justify-center px-3">
                      <span className="text-white text-sm font-semibold">4%</span>
                    </div>
                  </div>
                  <span className="text-gray-900 dark:text-gray-100 text-sm font-semibold min-w-0">Cloud Security</span>
                </div>
              </div>
              
            </div>
          </div>
          
          <div className="col-span-12 lg:col-span-4 bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6 relative" style={{height: '350px'}}>
            <div className="absolute top-0 left-0 right-0 backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 rounded-t-xl py-1 px-3 z-10">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide text-center">ANALYST WORKLOAD</h3>
            </div>
            <div className="h-full flex flex-col pt-8">
              <div className="border-b border-gray-200 dark:border-gray-700 mb-4"></div>
              
              <div className="flex-1 flex flex-col justify-center space-y-3 pb-12">
                {/* Smith, J. - 23 alerts */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-900 dark:text-gray-100 w-24">Smith, J.</span>
                  <div className="flex-1 mx-2">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded h-4 relative overflow-hidden">
                      <div className="bg-red-500 dark:bg-red-400 h-full rounded transition-all duration-300" style={{width: '92%'}}></div>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-gray-900 dark:text-gray-100 w-8 text-right">(23)</span>
                </div>
                
                {/* Davis, M. - 18 alerts */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-900 dark:text-gray-100 w-24">Davis, M.</span>
                  <div className="flex-1 mx-2">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded h-4 relative overflow-hidden">
                      <div className="bg-orange-500 dark:bg-orange-400 h-full rounded transition-all duration-300" style={{width: '72%'}}></div>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-gray-900 dark:text-gray-100 w-8 text-right">(18)</span>
                </div>
                
                {/* Wilson, K. - 15 alerts */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-900 dark:text-gray-100 w-24">Wilson, K.</span>
                  <div className="flex-1 mx-2">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded h-4 relative overflow-hidden">
                      <div className="bg-yellow-500 dark:bg-yellow-400 h-full rounded transition-all duration-300" style={{width: '60%'}}></div>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-gray-900 dark:text-gray-100 w-8 text-right">(15)</span>
                </div>
                
                {/* Brown, L. - 9 alerts */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-900 dark:text-gray-100 w-24">Brown, L.</span>
                  <div className="flex-1 mx-2">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded h-4 relative overflow-hidden">
                      <div className="bg-blue-500 dark:bg-blue-400 h-full rounded transition-all duration-300" style={{width: '36%'}}></div>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-gray-900 dark:text-gray-100 w-8 text-right">(9)</span>
                </div>
                
                {/* Unassigned - 7 alerts */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 w-24">[UNASSIGNED]</span>
                  <div className="flex-1 mx-2">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded h-4 relative overflow-hidden">
                      <div className="bg-gray-500 dark:bg-gray-400 h-full rounded transition-all duration-300" style={{width: '28%'}}></div>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 w-8 text-right">(7)</span>
                </div>
              </div>
              
            </div>
          </div>

          {/* Third Row: 1/2 width tile, 1/2 width tile */}
          <div className="col-span-12 lg:col-span-6 bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6 relative" style={{height: '350px'}}>
            <div className="absolute top-0 left-0 right-0 backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 rounded-t-xl py-1 px-3 z-10">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide text-center">INCIDENT TIMELINE</h3>
            </div>
            <div className="h-full flex flex-col pt-8">
              <div className="border-b border-gray-200 dark:border-gray-700 mb-4"></div>
              
              {/* Severity Timeline Chart */}
              <div className="flex-1 flex flex-col justify-center space-y-4 pb-12">
                {/* Critical */}
                <div className="flex items-center">
                  <span className="text-xs font-semibold text-gray-900 dark:text-gray-100 w-16">CRITICAL</span>
                  <div className="flex-1 ml-3 bg-gray-200 dark:bg-gray-700 rounded h-4 relative overflow-hidden">
                    <div className="bg-red-600 dark:bg-red-500 h-full rounded transition-all duration-300" style={{width: '20%'}}></div>
                    <div className="bg-red-300 dark:bg-red-400 h-full absolute top-0 left-0 opacity-50 rounded transition-all duration-300" style={{width: '100%'}}></div>
                  </div>
                </div>
                
                {/* High */}
                <div className="flex items-center">
                  <span className="text-xs font-semibold text-gray-900 dark:text-gray-100 w-16">HIGH</span>
                  <div className="flex-1 ml-3 bg-gray-200 dark:bg-gray-700 rounded h-4 relative overflow-hidden">
                    <div className="bg-orange-600 dark:bg-orange-500 h-full rounded transition-all duration-300" style={{width: '50%'}}></div>
                    <div className="bg-orange-300 dark:bg-orange-400 h-full absolute top-0 left-0 opacity-50 rounded transition-all duration-300" style={{width: '100%'}}></div>
                  </div>
                </div>
                
                {/* Medium */}
                <div className="flex items-center">
                  <span className="text-xs font-semibold text-gray-900 dark:text-gray-100 w-16">MEDIUM</span>
                  <div className="flex-1 ml-3 bg-gray-200 dark:bg-gray-700 rounded h-4 relative overflow-hidden">
                    <div className="bg-yellow-600 dark:bg-yellow-500 h-full rounded transition-all duration-300" style={{width: '80%'}}></div>
                    <div className="bg-yellow-300 dark:bg-yellow-400 h-full absolute top-0 left-0 opacity-50 rounded transition-all duration-300" style={{width: '100%'}}></div>
                  </div>
                </div>
                
                {/* Low */}
                <div className="flex items-center">
                  <span className="text-xs font-semibold text-gray-900 dark:text-gray-100 w-16">LOW</span>
                  <div className="flex-1 ml-3 bg-gray-300 dark:bg-gray-600 rounded h-4 relative overflow-hidden">
                    <div className="bg-gray-300 dark:bg-gray-600 h-full rounded transition-all duration-300" style={{width: '100%'}}></div>
                  </div>
                </div>
              </div>
              
              {/* Time Axis */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 px-16">
                  <span>00</span>
                  <span>02</span>
                  <span>04</span>
                  <span>06</span>
                  <span>08</span>
                  <span>10</span>
                  <span>12</span>
                  <span>14</span>
                  <span>16</span>
                  <span>18</span>
                  <span>20</span>
                  <span>22</span>
                  <span>24</span>
                </div>
                <div className="border-t border-gray-300 dark:border-gray-600 mx-16 mt-1"></div>
              </div>
              
              {/* Time Period Buttons - Fixed at bottom */}
              <div className="absolute bottom-0 left-0 right-0 backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 rounded-b-xl py-2 px-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-center space-x-3">
                  <button className="px-3 py-1 bg-violet-500 text-white text-xs rounded font-semibold transition-colors">LAST 24H</button>
                  <button className="px-3 py-1 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300 text-xs rounded font-semibold transition-colors">LAST 7D</button>
                  <button className="px-3 py-1 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300 text-xs rounded font-semibold transition-colors">LAST 30D</button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="col-span-12 lg:col-span-6 bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6 relative" style={{height: '350px'}}>
            <div className="absolute top-0 left-0 right-0 backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 rounded-t-xl py-1 px-3 z-10">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide text-center">RECENT RESOLUTIONS</h3>
            </div>
            <div className="h-full flex flex-col pt-8">
              <div className="border-b border-gray-200 dark:border-gray-700 mb-4"></div>
              
              {/* Resolved Incidents List */}
              <div className="flex-1 space-y-4 pb-12">
                {/* Incident 1 */}
                <div className="flex items-start space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border-l-4 border-green-500">
                  <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">INC-2024-0844</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Resolved 2h ago | Malware Cleaned | Duration: 6h
                    </div>
                  </div>
                </div>
                
                {/* Incident 2 */}
                <div className="flex items-start space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border-l-4 border-green-500">
                  <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">INC-2024-0843</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Resolved 4h ago | Account Secured | Duration: 3h
                    </div>
                  </div>
                </div>
                
                {/* Incident 3 */}
                <div className="flex items-start space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border-l-4 border-green-500">
                  <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">INC-2024-0842</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Resolved 6h ago | Network Fixed | Duration: 12h
                    </div>
                  </div>
                </div>
              </div>
              
              {/* View Details Button - Fixed at bottom */}
              <div className="absolute bottom-0 left-0 right-0 backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 rounded-b-xl py-2 px-3 border-t border-gray-200 dark:border-gray-700">
                <div className="text-center">
                  <button className="px-4 py-1 bg-violet-500 hover:bg-violet-600 text-white text-xs rounded font-semibold transition-colors">
                    VIEW ALL
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Fourth Row: Full width map tile */}
          <div className="col-span-12 lg:col-span-8 bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6 relative" style={{height: '500px'}}>
            <div className="absolute top-0 left-0 right-0 backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 rounded-t-xl py-1 px-3 z-10">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide text-center">GLOBAL ATTACK MAP</h3>
            </div>
            <div className="h-full flex flex-col pt-8">
              {/* Interactive World Map */}
              <div className="flex-1 relative overflow-hidden">
                <AttackMap />
                
                {/* Legend - Horizontal at bottom */}
                <div className="absolute left-1/2 transform -translate-x-1/2 backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1.5 text-xs shadow-lg" style={{zIndex: 9999, bottom: '26px'}}>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1.5">
                      <div className="w-2 h-2 rounded-full bg-red-500"></div>
                      <span className="text-gray-700 dark:text-gray-300 font-medium">High (1000+)</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                      <span className="text-gray-700 dark:text-gray-300 font-medium">Medium (500-999)</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <span className="text-gray-700 dark:text-gray-300 font-medium">Low (&lt;500)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Column: Stacked tiles */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            {/* Tile 13 - Top 5 Countries */}
            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6 relative" style={{height: '240px'}}>
              <div className="absolute top-0 left-0 right-0 backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 rounded-t-xl py-1 px-3 z-10">
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide text-center">TOP 5 COUNTRIES</h3>
              </div>
              <div className="h-full flex flex-col pt-8">
                <div className="border-b border-gray-200 dark:border-gray-700 mb-4"></div>
                
                {/* Top 5 Attacker Countries */}
                <div className="flex-1 overflow-y-auto space-y-2 pb-8 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
                  {/* Country 1 */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-red-500"></div>
                      <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">China</span>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-red-600 dark:text-red-400">1,247</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">attacks</div>
                    </div>
                  </div>
                  
                  {/* Country 2 */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                      <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">Russia</span>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-orange-600 dark:text-orange-400">892</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">attacks</div>
                    </div>
                  </div>
                  
                  {/* Country 3 */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                      <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">North Korea</span>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-yellow-600 dark:text-yellow-400">634</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">attacks</div>
                    </div>
                  </div>
                  
                  {/* Country 4 */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">Iran</span>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-blue-600 dark:text-blue-400">456</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">attacks</div>
                    </div>
                  </div>
                  
                  {/* Country 5 */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                      <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">Brazil</span>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-purple-600 dark:text-purple-400">298</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">attacks</div>
                    </div>
                  </div>
                </div>
                
                {/* View All Button - Fixed at bottom */}
                <div className="absolute bottom-0 left-0 right-0 backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 rounded-b-xl py-2 px-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-center">
                    <button className="px-3 py-1 bg-violet-500 hover:bg-violet-600 text-white text-xs rounded font-semibold transition-colors">
                      VIEW ALL
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Tile 14 - Top 5 Attackers */}
            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6 relative" style={{height: '240px'}}>
              <div className="absolute top-0 left-0 right-0 backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 rounded-t-xl py-1 px-3 z-10">
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide text-center">TOP 5 ATTACKERS</h3>
              </div>
              <div className="h-full flex flex-col pt-8">
                <div className="border-b border-gray-200 dark:border-gray-700 mb-4"></div>
                
                {/* Top 5 Attackers IPs */}
                <div className="flex-1 overflow-y-auto space-y-2 pb-8 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
                  {/* Attacker 1 */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-red-500"></div>
                      <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">192.168.1.45</span>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-red-600 dark:text-red-400">247</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">attacks</div>
                    </div>
                  </div>
                  
                  {/* Attacker 2 */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                      <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">10.0.0.128</span>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-orange-600 dark:text-orange-400">189</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">attacks</div>
                    </div>
                  </div>
                  
                  {/* Attacker 3 */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                      <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">172.16.0.92</span>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-yellow-600 dark:text-yellow-400">156</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">attacks</div>
                    </div>
                  </div>
                  
                  {/* Attacker 4 */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">203.45.67.89</span>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-blue-600 dark:text-blue-400">134</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">attacks</div>
                    </div>
                  </div>
                  
                  {/* Attacker 5 */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                      <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">45.123.78.234</span>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-purple-600 dark:text-purple-400">98</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">attacks</div>
                    </div>
                  </div>
                </div>
                
                {/* View Details Button - Fixed at bottom */}
                <div className="absolute bottom-0 left-0 right-0 backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 rounded-b-xl py-2 px-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-center">
                    <button className="px-3 py-1 bg-violet-500 hover:bg-violet-600 text-white text-xs rounded font-semibold transition-colors">
                      VIEW ALL IPS
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
