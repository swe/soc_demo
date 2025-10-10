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

  const baseClasses = 'bg-white dark:bg-gray-800 rounded-lg shadow-sm'
  const borderClasses = border ? 'border border-gray-200 dark:border-gray-700/60' : ''
  const hoverClasses = hover ? 'hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 cursor-pointer' : ''
  
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
      iconBg: 'bg-rose-50 dark:bg-rose-900/20',
      iconText: 'text-rose-600 dark:text-rose-400',
    },
    orange: {
      iconBg: 'bg-orange-50 dark:bg-orange-900/20',
      iconText: 'text-orange-600 dark:text-orange-400',
    },
    amber: {
      iconBg: 'bg-amber-50 dark:bg-amber-900/20',
      iconText: 'text-amber-600 dark:text-amber-400',
    },
    emerald: {
      iconBg: 'bg-emerald-50 dark:bg-emerald-900/20',
      iconText: 'text-emerald-600 dark:text-emerald-400',
    },
    indigo: {
      iconBg: 'bg-indigo-50 dark:bg-indigo-900/20',
      iconText: 'text-indigo-600 dark:text-indigo-400',
    },
  }

  const colors = colorClasses[color]
  const trendColor = trend ? (trend.direction === 'up' ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400') : ''

  return (
    <Card hover={!!onClick} onClick={onClick} padding="md">
      <div className="flex items-start justify-between mb-3">
        {icon && (
          <div className={`w-12 h-12 rounded-lg ${colors.iconBg} ${colors.iconText} flex items-center justify-center`}>
            {icon}
          </div>
        )}
        {trend && (
          <div className={`flex items-center gap-1 text-sm font-medium ${trendColor}`}>
            <span>{trend.direction === 'up' ? '↑' : '↓'}</span>
            <span>{trend.value}%</span>
          </div>
        )}
      </div>
      <div>
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">{title}</div>
        <div className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{value}</div>
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 dark:text-gray-100 mb-2">{title}</h1>
          {description && (
            <p className="text-gray-600 dark:text-gray-400">{description}</p>
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
    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${variants[variant]}`}>
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

