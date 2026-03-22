import './css/style.css' // Global base styles
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import localFont from 'next/font/local'

import { THEME_INIT_SCRIPT } from '@/lib/theme-script'
import AppProvider from './app-provider'
import Theme from './theme-provider'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

const uncutsans = localFont({
  src: [
    {
      path: '../public/fonts/Uncut-Sans-Medium.woff2',
      weight: '500',
    },
    {
      path: '../public/fonts/Uncut-Sans-Semibold.woff2',
      weight: '600',
    }, 
    {
      path: '../public/fonts/Uncut-Sans-Bold.woff2',
      weight: '700',
    }, 
    {
      path: '../public/fonts/Uncut-Sans-BoldOblique.woff2',
      weight: '700',
      style: 'italic'
    },          
  ],
  variable: '--font-uncut-sans',
  display: 'swap',  
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export const metadata: Metadata = {
  title: 'Svalbard Intelligence',
  description: 'Security operations and threat management. Clear, hands-on support when it matters.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${uncutsans.variable}`} suppressHydrationWarning>{/* suppressHydrationWarning: https://github.com/vercel/next.js/issues/44343 */}
      <body className="font-inter antialiased" suppressHydrationWarning>
        <Theme>
          <AppProvider>
            {children}
          </AppProvider>
        </Theme>
      </body>
    </html>
  )
}
