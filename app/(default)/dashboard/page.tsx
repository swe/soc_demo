"use client";

import { useMemo, useRef, useState, useEffect } from 'react';
import { Bar, Line, Pie } from 'react-chartjs-2';
import 'chart.js/auto';
import { 
  fetchSecurityAlerts, 
  processDashboardData, 
  getSeverityColor, 
  getStatusColor, 
  formatTime,
  type SecurityAlert,
  type DashboardStats 
} from '@/lib/api';

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [pieChartVisibility, setPieChartVisibility] = useState<Record<string, boolean>>({});
  const [barChartVisibility, setBarChartVisibility] = useState<Record<string, boolean>>({});

  // Fetch data on component mount
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const alerts = await fetchSecurityAlerts();
        const processedData = processDashboardData(alerts);
        setDashboardData(processedData);
        
        // Initialize visibility states for charts
        const severityVisibility: Record<string, boolean> = {};
        processedData.severityDistribution.labels.forEach(label => {
          severityVisibility[label] = true;
        });
        setPieChartVisibility(severityVisibility);

        const attackTypeVisibility: Record<string, boolean> = {};
        processedData.topAttackTypes.labels.forEach(label => {
          attackTypeVisibility[label] = true;
        });
        setBarChartVisibility(attackTypeVisibility);
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Stat cards with real data
  const statCards = useMemo(() => {
    if (!dashboardData) return [];
    
    return [
      { 
        label: 'Threat Score', 
        value: '67%', 
        icon: (
          <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
        ), 
        border: 'bg-orange-500', 
        percent: 67, 
        status: 'Medium alert status' 
      },
      { 
        label: 'Active Alerts', 
        value: dashboardData.activeAlerts, 
        icon: (
          <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        ), 
        border: 'bg-red-600', 
        percent: Math.min(dashboardData.activeAlerts, 100), 
        status: 'High alert status' 
      },
      { 
        label: 'Monitored Systems', 
        value: dashboardData.monitoredSystems.toLocaleString(), 
        icon: (
          <svg className="w-5 h-5 text-blue-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a10 10 0 000 20" /></svg>
        ), 
        border: 'bg-green-600', 
        percent: dashboardData.systemAvailability, 
        status: `${dashboardData.systemAvailability}% availability` 
      },
      { 
        label: 'Active Users', 
        value: dashboardData.activeUsers.toLocaleString(), 
        icon: (
          <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        ), 
        border: 'bg-blue-400', 
        percent: 9, 
        status: `+${dashboardData.userGrowth}% from last week` 
      },
    ];
  }, [dashboardData]);

  // Activity timeline with real data
  const activityTimeline = useMemo(() => {
    if (!dashboardData) return {
      labels: [],
      datasets: [{
        label: 'Events',
        data: [],
        borderColor: '#3b82f6',
        fill: true,
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 3,
        pointBackgroundColor: '#3b82f6',
        pointHoverBackgroundColor: '#3b82f6',
        pointBorderWidth: 0,
        pointHoverBorderWidth: 0,
        clip: 20,
        tension: 0.2,
      }]
    };

    return {
      labels: dashboardData.activityTimeline.labels,
      datasets: [
        {
          label: 'Events',
          data: dashboardData.activityTimeline.data,
          borderColor: '#3b82f6',
          fill: true,
          backgroundColor: function(context: any) {
            const chart = context.chart;
            const {ctx, chartArea} = chart;
            if (!ctx || !chartArea) return 'transparent';
            const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
            gradient.addColorStop(0, 'rgba(59, 130, 246, 0)');
            gradient.addColorStop(1, 'rgba(59, 130, 246, 0.2)');
            return gradient;
          },
          borderWidth: 2,
          pointRadius: 0,
          pointHoverRadius: 3,
          pointBackgroundColor: '#3b82f6',
          pointHoverBackgroundColor: '#3b82f6',
          pointBorderWidth: 0,
          pointHoverBorderWidth: 0,
          clip: 20,
          tension: 0.2,
        },
      ],
    };
  }, [dashboardData]);

  // Severity pie chart with real data
  const severityPie = useMemo(() => {
    if (!dashboardData) return { labels: [], datasets: [{ data: [], backgroundColor: [] }] };

    const labels = dashboardData.severityDistribution.labels;
    const data = dashboardData.severityDistribution.data;
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#f97316', '#dc2626'];
    
    // Filter data based on visibility state
    const filteredLabels = labels.filter((label) => pieChartVisibility[label]);
    const filteredData = data.filter((_, index) => pieChartVisibility[labels[index]]);
    const filteredColors = colors.filter((_, index) => pieChartVisibility[labels[index]]);

    return {
      labels: filteredLabels,
      datasets: [
        {
          data: filteredData,
          backgroundColor: filteredColors,
          borderWidth: 0,
        },
      ],
    };
  }, [dashboardData, pieChartVisibility]);

  // Attack types bar chart with real data
  const attackBar = useMemo(() => {
    if (!dashboardData) return { labels: [], datasets: [{ data: [], backgroundColor: [] }] };

    const labels = dashboardData.topAttackTypes.labels;
    const data = dashboardData.topAttackTypes.data;
    const colors = ['#5d47de', '#8470ff', '#b7acff', '#e6e1ff'];
    
    // Filter data based on visibility state
    const filteredLabels = labels.filter((label) => barChartVisibility[label]);
    const filteredData = data.filter((_, index) => barChartVisibility[labels[index]]);
    const filteredColors = colors.filter((_, index) => barChartVisibility[labels[index]]);

    return {
      labels: filteredLabels,
      datasets: [
        {
          label: 'Events',
          data: filteredData,
          backgroundColor: filteredColors,
          borderRadius: 8,
          barPercentage: 0.6,
          categoryPercentage: 0.6,
        },
      ],
    };
  }, [dashboardData, barChartVisibility]);

  const legendItems = useMemo(() => {
    if (!dashboardData) return [];
    
    const labels = dashboardData.severityDistribution.labels;
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#f97316', '#dc2626'];
    
    return labels.map((label, index) => ({
      label,
      color: colors[index] || '#6b7280'
    }));
  }, [dashboardData]);

  const barChartLegendItems = useMemo(() => {
    if (!dashboardData) return [];
    
    const labels = dashboardData.topAttackTypes.labels;
    const colors = ['#5d47de', '#8470ff', '#b7acff', '#e6e1ff'];
    
    return labels.map((label, index) => ({
      label,
      color: colors[index] || '#6b7280'
    }));
  }, [dashboardData]);

  const toggleLegendItem = (label: string) => {
    setPieChartVisibility(prev => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  const toggleBarLegendItem = (label: string) => {
    setBarChartVisibility(prev => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  if (loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-8 w-full mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-white">Loading dashboard data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-8 w-full mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-red-400">Error: {error}</div>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-8 w-full mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-white">No data available</div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full mx-auto">
      {/* Header */}
      <div className="sm:flex sm:justify-between sm:items-center mb-8">
        <div className="mb-4 sm:mb-0">
          <h1 className="h1">Dashboard</h1>
        </div>
      </div>
      {/* Stat Tiles */}
      <div className="grid grid-cols-12 gap-6 mb-8">
        {statCards.map((card, i) => (
          <div key={i} className="col-span-12 sm:col-span-6 lg:col-span-3 bg-[#232b3b] border border-gray-800/60 rounded-2xl p-6 flex flex-col justify-between shadow-lg hover:shadow-xl transition-shadow duration-200">
            <div className="text-xs text-white uppercase tracking-wider font-semibold mb-2 flex items-center justify-between">
              <span>{card.label}</span>
              <span>{card.icon}</span>
            </div>
            <div className="text-3xl font-extrabold text-white mb-2">{card.value}</div>
            <div className="w-full h-2 bg-gray-700 rounded mb-2">
              <div className={`h-2 rounded ${card.border}`} style={{ width: `${card.percent}%` }} />
            </div>
            <div className="text-xs font-semibold text-white">{card.status}</div>
          </div>
        ))}
      </div>
      {/* Main Content: Charts and Alerts */}
      <div className="grid grid-cols-12 gap-6 mb-8">
        {/* Activity Timeline */}
        <div className="col-span-12 md:col-span-4 bg-[#232b3b] border border-gray-800/60 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-200 flex flex-col min-h-[320px] max-h-[380px]">
          <div className="text-xs text-white mb-2 uppercase tracking-wider font-semibold flex items-center justify-between">
            <span>Activity Timeline</span>
            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
          </div>
          <div className="text-xs text-white mb-4">Security events over the last 24 hours</div>
          <div className="flex-1 min-h-[180px]">
            <Line
              data={activityTimeline}
              options={{
                layout: {
                  padding: 20,
                },
                scales: {
                  y: {
                    display: true,
                    beginAtZero: true,
                    border: {
                      display: false,
                    },
                    ticks: {
                      maxTicksLimit: 5,
                      color: '#94a3b8',
                      font: {
                        size: 12,
                        weight: 'bold',
                      },
                    },
                    grid: {
                      color: '#293042',
                    },
                  },
                  x: {
                    display: true,
                    border: {
                      display: false,
                    },
                    grid: {
                      color: '#293042',
                    },
                    ticks: {
                      color: '#94a3b8',
                      font: {
                        size: 12,
                        weight: 'bold',
                      },
                    },
                  },
                },
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    callbacks: {
                      title: () => '', // Disable tooltip title
                      label: (context) => `${context.parsed.y} events`,
                    },
                    bodyColor: '#94a3b8',
                    backgroundColor: '#1e293b',
                    borderColor: '#475569',
                    borderWidth: 1,
                    displayColors: false,
                    mode: 'index',
                    intersect: false,
                    position: 'nearest',
                    caretSize: 0,
                    caretPadding: 20,
                    cornerRadius: 8,
                    padding: 8,
                  },
                },
                interaction: {
                  intersect: false,
                  mode: 'index',
                },
                maintainAspectRatio: false,
                resizeDelay: 200,
              }}
              height={180}
            />
          </div>
        </div>
        {/* Severity Distribution */}
        <div className="col-span-12 md:col-span-4 bg-[#232b3b] border border-gray-800/60 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-200 flex flex-col min-h-[320px] max-h-[380px]">
          <div className="text-xs text-white mb-2 uppercase tracking-wider font-semibold flex items-center justify-between">
            <span>Severity Distribution</span>
            <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" /></svg>
          </div>
          <div className="text-xs text-white mb-4">Current alert levels by severity</div>
          <div className="flex-1 min-h-[180px] flex items-center justify-center">
            <Pie
              data={severityPie}
              options={{
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    callbacks: {
                      title: () => '', // Disable tooltip title
                      label: (context) => `${context.parsed} alerts`,
                    },
                    bodyColor: '#94a3b8',
                    backgroundColor: '#1e293b',
                    borderColor: '#475569',
                    borderWidth: 1,
                    displayColors: false,
                    mode: 'nearest',
                    intersect: false,
                    position: 'nearest',
                    caretSize: 0,
                    caretPadding: 20,
                    cornerRadius: 8,
                    padding: 8,
                  },
                },
                maintainAspectRatio: false,
              }}
              height={180}
            />
          </div>
          {/* Custom Legend */}
          <div className="mt-4">
            <ul className="flex flex-wrap justify-center -m-1">
              {legendItems.map((item) => (
                <li key={item.label} style={{ margin: '4px' }}>
                  <button
                    onClick={() => toggleLegendItem(item.label)}
                    className={`btn-xs bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-400 shadow-sm shadow-black/[0.08] rounded-full cursor-pointer ${
                      pieChartVisibility[item.label] 
                        ? 'opacity-100' 
                        : 'opacity-40'
                    }`}
                  >
                    <span
                      style={{
                        display: 'block',
                        width: '8px',
                        height: '8px',
                        backgroundColor: item.color,
                        borderRadius: '2px',
                        marginRight: '4px',
                        pointerEvents: 'none',
                      }}
                    />
                    <span className="text-xs" style={{ display: 'flex', alignItems: 'center' }}>
                      {item.label}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
        {/* Top Attack Types */}
        <div className="col-span-12 md:col-span-4 bg-[#232b3b] border border-gray-800/60 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-200 flex flex-col min-h-[320px] max-h-[380px]">
          <div className="text-xs text-white mb-2 uppercase tracking-wider font-semibold flex items-center justify-between">
            <span>Top Attack Types</span>
            <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div className="text-xs text-white mb-4">Most common threat vectors</div>
          <div className="flex-1 min-h-[180px] flex items-center justify-center">
            <Bar 
              data={attackBar} 
              options={{ 
                plugins: { 
                  legend: { display: false },
                  tooltip: {
                    callbacks: {
                      title: () => '', // Disable tooltip title
                      label: (context) => `${context.parsed.y} events`,
                    },
                    bodyColor: '#94a3b8',
                    backgroundColor: '#1e293b',
                    borderColor: '#475569',
                    borderWidth: 1,
                    displayColors: false,
                    mode: 'nearest',
                    intersect: false,
                    position: 'nearest',
                    caretSize: 0,
                    caretPadding: 20,
                    cornerRadius: 8,
                    padding: 8,
                  },
                }, 
                maintainAspectRatio: false, 
                scales: { 
                  x: { grid: { color: '#293042' }, ticks: { color: '#94a3b8' } }, 
                  y: { grid: { color: '#293042' }, ticks: { color: '#94a3b8' } } 
                } 
              }} 
              height={180} 
            />
          </div>
          {/* Custom Legend */}
          <div className="mt-4">
            <ul className="flex flex-wrap justify-center -m-1">
              {barChartLegendItems.map((item) => (
                <li key={item.label} style={{ margin: '4px' }}>
                  <button
                    onClick={() => toggleBarLegendItem(item.label)}
                    className={`btn-xs bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-400 shadow-sm shadow-black/[0.08] rounded-full cursor-pointer ${
                      barChartVisibility[item.label] 
                        ? 'opacity-100' 
                        : 'opacity-40'
                    }`}
                  >
                    <span
                      style={{
                        display: 'block',
                        width: '8px',
                        height: '8px',
                        borderRadius: '9999px',
                        marginRight: '4px',
                        borderWidth: '2px',
                        borderColor: item.color,
                        pointerEvents: 'none',
                      }}
                    />
                    <span className="text-xs" style={{ display: 'flex', alignItems: 'center' }}>
                      {item.label}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      {/* Latest Security Alerts */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 bg-[#232b3b] border border-gray-800/60 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-200 flex flex-col">
          <div className="text-xs text-white mb-2 uppercase tracking-wider font-semibold">Latest Security Alerts</div>
                      <div className="text-xs text-white mb-4">Most recent security events</div>
            <div className="space-y-3">
              {dashboardData.latestAlerts.map((alert: SecurityAlert, idx: number) => (
                <div key={alert.id} className="bg-[#1a2233] border border-gray-800/60 rounded-xl p-4 flex items-center justify-between hover:shadow-md transition-shadow duration-200">
                  <div>
                    <div className="font-semibold text-white mb-1 text-base">{alert.title}</div>
                    <div className="text-xs text-gray-400 mb-2">{alert.description}</div>
                    <div className="flex gap-2 flex-wrap">
                      <span className={`text-xs text-white px-2 py-0.5 rounded-full shadow-sm font-semibold ${getSeverityColor(alert.severity)}`}>
                        {alert.severity}
                      </span>
                      <span className={`text-xs text-white px-2 py-0.5 rounded-full shadow-sm font-semibold ${getStatusColor(alert.status)}`}>
                        {alert.status}
                      </span>
                      <span className="text-xs text-white px-2 py-0.5 rounded-full shadow-sm font-semibold bg-blue-600">
                        {alert.country}
                      </span>
                      <span className="text-xs text-white px-2 py-0.5 rounded-full shadow-sm font-semibold bg-gray-600">
                        {alert.type}
                      </span>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 ml-4 whitespace-nowrap font-mono">{formatTime(alert.timestamp)}</div>
                </div>
              ))}
            </div>
        </div>
      </div>
    </div>
  )
}
