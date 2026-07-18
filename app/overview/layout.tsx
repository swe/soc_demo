import { redirect } from 'next/navigation'

import { AppShell } from '@/src/components/layout'
import { getOrgContext, getSession } from '@server/auth/context'

/* Product font variables are declared on <html> in the root layout so that
 * portaled overlays (menus, dialogs) inherit product typography. */
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

  return <AppShell>{children}</AppShell>
}
