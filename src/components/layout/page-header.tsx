export type PageHeaderAction = {
  id: string
  label: string
  onClick: () => void
  variant?: 'primary' | 'secondary'
}

/**
 * Standard operational page header — section label, title, description, actions.
 * Replaces OverviewPageHeader for new code; unified-ui re-exports this in CP1.
 */
export function PageHeader({
  section,
  title,
  description,
  actions = [],
}: {
  section: string
  title: string
  description: string
  actions?: PageHeaderAction[]
}) {
  return (
    <div className="flex items-start justify-between mb-5 gap-4">
      <div className="min-w-0">
        <p className="soc-label mb-1">{section}</p>
        <h1 className="text-xl font-semibold tracking-tight mb-1.5 text-[color:var(--soc-text)]">
          {title}
        </h1>
        <p className="text-sm text-[color:var(--soc-text-secondary)] leading-relaxed">
          {description}
        </p>
      </div>
      {actions.length > 0 && (
        <div className="flex items-center gap-2 mt-1 shrink-0">
          {actions.map((action) => (
            <button
              key={action.id}
              type="button"
              className={`soc-btn ${action.variant === 'secondary' ? 'soc-btn-secondary' : 'soc-btn-primary'}`}
              onClick={action.onClick}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
