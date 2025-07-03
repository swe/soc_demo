"use client";

import dynamic from 'next/dynamic';
const ThreatMap = dynamic(() => import('@/components/ThreatMap'), { ssr: false });
import { useState, useEffect } from 'react';
import { fetchSecurityAlerts, SecurityAlert, getSeverityColor, formatTime } from '@/lib/api';

const levelColors = {
  critical: 'bg-red-500 text-red-200 border-red-400',
  high: 'bg-yellow-500 text-yellow-900 border-yellow-400',
  medium: 'bg-yellow-300 text-yellow-900 border-yellow-200',
  low: 'bg-green-500 text-green-900 border-green-400',
  informative: 'bg-blue-500 text-blue-200 border-blue-400',
};

export default function MapDashboard() {
  const [mounted, setMounted] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalAttacks: 0,
    activeThreats: 0,
    countriesAffected: 0,
    criticalAlerts: 0
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !loading) {
      setShowMap(true);
    }
  }, [mounted, loading]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const alertsData = await fetchSecurityAlerts();
        setAlerts(alertsData);
        
        // Calculate map-specific statistics only after mounting
        if (mounted) {
          const now = new Date();
          const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          
          const recentAlerts = alertsData.filter(alert => {
            const alertTime = new Date(alert.timestamp);
            return alertTime >= twentyFourHoursAgo;
          });
          
          const activeThreats = alertsData.filter(alert => !alert.isCompleted).length;
          const uniqueCountries = new Set(alertsData.map(alert => alert.country)).size;
          const criticalAlerts = alertsData.filter(alert => alert.severity === 'critical').length;
          
          setStats({
            totalAttacks: recentAlerts.length,
            activeThreats,
            countriesAffected: uniqueCountries,
            criticalAlerts
          });
        }
      } catch (error) {
        console.error('Error loading alerts:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [mounted]);

  // Process data for map visualization - only after mounting
  const getMapData = () => {
    if (!mounted || !alerts.length) return { countryThreats: [], attackTypes: [] };

    // Group alerts by country and calculate threat levels
    const countryStats: Record<string, { count: number; types: Set<string>; maxSeverity: string }> = {};
    
    alerts.forEach(alert => {
      if (!countryStats[alert.country]) {
        countryStats[alert.country] = { count: 0, types: new Set(), maxSeverity: 'low' };
      }
      countryStats[alert.country].count++;
      countryStats[alert.country].types.add(alert.type);
      
      // Determine max severity
      const severityOrder = { informative: 0, low: 1, medium: 2, high: 3, critical: 4 };
      const currentMax = severityOrder[countryStats[alert.country].maxSeverity as keyof typeof severityOrder];
      const alertSeverity = severityOrder[alert.severity as keyof typeof severityOrder];
      if (alertSeverity > currentMax) {
        countryStats[alert.country].maxSeverity = alert.severity;
      }
    });

    // Convert to array and sort by count - get top 5
    const countryThreats = Object.entries(countryStats)
      .map(([country, stats]) => ({
        country,
        value: stats.count,
        tags: Array.from(stats.types).slice(0, 3), // Limit to 3 types
        level: stats.maxSeverity as 'critical' | 'high' | 'medium' | 'low' | 'informative'
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    // Get attack types distribution
    const attackTypeCounts: Record<string, number> = {};
    alerts.forEach(alert => {
      attackTypeCounts[alert.type] = (attackTypeCounts[alert.type] || 0) + 1;
    });

    const attackTypes = Object.entries(attackTypeCounts)
      .map(([type, value]) => ({ type, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);

    return { countryThreats, attackTypes };
  };

  // Calculate real-time statistics - only after mounting
  const getStatCards = () => {
    if (!mounted) return [];
    
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    const recentAlerts = alerts.filter(alert => {
      const alertTime = new Date(alert.timestamp);
      return alertTime >= twentyFourHoursAgo;
    });

    const criticalAlerts = alerts.filter(alert => alert.severity === 'critical').length;
    const activeThreats = alerts.filter(alert => !alert.isCompleted).length;
    const uniqueCountries = new Set(alerts.map(alert => alert.country)).size;

    return [
      { 
        label: 'Total Attacks', 
        value: recentAlerts.length, 
        sub: 'Last 24 hours', 
        icon: (
          <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
        ), 
        border: 'bg-orange-500', 
        percent: Math.min((recentAlerts.length / 100) * 100, 100), 
        status: `${recentAlerts.length} attacks detected` 
      },
      { 
        label: 'Active Threats', 
        value: activeThreats, 
        sub: 'Current', 
        icon: (
          <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        ), 
        border: 'bg-red-600', 
        percent: Math.min((activeThreats / 100) * 100, 100), 
        status: `${activeThreats} threats active` 
      },
      { 
        label: 'Countries Affected', 
        value: uniqueCountries, 
        sub: 'Out of monitored regions', 
        icon: (
          <svg className="w-5 h-5 text-blue-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a10 10 0 000 20" /></svg>
        ), 
        border: 'bg-green-600', 
        percent: Math.min((uniqueCountries / 20) * 100, 100), 
        status: `${uniqueCountries} countries affected` 
      },
      { 
        label: 'Critical Alerts', 
        value: criticalAlerts, 
        sub: 'Require immediate attention', 
        icon: (
          <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        ), 
        border: 'bg-blue-400', 
        percent: Math.min((criticalAlerts / 10) * 100, 100), 
        status: `${criticalAlerts} critical alerts` 
      },
    ];
  };

  const { countryThreats, attackTypes } = getMapData();
  const statCards = getStatCards();

  // Filter alerts to only include top 5 countries for the map
  const topCountryNames = countryThreats.map(threat => threat.country);
  const filteredAlerts = alerts.filter(alert => topCountryNames.includes(alert.country));

  // Don't render anything until mounted and data is loaded to prevent hydration mismatch
  if (!mounted || loading) {
    return (
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-800 border border-gray-700 rounded-lg p-4 animate-pulse">
              <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-700 rounded w-1/2"></div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-gray-800 border border-gray-700 rounded-lg p-4 animate-pulse">
            <div className="h-4 bg-gray-700 rounded w-1/4 mb-4"></div>
            <div className="h-96 bg-gray-700 rounded"></div>
          </div>
          <div className="flex flex-col gap-4">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="bg-gray-800 border border-gray-700 rounded-lg p-4 animate-pulse">
                <div className="h-4 bg-gray-700 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-700 rounded w-3/4"></div>
              </div>
            ))}
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
          <h1 className="h1">Threat Map</h1>
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
      {/* Main Content: Map and Side Tiles */}
      <div className="grid grid-cols-12 gap-6 mb-8">
        {/* Map Tile */}
        <div className="col-span-12 md:col-span-8 bg-[#232b3b] border border-gray-800/60 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-200 flex flex-col h-full min-h-[300px]">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs text-white uppercase tracking-wider font-semibold">Global Threat Map</div>
            <div className="flex items-center gap-2 bg-[#232B3B] rounded-full px-3 py-1 border border-[#2563eb]/30 shadow-sm">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-sm"></div>
              <span className="text-xs text-white font-medium">Live Updates</span>
            </div>
          </div>
          {/* Legend replaces subtitle */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#dc2626] shadow-sm"></div>
                <span className="text-xs text-white font-medium">Critical</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#f97316] shadow-sm"></div>
                <span className="text-xs text-white font-medium">High</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#f59e0b] shadow-sm"></div>
                <span className="text-xs text-white font-medium">Medium</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#10b981] shadow-sm"></div>
                <span className="text-xs text-white font-medium">Low</span>
              </div>
            </div>
          </div>
          <div className="flex-1 overflow-hidden">
            <div className="w-full h-full">
              {showMap ? (
                <ThreatMap alerts={filteredAlerts} />
              ) : (
                <div style={{ width: '100%', height: '100%', minHeight: 300, background: '#232b3b' }} />
              )}
            </div>
          </div>
        </div>
        {/* Side Tiles */}
        <div className="col-span-12 md:col-span-4 flex flex-col gap-6 h-full">
          {/* Top Threat Sources */}
          <div className="bg-[#232b3b] border border-gray-800/60 rounded-2xl p-6 flex flex-col gap-1 shadow-lg hover:shadow-xl transition-shadow duration-200 flex-1">
            <div className="text-xs text-white mb-2 uppercase tracking-wider font-semibold flex items-center justify-between">
              <span>Top Threat Sources</span>
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 3v18h18" /><rect x="7" y="13" width="3" height="5" /><rect x="12" y="9" width="3" height="9" /><rect x="17" y="5" width="3" height="13" /></svg>
            </div>
            <div className="text-xs text-white mb-2">Countries with highest attack volume</div>
            <div className="flex flex-col gap-1">
              {countryThreats.map((src, idx) => (
                <div key={src.country} className="flex items-center justify-between bg-[#1a2233] border border-gray-800/60 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <span className="text-lg text-gray-300 font-bold">#{idx + 1}</span>
                    <span className="text-white font-semibold">{src.country}</span>

                  </div>
                  <div className="flex items-right">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${levelColors[src.level]}`}>{src.level}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Attack Types */}
          <div className="bg-[#232b3b] border border-gray-800/60 rounded-2xl p-6 flex flex-col gap-1 shadow-lg hover:shadow-xl transition-shadow duration-200 flex-1">
            <div className="text-xs text-white mb-2 uppercase tracking-wider font-semibold flex items-center justify-between">
              <span>Attack Types</span>
              <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" /></svg>
            </div>
            <div className="text-xs text-white mb-2">Most common threat vectors</div>
            <div className="flex flex-col gap-1">
              {attackTypes.map((type) => (
                <div key={type.type} className="flex items-center justify-between">
                  <span className="text-white text-sm font-medium">{type.type}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-[#1a2233] rounded-full overflow-hidden">
                      <div className="h-2 bg-blue-500 rounded-full" style={{ width: `${type.value * 1.5}px` }}></div>
                    </div>
                    <span className="text-xs text-gray-300 font-semibold">{type.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 