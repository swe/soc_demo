import MarketingShell from '@/components/landing/marketing-shell'

import '../css/landing-full.css'

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="landing-wrapper">
      <div className="flex flex-col min-h-screen overflow-hidden">
        <MarketingShell>{children}</MarketingShell>
      </div>
    </div>
  )
}
