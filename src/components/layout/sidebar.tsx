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

type NavSection = {
  label: string | null
  items: NavItem[]
}

/**
 * M3 primary navigation — functional surfaces only, grouped by workflow.
 * Investigations is included; its full UI lands in Checkpoint 4.
 */
const NAV_SECTIONS: NavSection[] = [
  {
    label: null,
    items: [
      {
        href: '/overview',
        label: 'Overview',
        icon: 'grid-outline',
        match: (p) => p === '/overview',
      },
    ],
  },
  {
    label: 'Operations',
    items: [
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
    ],
  },
  {
    label: 'Exposure',
    items: [
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
    ],
  },
  {
    label: 'Organization',
    items: [
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
    ],
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
        className={`fixed inset-0 z-[var(--z-sidebar)] bg-black/40 lg:hidden transition-opacity ${
          sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden={!sidebarOpen}
        onClick={() => setSidebarOpen(false)}
      />

      <aside
        id="sidebar"
        className={`flex flex-col absolute z-[var(--z-sidebar)] left-0 top-0 lg:static h-[100dvh] w-56 shrink-0 border-r border-[color:var(--soc-border)] bg-[color:var(--soc-sidebar)] transition-transform duration-[var(--duration-normal)] ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
        aria-label="Primary"
      >
        <div className="flex h-12 items-center gap-2.5 px-4 shrink-0">
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
            <span className="text-[13px] font-semibold tracking-tight text-[color:var(--soc-text)] truncate">
              Svalbard
            </span>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 pt-2 pb-4" aria-label="Product">
          {NAV_SECTIONS.map((section, idx) => (
            <div key={section.label ?? 'root'} className={idx > 0 ? 'mt-5' : ''}>
              {section.label ? (
                <p className="px-2 mb-1 text-[10.5px] font-medium uppercase tracking-[0.07em] text-[color:var(--soc-text-dim)]">
                  {section.label}
                </p>
              ) : null}
              <ul className="space-y-px">
                {section.items.map((item) => {
                  const active = item.match ? item.match(pathname) : pathname === item.href
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={`relative flex items-center gap-2.5 rounded-[var(--radius-md)] px-2 py-[7px] text-[13px] leading-none transition-colors duration-[var(--duration-fast)] ${
                          active
                            ? 'bg-white/[0.06] text-[color:var(--soc-text)] font-medium'
                            : 'text-[color:var(--soc-text-secondary)] hover:bg-white/[0.04] hover:text-[color:var(--soc-text)]'
                        }`}
                        aria-current={active ? 'page' : undefined}
                      >
                        {active ? (
                          <span
                            aria-hidden
                            className="absolute left-[-3px] top-1/2 -translate-y-1/2 h-3.5 w-[2px] rounded-full bg-[color:var(--soc-accent)]"
                          />
                        ) : null}
                        <Icon
                          name={item.icon}
                          className={`text-[15px] shrink-0 ${
                            active
                              ? 'text-[color:var(--soc-text-secondary)]'
                              : 'text-[color:var(--soc-text-muted)]'
                          }`}
                        />
                        <span className="truncate">{item.label}</span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="hidden lg:flex items-center px-4 py-2.5 border-t border-[color:var(--soc-border)]">
          <button
            type="button"
            className="text-[11px] text-[color:var(--soc-text-muted)] hover:text-[color:var(--soc-text-secondary)] rounded-[var(--radius-sm)]"
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
