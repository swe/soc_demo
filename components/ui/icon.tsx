'use client'

interface IconProps {
  name: string
  className?: string
}

export default function Icon({ name, className = '' }: IconProps) {
  // Map common icon names to SVG paths
  const iconPaths: { [key: string]: { path: string; filled?: boolean } } = {
    'add-outline': { path: 'M12 4v16m8-8H4' },
    'warning-outline': { path: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' },
    'trending-up-outline': { path: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' },
    'trending-down-outline': { path: 'M13 17h8m0 0V9m0 8l-8-8-4 4-6-6' },
    'alert-circle-outline': { path: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    'bug-outline': { path: 'M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z' },
    'shield-checkmark-outline': { path: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
    'create-outline': { path: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' },
    'close-outline': { path: 'M6 18L18 6M6 6l12 12' },
    'sunny-outline': { path: 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z' },
    'moon-outline': { path: 'M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z' }
  }

  const icon = iconPaths[name]
  
  if (!icon) {
    // Default icon if not found
    return (
      <svg 
        className={`inline-block ${className}`} 
        width="1em" 
        height="1em" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  }

  return (
    <svg 
      className={`inline-block ${className}`}
      width="1em"
      height="1em"
      fill={icon.filled ? "currentColor" : "none"}
      stroke={icon.filled ? "none" : "currentColor"}
      viewBox="0 0 24 24" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon.path} />
    </svg>
  )
}
