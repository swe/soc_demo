import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  hover?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
  onClick?: () => void
}

export function Card({ children, className = '', hover = false, padding = 'md', onClick }: CardProps) {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  }

  const baseClasses = 'bg-white dark:bg-gray-800 rounded-xl shadow-sm'
  const hoverClasses = hover ? 'hover:shadow-md transition-shadow duration-200 cursor-pointer' : ''
  
  return (
    <div 
      className={`${baseClasses} ${paddingClasses[padding]} ${hoverClasses} ${className}`}
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
      iconBg: 'bg-rose-100 dark:bg-rose-900/50',
      iconText: 'text-rose-800 dark:text-rose-200',
      trendUp: 'text-rose-700 dark:text-rose-400',
      trendDown: 'text-emerald-700 dark:text-emerald-400',
    },
    orange: {
      iconBg: 'bg-orange-100 dark:bg-orange-900/50',
      iconText: 'text-orange-800 dark:text-orange-200',
      trendUp: 'text-rose-700 dark:text-rose-400',
      trendDown: 'text-emerald-700 dark:text-emerald-400',
    },
    amber: {
      iconBg: 'bg-amber-100 dark:bg-amber-900/50',
      iconText: 'text-amber-800 dark:text-amber-200',
      trendUp: 'text-rose-700 dark:text-rose-400',
      trendDown: 'text-emerald-700 dark:text-emerald-400',
    },
    emerald: {
      iconBg: 'bg-emerald-100 dark:bg-emerald-900/50',
      iconText: 'text-emerald-800 dark:text-emerald-200',
      trendUp: 'text-emerald-700 dark:text-emerald-400',
      trendDown: 'text-rose-700 dark:text-rose-400',
    },
    indigo: {
      iconBg: 'bg-indigo-100 dark:bg-indigo-900/50',
      iconText: 'text-indigo-800 dark:text-indigo-200',
      trendUp: 'text-emerald-700 dark:text-emerald-400',
      trendDown: 'text-rose-700 dark:text-rose-400',
    },
  }

  const colors = colorClasses[color]

  return (
    <Card hover={!!onClick} onClick={onClick} className="border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600">
      <div className="flex items-center justify-between mb-3">
        {icon && (
          <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${colors.iconBg} ${colors.iconText} group-hover:scale-110 transition-transform duration-200`}>
            {icon}
          </div>
        )}
        {trend && (
          <div className={`flex items-center text-xs font-semibold ${trend.direction === 'up' ? colors.trendUp : colors.trendDown}`}>
            {trend.direction === 'up' ? '+' : ''}{trend.value}%
            <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {trend.direction === 'up' ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
              )}
            </svg>
          </div>
        )}
      </div>
      <div>
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">{title}</div>
        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</div>
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
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">{title}</h1>
        {action}
      </div>
      {description && (
        <p className="text-gray-600 dark:text-gray-400">{description}</p>
      )}
    </div>
  )
}

