'use client'

import { Menu, MenuItem } from '@headlessui/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import Icon from '@/components/ui/icon'

import { MenuDivider, MenuGroupLabel, MenuPanel, MenuTrigger, menuRowClass } from './menu'

type Org = { id: string; name: string; slug: string; role: string }

/** Organization switcher — shares the product menu primitive with the profile menu. */
export function OrgMenu() {
  const router = useRouter()
  const [orgs, setOrgs] = useState<Org[]>([])
  const [current, setCurrent] = useState<{ id: string; name: string } | null>(null)

  useEffect(() => {
    Promise.all([
      fetch('/api/v1/organizations').then((r) => (r.ok ? r.json() : null)),
      fetch('/api/v1/organizations/current').then((r) => (r.ok ? r.json() : null)),
    ]).then(([list, cur]) => {
      if (list?.organizations) setOrgs(list.organizations)
      if (cur?.organization) setCurrent(cur.organization)
    })
  }, [])

  const handleSwitch = async (organizationId: string) => {
    const res = await fetch('/api/v1/organizations/current', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ organizationId }),
    })
    if (res.ok) {
      const next = orgs.find((o) => o.id === organizationId)
      if (next) setCurrent({ id: next.id, name: next.name })
      router.refresh()
    }
  }

  if (!current) return null

  return (
    <Menu as="div" className="relative inline-flex" data-testid="org-menu">
      <MenuTrigger aria-label={`Organization: ${current.name}`}>
        <span className="truncate">{current.name}</span>
      </MenuTrigger>
      <MenuPanel widthClassName="w-64">
        <MenuGroupLabel>Organization</MenuGroupLabel>
        {orgs.map((org) => (
          <MenuItem key={org.id}>
            <button
              type="button"
              onClick={() => handleSwitch(org.id)}
              className={menuRowClass()}
            >
              <span className="min-w-0 truncate">{org.name}</span>
              {org.id === current.id ? (
                <Icon
                  name="checkmark-outline"
                  className="ml-auto w-4 h-4 shrink-0 text-[color:var(--soc-accent)]"
                />
              ) : null}
            </button>
          </MenuItem>
        ))}
        <MenuDivider />
        <MenuItem>
          <Link href="/onboarding" className={menuRowClass()}>
            <Icon name="add-outline" className="w-4 h-4 shrink-0 text-[color:var(--soc-text-muted)]" />
            New organization
          </Link>
        </MenuItem>
      </MenuPanel>
    </Menu>
  )
}
