import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  hover?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
  onClick?: () => void
  border?: boolean
}

export function Card({ children, className = '', hover = false, padding = 'md', onClick, border = true }: CardProps) {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  }

  const baseClasses = 'bg-white dark:bg-gray-800'
  const borderClasses = border ? 'border border-gray-200 dark:border-gray-700/60' : ''
  const hoverClasses = hover ? 'hover:border-gray-300 dark:hover:border-gray-600 transition-colors duration-150 cursor-pointer' : ''
  
  return (
    <div 
      className={`${baseClasses} ${borderClasses} ${paddingClasses[padding]} ${hoverClasses} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

interface StatCardProps {
  title: string
  value: string | number
  icon?: ReactNode
  trend?: {
    value: string
    direction: 'up' | 'down'
  }
  color?: 'rose' | 'orange' | 'amber' | 'emerald' | 'indigo'
  onClick?: () => void
}

export function StatCard({ title, value, icon, trend, color = 'indigo', onClick }: StatCardProps) {
  const colorClasses = {
    rose: {
      iconText: 'text-rose-600 dark:text-rose-400',
      trend: 'text-rose-600 dark:text-rose-400',
    },
    orange: {
      iconText: 'text-orange-600 dark:text-orange-400',
      trend: 'text-orange-600 dark:text-orange-400',
    },
    amber: {
      iconText: 'text-amber-600 dark:text-amber-400',
      trend: 'text-amber-600 dark:text-amber-400',
    },
    emerald: {
      iconText: 'text-emerald-600 dark:text-emerald-400',
      trend: 'text-emerald-600 dark:text-emerald-400',
    },
    indigo: {
      iconText: 'text-indigo-600 dark:text-indigo-400',
      trend: 'text-indigo-600 dark:text-indigo-400',
    },
  }

  const colors = colorClasses[color]
  const trendColor = trend ? (trend.direction === 'up' ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400') : ''

  return (
    <Card hover={!!onClick} onClick={onClick} padding="md">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 font-medium mb-2">{title}</div>
          <div className="text-3xl font-light text-gray-900 dark:text-gray-100 mb-1">{value}</div>
          {trend && (
            <div className={`flex items-center text-xs font-medium ${trendColor}`}>
              <span>{trend.direction === 'up' ? '↑' : '↓'} {trend.value}%</span>
            </div>
          )}
        </div>
        {icon && (
          <div className={`${colors.iconText} opacity-40`}>
            {icon}
          </div>
        )}
      </div>
    </Card>
  )
}

interface PageHeaderProps {
  title: string
  description?: string
  action?: ReactNode
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-light text-gray-900 dark:text-gray-100 mb-1">{title}</h1>
          {description && (
            <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
          )}
        </div>
        {action && <div className="ml-4">{action}</div>}
      </div>
    </div>
  )
}

interface BadgeProps {
  children: ReactNode
  variant?: 'default' | 'critical' | 'high' | 'medium' | 'low' | 'success'
}

export function Badge({ children, variant = 'default' }: BadgeProps) {
  const variants = {
    default: 'bg-gray-100 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300',
    critical: 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300',
    high: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
    medium: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
    low: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
    success: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium ${variants[variant]}`}>
      {children}
    </span>
  )
}

interface TableProps {
  headers: string[]
  children: ReactNode
}

export function Table({ headers, children }: TableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700/60">
            {headers.map((header, idx) => (
              <th 
                key={idx}
                className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700/60">
          {children}
        </tbody>
      </table>
    </div>
  )
}

