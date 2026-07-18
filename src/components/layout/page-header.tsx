export type PageHeaderAction = {
  id: string
  label: string
  onClick: () => void
  variant?: 'primary' | 'secondary'
}

/**
 * Standard operational page header — section label, title, description,
 * actions. Editorial rather than bold: the title anchors the page without
 * shouting; supporting text carries clear contrast steps.
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
    <div className="flex items-start justify-between mb-6 gap-4">
      <div className="min-w-0">
        <p className="text-[10.5px] font-medium uppercase tracking-[0.08em] text-[color:var(--soc-text-muted)] mb-1.5">
          {section}
        </p>
        <h1 className="text-lg font-semibold tracking-[-0.01em] leading-tight mb-1 text-[color:var(--soc-text)]">
          {title}
        </h1>
        <p className="text-[13px] text-[color:var(--soc-text-secondary)] leading-relaxed">
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
