'use client'

import { ThemeProvider } from '@/lib/theme'

export default function Theme({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" disableTransitionOnChange>
      {children}
    </ThemeProvider>
  )
}