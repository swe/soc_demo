import { getSeverityColor, getStatusColor, badgeStyles } from '@/lib/design-system'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'severity' | 'status'
  type: string
  size?: 'small' | 'base' | 'large'
  className?: string
}

export function Badge({ children, variant = 'severity', type, size = 'base', className = '' }: BadgeProps) {
  const colors = variant === 'severity' ? getSeverityColor(type) : getStatusColor(type)
  const sizeClass = size === 'small' ? badgeStyles.small : size === 'large' ? badgeStyles.large : badgeStyles.base
  
  return (
    <span className={`${badgeStyles.base} ${sizeClass} ${colors.badge} ${className}`}>
      {children}
    </span>
  )
}

interface StatusDotProps {
  status: string
  className?: string
}

export function StatusDot({ status, className = '' }: StatusDotProps) {
  const colors = getStatusColor(status)
  
  return (
    <span className={`inline-flex h-2 w-2 rounded-full ${colors.dot} ${className}`} />
  )
}

