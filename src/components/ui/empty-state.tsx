import type { ReactNode } from 'react'

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <div
        className="mb-3 flex h-10 w-10 items-center justify-center rounded-full"
        style={{ backgroundColor: 'var(--soc-overlay)', border: '1px solid var(--soc-border)' }}
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="var(--soc-text-muted)" strokeWidth="1.6">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.8-3.8" strokeLinecap="round" />
        </svg>
      </div>
      <p className="text-sm font-semibold" style={{ color: 'var(--soc-text)' }}>{title}</p>
      {description && (
        <p className="mt-1 max-w-sm text-xs" style={{ color: 'var(--soc-text-muted)' }}>{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
