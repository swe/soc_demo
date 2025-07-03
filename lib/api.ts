export interface SecurityAlert {
  id: string;
  title: string;
  description: string;
  severity: 'informative' | 'low' | 'medium' | 'high' | 'critical';
  status: string;
  isCompleted: boolean;
  isInvestigating: boolean;
  type: string;
  country: string;
  ip: string;
  device: string;
  timestamp: string;
}

export interface DashboardStats {
  activeAlerts: number;
  monitoredSystems: number;
  systemAvailability: number;
  activeUsers: number;
  userGrowth: number;
  activityTimeline: {
    labels: string[];
    data: number[];
  };
  severityDistribution: {
    labels: string[];
    data: number[];
  };
  topAttackTypes: {
    labels: string[];
    data: number[];
  };
  latestAlerts: SecurityAlert[];
}

const API_URL = 'https://raw.githubusercontent.com/swe/jsoncsvdata/refs/heads/master/soc.json';

export async function fetchSecurityAlerts(): Promise<SecurityAlert[]> {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching security alerts:', error);
    return [];
  }
}

export function processDashboardData(alerts: SecurityAlert[]): DashboardStats {
  // Use a fixed reference time to avoid hydration mismatches
  // This will be consistent between server and client
  const referenceTime = new Date('2024-01-01T00:00:00Z');
  const twentyFourHoursAgo = new Date(referenceTime.getTime() - 24 * 60 * 60 * 1000);

  // Active alerts (isCompleted = true)
  const activeAlerts = alerts.filter(alert => alert.isCompleted).length;

  // Monitored systems (hardcoded as per requirements)
  const monitoredSystems = 1292;
  const systemAvailability = 97.23;

  // Active users (hardcoded as per requirements)
  const activeUsers = 4762;
  const userGrowth = 0.7;

  // Activity timeline - events in last 24 hours
  const recentAlerts = alerts.filter(alert => {
    const alertTime = new Date(alert.timestamp);
    return alertTime >= twentyFourHoursAgo;
  });

  // Group by hour for timeline
  const timelineData = new Array(24).fill(0);
  const timelineLabels = Array.from({ length: 24 }, (_, i) => {
    const hour = (i + 1) % 24;
    return `${hour.toString().padStart(2, '0')}:00`;
  });

  recentAlerts.forEach(alert => {
    const alertTime = new Date(alert.timestamp);
    const hour = alertTime.getHours();
    timelineData[hour]++;
  });

  // Severity distribution
  const severityCounts: Record<string, number> = {};
  alerts.forEach(alert => {
    const severity = alert.severity;
    severityCounts[severity] = (severityCounts[severity] || 0) + 1;
  });

  const severityLabels = Object.keys(severityCounts);
  const severityData = severityLabels.map(label => severityCounts[label]);

  // Top attack types
  const attackTypeCounts: Record<string, number> = {};
  alerts.forEach(alert => {
    const type = alert.type;
    attackTypeCounts[type] = (attackTypeCounts[type] || 0) + 1;
  });

  // Sort by count and take top 4
  const sortedAttackTypes = Object.entries(attackTypeCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 4);

  const attackTypeLabels = sortedAttackTypes.map(([type]) => type);
  const attackTypeData = sortedAttackTypes.map(([, count]) => count);

  // Latest 5 alerts
  const latestAlerts = alerts
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5);

  return {
    activeAlerts,
    monitoredSystems,
    systemAvailability,
    activeUsers,
    userGrowth,
    activityTimeline: {
      labels: timelineLabels,
      data: timelineData,
    },
    severityDistribution: {
      labels: severityLabels,
      data: severityData,
    },
    topAttackTypes: {
      labels: attackTypeLabels,
      data: attackTypeData,
    },
    latestAlerts,
  };
}

export function getSeverityColor(severity: string): string {
  switch (severity.toLowerCase()) {
    case 'critical':
      return 'bg-red-600';
    case 'high':
      return 'bg-orange-500';
    case 'medium':
      return 'bg-yellow-500';
    case 'low':
      return 'bg-green-500';
    case 'informative':
      return 'bg-blue-500';
    default:
      return 'bg-gray-500';
  }
}

export function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'completed':
      return 'bg-green-600';
    case 'investigating':
      return 'bg-yellow-500';
    case 'new':
      return 'bg-blue-500';
    default:
      return 'bg-gray-500';
  }
}

export function formatTime(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
} 