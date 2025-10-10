'use client'

import { useEffect, useState } from 'react'

interface IconProps {
  name: string
  className?: string
}

export default function Icon({ name, className = '' }: IconProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    // Return empty span with same size to prevent layout shift
    return <span className={`inline-block ${className}`} style={{ width: '1em', height: '1em' }}></span>
  }

  return <ion-icon name={name} class={className} suppressHydrationWarning></ion-icon>
}
