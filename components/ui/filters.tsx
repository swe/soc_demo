// Unified Filter & Tab Components

interface FilterButtonProps {
  active: boolean
  onClick: () => void
  children: React.ReactNode
  count?: number
  variant?: 'default' | 'pill'
}

export function FilterButton({ active, onClick, children, count, variant = 'default' }: FilterButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center text-sm font-medium transition-all duration-200'
  
  const variantStyles = variant === 'pill' 
    ? 'rounded-full px-4 py-1.5'
    : 'rounded-lg px-4 py-2'
  
  const activeStyles = active
    ? 'bg-indigo-600 dark:bg-indigo-600 text-white shadow-sm'
    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50'

  return (
    <button
      onClick={onClick}
      className={`${baseStyles} ${variantStyles} ${activeStyles}`}
    >
      {children}
      {count !== undefined && (
        <span className={`ml-2 ${active ? 'text-indigo-200' : 'text-gray-500 dark:text-gray-400'}`}>
          {count}
        </span>
      )}
    </button>
  )
}

interface TabButtonProps {
  active: boolean
  onClick: () => void
  children: React.ReactNode
  icon?: React.ReactNode
}

export function TabButton({ active, onClick, children, icon }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium
        border-b-2 transition-all duration-200
        ${active 
          ? 'border-indigo-600 text-indigo-600 dark:text-indigo-500' 
          : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600'
        }
      `}
    >
      {icon && <span className="w-4 h-4">{icon}</span>}
      {children}
    </button>
  )
}

interface FilterGroupProps {
  children: React.ReactNode
  className?: string
}

export function FilterGroup({ children, className = '' }: FilterGroupProps) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {children}
    </div>
  )
}

interface TabGroupProps {
  children: React.ReactNode
  className?: string
}

export function TabGroup({ children, className = '' }: TabGroupProps) {
  return (
    <div className={`flex border-b border-gray-200 dark:border-gray-700 ${className}`}>
      {children}
    </div>
  )
}

