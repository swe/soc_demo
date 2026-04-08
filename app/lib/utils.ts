import { format } from "date-fns"

// Consistent date formatting to avoid hydration errors
export function formatDate(input: string | number | Date): string {
  const date = typeof input === 'string' || typeof input === 'number' ? new Date(input) : input
  return format(date, 'MMM d, yyyy')
}

export function formatDateTime(input: string | number | Date): string {
  const date = typeof input === 'string' || typeof input === 'number' ? new Date(input) : input
  return format(date, 'MMM d, yyyy HH:mm')
}

// Locale-safe number formatting (avoids hydration mismatches)
export function formatNumber(n: number): string {
  return new Intl.NumberFormat('en-US').format(n)
}
