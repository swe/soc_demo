import { IBM_Plex_Mono, IBM_Plex_Sans } from 'next/font/google'
import { redirect } from 'next/navigation'

import { AppShell } from '@/src/components/layout'
import { getOrgContext, getSession } from '@server/auth/context'

const productSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-product-sans',
})

const productMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
  variable: '--font-product-mono',
})

export default async function OverviewLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Middleware only checks cookie presence; this is the real session check.
  const session = await getSession()
  if (!session?.user) redirect('/signin')
  const ctx = await getOrgContext()
  if (!ctx) redirect('/onboarding')

  return (
    <div className={`${productSans.variable} ${productMono.variable}`}>
      <AppShell>{children}</AppShell>
    </div>
  )
}
