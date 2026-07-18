import Link from 'next/link'

/** Product-styled 404 — no fake chrome, no mock sidebar. */
export default function NotFound() {
  return (
    <div className="overview-dashboard product-shell dark min-h-[100dvh] flex items-center justify-center px-6">
      <div className="max-w-md text-center">
        <p className="soc-label mb-2">Not found</p>
        <h1 className="text-xl font-semibold text-[color:var(--soc-text)] mb-2">
          This page does not exist
        </h1>
        <p className="text-sm text-[color:var(--soc-text-secondary)] mb-6 leading-relaxed">
          The route may have been removed from the product, or the URL is incorrect.
        </p>
        <Link href="/overview" className="soc-btn soc-btn-primary">
          Back to Overview
        </Link>
      </div>
    </div>
  )
}
