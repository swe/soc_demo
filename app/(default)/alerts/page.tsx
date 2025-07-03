'use client';
import { useState, useRef, useEffect } from 'react';
import { fetchSecurityAlerts, SecurityAlert, getSeverityColor, getStatusColor, formatTime } from '@/lib/api';

const PAGE_SIZE = 10;

export default function SecurityAlerts() {
  const [search, setSearch] = useState('');
  const [severity, setSeverity] = useState('');
  const [status, setStatus] = useState('');
  const [selected, setSelected] = useState<number|null>(null);
  const [page, setPage] = useState(1);
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const detailsRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  // Fetch alerts from API
  useEffect(() => {
    async function loadAlerts() {
      try {
        setLoading(true);
        const fetchedAlerts = await fetchSecurityAlerts();
        setAlerts(fetchedAlerts);
        setError(null);
      } catch (err) {
        setError('Failed to load alerts');
        console.error('Error loading alerts:', err);
      } finally {
        setLoading(false);
      }
    }

    loadAlerts();
  }, []);

  // Calculate stats from actual data
  const stats = {
    totalAlerts: alerts.length,
    newAlerts: alerts.filter(alert => !alert.isCompleted && !alert.isInvestigating).length,
    investigating: alerts.filter(alert => alert.isInvestigating).length,
    resolved: alerts.filter(alert => alert.isCompleted).length,
  };

  const statCards = [
    { 
      label: 'Total Alerts', 
      value: stats.totalAlerts, 
      icon: (
        <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      ), 
      border: 'bg-yellow-500', 
      percent: Math.round((stats.totalAlerts / Math.max(stats.totalAlerts, 1)) * 100), 
      status: 'Active' 
    },
    { 
      label: 'New Alerts', 
      value: stats.newAlerts, 
      icon: (
        <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      ), 
      border: 'bg-red-500', 
      percent: Math.round((stats.newAlerts / Math.max(stats.totalAlerts, 1)) * 100), 
      status: 'New' 
    },
    { 
      label: 'Investigating', 
      value: stats.investigating, 
      icon: (
        <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
      ), 
      border: 'bg-blue-500', 
      percent: Math.round((stats.investigating / Math.max(stats.totalAlerts, 1)) * 100), 
      status: 'Investigating' 
    },
    { 
      label: 'Resolved', 
      value: stats.resolved, 
      icon: (
        <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M8 12l2 2 4-4" /></svg>
      ), 
      border: 'bg-green-500', 
      percent: Math.round((stats.resolved / Math.max(stats.totalAlerts, 1)) * 100), 
      status: 'Resolved' 
    },
  ];

  // Filter logic for actual data
  const filteredAlerts = alerts.filter(alert =>
    (!search || 
     alert.title.toLowerCase().includes(search.toLowerCase()) || 
     alert.description.toLowerCase().includes(search.toLowerCase()) ||
     alert.type.toLowerCase().includes(search.toLowerCase()) ||
     alert.country.toLowerCase().includes(search.toLowerCase()) ||
     alert.ip.toLowerCase().includes(search.toLowerCase())) &&
    (!severity || alert.severity === severity) &&
    (!status || 
     (status === 'new' && !alert.isCompleted && !alert.isInvestigating) ||
     (status === 'investigating' && alert.isInvestigating) ||
     (status === 'resolved' && alert.isCompleted))
  )
  // Sort alerts from latest to oldest by timestamp
  .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const pageCount = Math.ceil(filteredAlerts.length / PAGE_SIZE);
  const pagedAlerts = filteredAlerts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Handle click outside for details tile/modal
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        detailsRef.current &&
        !detailsRef.current.contains(event.target as Node) &&
        listRef.current &&
        !listRef.current.contains(event.target as Node)
      ) {
        setSelected(null);
      }
    }
    if (selected !== null) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [selected]);

  // Responsive check - only run on client side
  useEffect(() => {
    setHasMounted(true);
    function handleResize() {
      setIsMobile(window.innerWidth < 768);
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Pagination controls
  const goToPage = (p: number) => {
    setPage(p);
    setSelected(null);
  };

  // Don't render until mounted to prevent hydration mismatch
  if (!hasMounted) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-8 w-full mx-auto">
        <div className="sm:flex sm:justify-between sm:items-center mb-8">
          <div className="mb-4 sm:mb-0">
            <h1 className="h1">Security Alerts</h1>
          </div>
        </div>
        <div className="w-full bg-[#232b3b] border border-gray-800/60 rounded-2xl p-6 mb-8 shadow-lg">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                className="form-input w-full bg-[#1a2233] border border-gray-800/60 text-white placeholder-gray-400 rounded-lg px-4 py-3"
                placeholder="Search alerts..."
                value=""
                disabled
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <select
                className="form-select bg-[#1a2233] border border-gray-800/60 text-white rounded-lg px-4 py-3 min-w-[150px]"
                value=""
                disabled
              >
                <option value="">All Severities</option>
              </select>
              <select
                className="form-select bg-[#1a2233] border border-gray-800/60 text-white rounded-lg px-4 py-3 min-w-[150px]"
                value=""
                disabled
              >
                <option value="">All Status</option>
              </select>
            </div>
          </div>
        </div>
        <div className="relative md:flex md:gap-6 min-h-screen">
          <div className="md:flex-1 flex flex-col gap-3">
            <div className="text-center text-gray-400 py-8">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state
  if (loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-8 w-full mx-auto">
        <div className="sm:flex sm:justify-between sm:items-center mb-8">
          <div className="mb-4 sm:mb-0">
            <h1 className="h1">Security Alerts</h1>
          </div>
        </div>
        <div className="w-full bg-[#232b3b] border border-gray-800/60 rounded-2xl p-6 mb-8 shadow-lg">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                className="form-input w-full bg-[#1a2233] border border-gray-800/60 text-white placeholder-gray-400 rounded-lg px-4 py-3"
                placeholder="Search alerts..."
                value=""
                disabled
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <select
                className="form-select bg-[#1a2233] border border-gray-800/60 text-white rounded-lg px-4 py-3 min-w-[150px]"
                value=""
                disabled
              >
                <option value="">All Severities</option>
              </select>
              <select
                className="form-select bg-[#1a2233] border border-gray-800/60 text-white rounded-lg px-4 py-3 min-w-[150px]"
                value=""
                disabled
              >
                <option value="">All Status</option>
              </select>
            </div>
          </div>
        </div>
        <div className="relative md:flex md:gap-6 min-h-screen">
          <div className="md:flex-1 flex flex-col gap-3">
            <div className="text-center text-gray-400 py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
              Loading alerts...
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-8 w-full mx-auto">
        <div className="sm:flex sm:justify-between sm:items-center mb-8">
          <div className="mb-4 sm:mb-0">
            <h1 className="h1">Security Alerts</h1>
          </div>
        </div>
        <div className="w-full bg-[#232b3b] border border-gray-800/60 rounded-2xl p-6 mb-8 shadow-lg">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                className="form-input w-full bg-[#1a2233] border border-gray-800/60 text-white placeholder-gray-400 rounded-lg px-4 py-3"
                placeholder="Search alerts..."
                value=""
                disabled
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <select
                className="form-select bg-[#1a2233] border border-gray-800/60 text-white rounded-lg px-4 py-3 min-w-[150px]"
                value=""
                disabled
              >
                <option value="">All Severities</option>
              </select>
              <select
                className="form-select bg-[#1a2233] border border-gray-800/60 text-white rounded-lg px-4 py-3 min-w-[150px]"
                value=""
                disabled
              >
                <option value="">All Status</option>
              </select>
            </div>
          </div>
        </div>
        <div className="relative md:flex md:gap-6 min-h-screen">
          <div className="md:flex-1 flex flex-col gap-3">
            <div className="text-center text-red-400 py-8">
              <svg className="w-12 h-12 mx-auto mb-4 text-red-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
              <button 
                onClick={() => window.location.reload()} 
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full mx-auto">
      {/* Header */}
      <div className="sm:flex sm:justify-between sm:items-center mb-8">
        <div className="mb-4 sm:mb-0">
          <h1 className="h1">Security Alerts</h1>
        </div>
      </div>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card, index) => (
          <div key={index} className="bg-[#232b3b] border border-gray-800/60 rounded-xl p-4 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">{card.label}</p>
                <p className="text-2xl font-bold text-white">{card.value}</p>
                <p className="text-xs text-gray-500 mt-1">{card.percent}% {card.status}</p>
              </div>
              <div className={`p-3 rounded-full ${card.border} bg-opacity-20`}>
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Search and Filters - Full Width */}
      <div className="w-full bg-[#232b3b] border border-gray-800/60 rounded-2xl p-6 mb-8 shadow-lg">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              className="form-input w-full bg-[#1a2233] border border-gray-800/60 text-white placeholder-gray-400 rounded-lg px-4 py-3"
              placeholder="Search alerts..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <select
              className="form-select bg-[#1a2233] border border-gray-800/60 text-white rounded-lg px-4 py-3 min-w-[150px]"
              value={severity}
              onChange={e => setSeverity(e.target.value)}
            >
              <option value="">All Severities</option>
              <option value="informative">Informative</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
            <select
              className="form-select bg-[#1a2233] border border-gray-800/60 text-white rounded-lg px-4 py-3 min-w-[150px]"
              value={status}
              onChange={e => setStatus(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="new">New</option>
              <option value="investigating">Investigating</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>
      </div>
      {/* Alerts List + Details Tile/Modal */}
      <div className={`relative md:flex md:gap-6 min-h-screen`}>
        {/* Alerts List */}
        <div
          className={`md:flex-1 flex flex-col gap-3`}
          ref={listRef}
        >

          {pagedAlerts.map((alert, idx) => {
            const globalIdx = (page - 1) * PAGE_SIZE + idx;
            const isCollapsed = selected !== null && selected !== globalIdx;
            return (
              <div
                key={globalIdx}
                className={`bg-[#1a2233] border border-gray-800/60 rounded-xl p-3 md:p-4 flex flex-col md:flex-row md:items-center md:justify-between hover:shadow-md transition-all duration-300 cursor-pointer
                  ${selected === globalIdx ? 'ring-2 ring-blue-500 scale-[0.98]' : ''}
                  ${isCollapsed ? 'opacity-60 scale-95 max-h-16 overflow-hidden text-xs text-gray-400' : 'opacity-100 scale-100 max-h-[500px] text-base text-white'}
                `}
                style={{ transitionProperty: 'all, max-height', transitionDuration: '300ms' }}
                onClick={() => setSelected(globalIdx)}
                tabIndex={0}
                aria-selected={selected === globalIdx}
              >
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="font-semibold text-white text-base md:text-base">{alert.title}</span>
                    <span className={`text-xs text-white px-2 py-0.5 rounded-full font-semibold ${getSeverityColor(alert.severity)}`}>{alert.severity}</span>
                    <span className={`text-xs text-white px-2 py-0.5 rounded-full font-semibold ${getStatusColor(alert.status)}`}>{alert.status}</span>
                  </div>
                  <div className="text-xs text-gray-400 mb-2">{alert.description}</div>
                  <div className="flex flex-wrap gap-4 text-xs text-gray-400">
                    <span><b>Time:</b> {formatTime(alert.timestamp)}</span>
                    <span><b>Location:</b> {alert.country}</span>
                    <span><b>Source IP:</b> {alert.ip}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-4 md:mt-0 md:ml-4">
                  <button
                    className="text-gray-400 hover:text-blue-400 transition-colors p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                    title="View Details"
                    onClick={e => { e.stopPropagation(); setSelected(globalIdx); }}
                    aria-label="View details"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M1.5 12s4.5-7.5 10.5-7.5S22.5 12 22.5 12 18 19.5 12 19.5 1.5 12 1.5 12z" />
                      <circle cx="12" cy="12" r="3.5" stroke="currentColor" strokeWidth="2" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
          {/* Pagination */}
          <div className="flex justify-between items-center mt-6 text-xs text-gray-400">
            <span>Showing {(page - 1) * PAGE_SIZE + 1} to {Math.min(page * PAGE_SIZE, filteredAlerts.length)} of {filteredAlerts.length} alerts</span>
            <div className="flex gap-2 items-center">
              <button
                className="px-3 py-1 rounded bg-[#1a2233] border border-gray-800/60 text-gray-400 hover:text-white hover:bg-gray-800 transition-colors cursor-pointer"
                disabled={page === 1}
                onClick={() => goToPage(page - 1)}
              >Previous</button>
              {Array.from({ length: pageCount }, (_, i) => (
                <button
                  key={i}
                  className={`px-2 py-1 rounded cursor-pointer ${page === i + 1 ? 'bg-blue-600 text-white' : 'bg-[#1a2233] border border-gray-800/60 text-gray-400 hover:text-white hover:bg-gray-800 transition-colors'}`}
                  onClick={() => goToPage(i + 1)}
                >{i + 1}</button>
              ))}
              <button
                className="px-3 py-1 rounded bg-[#1a2233] border border-gray-800/60 text-gray-400 hover:text-white hover:bg-gray-800 transition-colors cursor-pointer"
                disabled={page === pageCount}
                onClick={() => goToPage(page + 1)}
              >Next</button>
            </div>
          </div>
        </div>
        {/* Details Tile/Modal */}
        {/* Desktop: sticky tile, Mobile: modal overlay */}
        {selected !== null && hasMounted && (
          isMobile ? (
            <div className={`fixed inset-0 z-50 flex items-end md:hidden`}>
              <div
                className={`w-full bg-[#20293a] border-t border-gray-800/60 shadow-2xl rounded-t-2xl flex flex-col p-8 max-w-lg mx-auto my-8 transition-transform duration-300 ease-in-out
                  ${selected !== null ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}
                `}
                ref={detailsRef}
                style={{ height: 'auto', maxHeight: '90vh' }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">Alert Details</h2>
                  <button
                    className="text-gray-400 hover:text-red-400 transition-colors p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500"
                    onClick={() => setSelected(null)}
                    aria-label="Close details"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="mb-4">
                  <div className="text-lg font-semibold text-white mb-1">{alerts[selected].title}</div>
                  <div className="text-gray-300 mb-2">{alerts[selected].description}</div>
                  <div className="flex gap-2 mb-4">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${getSeverityColor(alerts[selected].severity)}`}>{alerts[selected].severity}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${getStatusColor(alerts[selected].status)}`}>{alerts[selected].status}</span>
                  </div>
                  <div className="text-xs text-gray-400 mb-2">
                    <b>Timestamp</b><br />{formatTime(alerts[selected].timestamp)}
                  </div>
                  <div className="text-xs text-gray-400 mb-2">
                    <b>Location</b><br />{alerts[selected].country}
                  </div>
                  <div className="text-xs text-gray-400 mb-2">
                    <b>Source IP</b><br /><span className="font-mono text-base text-white">{alerts[selected].ip}</span>
                  </div>
                  <div className="text-xs text-gray-400 mb-2">
                    <b>Device</b><br /><span className="font-mono text-base text-white">{alerts[selected].device}</span>
                  </div>
                  <div className="text-xs text-gray-400 mb-2">
                    <b>Type</b><br />{alerts[selected].type}
                  </div>
                </div>
                <div className="flex gap-3 mt-auto">
                  <button className="flex-1 py-2 rounded-lg bg-gray-900 text-white font-semibold hover:bg-gray-800 transition-colors cursor-pointer">Investigate</button>
                  <button className="flex-1 py-2 rounded-lg bg-white text-gray-900 font-semibold hover:bg-gray-100 transition-colors cursor-pointer">Resolve</button>
                </div>
              </div>
              {/* Overlay */}
              <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={() => setSelected(null)} />
            </div>
          ) : (
            <div
              className={`transition-transform duration-300 ease-in-out
                ${selected !== null ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
                pointer-events-auto
                h-auto max-h-screen
                sticky top-[108px] w-full max-w-[420px]`
              }
              ref={detailsRef}
              style={{ alignSelf: 'flex-start' }}
            >
              <div className="bg-[#1a2233] border border-gray-800/60 rounded-xl flex flex-col p-4 w-full" style={{ height: 'auto', minHeight: '0', maxHeight: '90vh', margin: '0', overflowY: 'auto' }}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-semibold text-white">Alert Details</h2>
                  <button
                    className="text-gray-400 hover:text-red-400 transition-colors p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500"
                    onClick={() => setSelected(null)}
                    aria-label="Close details"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="mb-2">
                  <div className="text-base font-semibold text-white mb-1">{alerts[selected].title}</div>
                  <div className="text-xs text-gray-300 mb-2">{alerts[selected].description}</div>
                  <div className="flex gap-2 mb-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${getSeverityColor(alerts[selected].severity)}`}>{alerts[selected].severity}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${getStatusColor(alerts[selected].status)}`}>{alerts[selected].status}</span>
                  </div>
                  <div className="text-xs text-gray-400 mb-1">
                    <b>Timestamp</b> <span className="text-white font-mono">{formatTime(alerts[selected].timestamp)}</span>
                  </div>
                  <div className="text-xs text-gray-400 mb-1">
                    <b>Location</b> <span className="text-white font-mono">{alerts[selected].country}</span>
                  </div>
                  <div className="text-xs text-gray-400 mb-1">
                    <b>Source IP</b> <span className="font-mono text-white">{alerts[selected].ip}</span>
                  </div>
                  <div className="text-xs text-gray-400 mb-1">
                    <b>Device</b> <span className="font-mono text-white">{alerts[selected].device}</span>
                  </div>
                  <div className="text-xs text-gray-400 mb-1">
                    <b>Type</b> <span className="text-white">{alerts[selected].type}</span>
                  </div>
                </div>
                <div className="flex gap-3 mt-2">
                  <button className="flex-1 py-2 rounded-lg bg-gray-900 text-white font-semibold hover:bg-gray-800 transition-colors text-xs cursor-pointer">Investigate</button>
                  <button className="flex-1 py-2 rounded-lg bg-white text-gray-900 font-semibold hover:bg-gray-100 transition-colors text-xs cursor-pointer">Resolve</button>
                </div>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
} 