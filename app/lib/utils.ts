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