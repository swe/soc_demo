'use client'

import { ThemeProvider } from 'next-themes'
import { useState, useEffect } from 'react'

export default function Theme({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // During SSR and initial hydration, render children without theme provider
  // to prevent hydration mismatch
  if (!mounted) {
    return (
      <div suppressHydrationWarning>
        {children}
      </div>
    )
  }

  return (
    <ThemeProvider 
      attribute="class" 
      defaultTheme="dark" 
      disableTransitionOnChange
      enableSystem={false}
    >
      {children}
    </ThemeProvider>
  )
}