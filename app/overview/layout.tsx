import { redirect } from 'next/navigation'

import Sidebar from '@/components/ui/sidebar'
import Header from '@/components/ui/header'
import { getOrgContext, getSession } from '@server/auth/context'

export default async function OverviewLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Middleware only checks cookie presence; this is the real session check.
  // Users without an organization go through onboarding first.
  const session = await getSession()
  if (!session?.user) redirect('/signin')
  const ctx = await getOrgContext()
  if (!ctx) redirect('/onboarding')

  return (
    <div className="overview-dashboard">
      <div className="flex h-[100dvh] overflow-hidden" style={{ backgroundColor: 'var(--soc-bg)' }}>

        {/* Sidebar */}
        <Sidebar />

        {/* Content area */}
        <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden" style={{ backgroundColor: 'var(--soc-bg)' }}>

          {/*  Site header */}
          <Header />

          <main className="grow [&>*:first-child]:scroll-mt-16">
            {children}
          </main>        

        </div>

      </div>
    </div>
  )
}
