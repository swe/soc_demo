import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Consistent date formatting to avoid hydration errors
export function formatDate(input: string | number | Date): string {
  const date = typeof input === 'string' || typeof input === 'number' ? new Date(input) : input
  return format(date, 'MMM d, yyyy')
}

export function formatDateTime(input: string | number | Date): string {
  const date = typeof input === 'string' || typeof input === 'number' ? new Date(input) : input
  return format(date, 'MMM d, yyyy HH:mm')
}

export function formatDateLong(input: string | number | Date): string {
  const date = typeof input === 'string' || typeof input === 'number' ? new Date(input) : input
  return format(date, 'MMMM d, yyyy')
}

export function absoluteUrl(path: string) {
  return `${process.env.NEXT_PUBLIC_APP_URL}${path}`
}

// Locale-safe number formatting (avoids hydration mismatches)
export function formatNumber(n: number): string {
  return new Intl.NumberFormat('en-US').format(n)
}

// Locale-safe time formatting
export function formatTime(input: string | number | Date): string {
  const date = typeof input === 'string' || typeof input === 'number' ? new Date(input) : input
  return format(date, 'HH:mm:ss')
}

// ── Severity & Status Color System ──────────────────────────────
// Replaces all inline hex values (#FF3B30, #34C759, etc.)
// Maps to Tailwind palette: rose, orange, amber, emerald, indigo, gray

export type Severity = 'critical' | 'high' | 'medium' | 'low'
export type AlertStatus = 'new' | 'active' | 'investigating' | 'contained' | 'resolved' | 'escalated' | 'closed' | 'open' | 'patching' | 'mitigated' | 'compliant' | 'partial' | 'non-compliant' | 'in-progress'

export const severityConfig = {
  critical: {
    text: 'text-rose-600 dark:text-rose-400',
    bg: 'bg-rose-50 dark:bg-rose-950/30',
    badge: 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300',
    dot: 'bg-rose-500',
    border: 'border-rose-200 dark:border-rose-800/40',
  },
  high: {
    text: 'text-orange-600 dark:text-orange-400',
    bg: 'bg-orange-50 dark:bg-orange-950/30',
    badge: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
    dot: 'bg-orange-500',
    border: 'border-orange-200 dark:border-orange-800/40',
  },
  medium: {
    text: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    badge: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
    dot: 'bg-amber-500',
    border: 'border-amber-200 dark:border-amber-800/40',
  },
  low: {
    text: 'text-indigo-600 dark:text-indigo-400',
    bg: 'bg-indigo-50 dark:bg-indigo-950/30',
    badge: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300',
    dot: 'bg-indigo-500',
    border: 'border-indigo-200 dark:border-indigo-800/40',
  },
} as const

export const statusConfig = {
  new: { text: 'text-rose-600 dark:text-rose-400', badge: 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300', dot: 'bg-rose-500' },
  active: { text: 'text-rose-600 dark:text-rose-400', badge: 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300', dot: 'bg-rose-500' },
  investigating: { text: 'text-orange-600 dark:text-orange-400', badge: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300', dot: 'bg-orange-500' },
  contained: { text: 'text-blue-600 dark:text-blue-400', badge: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300', dot: 'bg-blue-500' },
  escalated: { text: 'text-rose-600 dark:text-rose-400', badge: 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300', dot: 'bg-rose-500' },
  resolved: { text: 'text-emerald-600 dark:text-emerald-400', badge: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300', dot: 'bg-emerald-500' },
  closed: { text: 'text-gray-500 dark:text-gray-400', badge: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400', dot: 'bg-gray-400' },
  open: { text: 'text-rose-600 dark:text-rose-400', badge: 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300', dot: 'bg-rose-500' },
  patching: { text: 'text-amber-600 dark:text-amber-400', badge: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300', dot: 'bg-amber-500' },
  mitigated: { text: 'text-emerald-600 dark:text-emerald-400', badge: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300', dot: 'bg-emerald-500' },
  compliant: { text: 'text-emerald-600 dark:text-emerald-400', badge: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300', dot: 'bg-emerald-500' },
  partial: { text: 'text-amber-600 dark:text-amber-400', badge: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300', dot: 'bg-amber-500' },
  'non-compliant': { text: 'text-rose-600 dark:text-rose-400', badge: 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300', dot: 'bg-rose-500' },
  'in-progress': { text: 'text-amber-600 dark:text-amber-400', badge: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300', dot: 'bg-amber-500' },
} as const

export function getSeverity(severity: string) {
  const key = severity.toLowerCase() as Severity
  return severityConfig[key] || severityConfig.low
}

export function getStatus(status: string) {
  const key = status.toLowerCase().replace(/_/g, '-') as AlertStatus
  return statusConfig[key] || statusConfig.closed
}

// Hex color helpers for inline styles (e.g. Chart.js, dynamic backgrounds)
const severityHex: Record<string, string> = {
  critical: '#e11d48',
  high: '#ea580c',
  medium: '#d97706',
  low: '#4f46e5',
}

const statusHex: Record<string, string> = {
  new: '#e11d48',
  active: '#e11d48',
  investigating: '#ea580c',
  contained: '#4f46e5',
  escalated: '#e11d48',
  resolved: '#059669',
  closed: '#6b7280',
  open: '#e11d48',
  patching: '#ea580c',
  mitigated: '#4f46e5',
  compliant: '#059669',
  partial: '#d97706',
  'non-compliant': '#e11d48',
  'in-progress': '#d97706',
}

export function getSeverityColor(severity: string): string {
  return severityHex[severity.toLowerCase()] || '#6b7280'
}

export function getStatusColor(status: string): string {
  return statusHex[status.toLowerCase().replace(/_/g, '-')] || '#6b7280'
}