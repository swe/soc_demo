'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

import { useAppProvider } from '@/app/app-provider'
import Icon from '@/components/ui/icon'
import Logo from '@/components/ui/logo'

type NavItem = {
  href: string
  label: string
  icon: string
  /** Match path prefix for nested routes (e.g. /overview/settings/audit). */
  match?: (pathname: string) => boolean
}

/**
 * M3 primary navigation — functional surfaces only.
 * Investigations is included; its full UI lands in Checkpoint 4 (placeholder until then).
 */
const PRIMARY_NAV: NavItem[] = [
  {
    href: '/overview',
    label: 'Overview',
    icon: 'grid-outline',
    match: (p) => p === '/overview',
  },
  {
    href: '/overview/alerts',
    label: 'Alerts',
    icon: 'notifications-outline',
    match: (p) => p.startsWith('/overview/alerts'),
  },
  {
    href: '/overview/investigations',
    label: 'Investigations',
    icon: 'search-outline',
    match: (p) => p.startsWith('/overview/investigations'),
  },
  {
    href: '/overview/incidents',
    label: 'Incidents',
    icon: 'warning-outline',
    match: (p) => p.startsWith('/overview/incidents'),
  },
  {
    href: '/overview/assets',
    label: 'Assets',
    icon: 'hardware-chip-outline',
    match: (p) => p === '/overview/assets' || p.startsWith('/overview/assets/'),
  },
  {
    href: '/overview/identities',
    label: 'Identities',
    icon: 'people-outline',
    match: (p) => p.startsWith('/overview/identities'),
  },
  {
    href: '/overview/vulnerabilities',
    label: 'Vulnerabilities',
    icon: 'shield-checkmark-outline',
    match: (p) => p.startsWith('/overview/vulnerabilities'),
  },
  {
    href: '/overview/administration/members',
    label: 'Members',
    icon: 'person-outline',
    match: (p) => p.startsWith('/overview/administration/members'),
  },
  {
    href: '/overview/settings/audit',
    label: 'Audit log',
    icon: 'document-text-outline',
    match: (p) => p.startsWith('/overview/settings/audit'),
  },
  {
    href: '/overview/settings',
    label: 'Settings',
    icon: 'settings-outline',
    match: (p) => p === '/overview/settings',
  },
]

export function ProductSidebar() {
  const pathname = usePathname()
  const { sidebarOpen, setSidebarOpen, sidebarExpanded, setSidebarExpanded } = useAppProvider()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && sidebarOpen) setSidebarOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [sidebarOpen, setSidebarOpen])

  return (
    <div className={sidebarExpanded ? 'sidebar-expanded' : ''}>
      {/* Mobile backdrop */}
      <div
        className={`fixed inset-0 z-[var(--z-sidebar)] bg-black/50 lg:hidden transition-opacity ${
          sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden={!sidebarOpen}
        onClick={() => setSidebarOpen(false)}
      />

      <aside
        id="sidebar"
        className={`flex flex-col absolute z-[var(--z-sidebar)] left-0 top-0 lg:static h-[100dvh] w-60 shrink-0 border-r border-[color:var(--soc-border)] bg-[color:var(--soc-surface)] transition-transform duration-[var(--duration-normal)] ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
        aria-label="Primary"
      >
        <div className="flex h-14 items-center gap-3 px-4 border-b border-[color:var(--soc-border)] shrink-0">
          <button
            type="button"
            className="lg:hidden text-[color:var(--soc-text-muted)] hover:text-[color:var(--soc-text)]"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <Icon name="close-outline" className="w-5 h-5" />
          </button>
          <Link
            href="/overview"
            className="flex items-center gap-2.5 min-w-0 hover:opacity-90"
            onClick={() => setSidebarOpen(false)}
          >
            <Logo withLink={false} />
            <span className="text-sm font-semibold tracking-tight text-[color:var(--soc-text)] truncate">
              Svalbard
            </span>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-3" aria-label="Product">
          <ul className="space-y-0.5">
            {PRIMARY_NAV.map((item) => {
              const active = item.match ? item.match(pathname) : pathname === item.href
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2 text-sm transition-colors ${
                      active
                        ? 'bg-[color:var(--soc-accent-bg)] text-[color:var(--soc-accent-text)] font-medium'
                        : 'text-[color:var(--soc-text-secondary)] hover:bg-[color:var(--soc-overlay)] hover:text-[color:var(--soc-text)]'
                    }`}
                    aria-current={active ? 'page' : undefined}
                  >
                    <Icon
                      name={item.icon}
                      className={`text-base shrink-0 ${
                        active ? 'text-[color:var(--soc-accent)]' : 'text-[color:var(--soc-text-muted)]'
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="hidden lg:flex items-center justify-end px-3 py-2 border-t border-[color:var(--soc-border)]">
          <button
            type="button"
            className="text-xs text-[color:var(--soc-text-muted)] hover:text-[color:var(--soc-text)] px-2 py-1 rounded-[var(--radius-sm)]"
            onClick={() => setSidebarExpanded(!sidebarExpanded)}
            aria-pressed={sidebarExpanded}
            aria-label={sidebarExpanded ? 'Collapse sidebar labels' : 'Expand sidebar labels'}
          >
            {sidebarExpanded ? 'Collapse' : 'Expand'}
          </button>
        </div>
      </aside>
    </div>
  )
}
