'use client'

import { Menu, MenuItem } from '@headlessui/react'
import { signOut, useSession } from 'next-auth/react'
import Link from 'next/link'

import Icon from '@/components/ui/icon'

import { MenuHeader, MenuPanel, MenuTrigger, menuRowClass } from './menu'

/** Profile menu — identity header, Settings, and a restrained destructive Sign out. */
export function ProfileMenu() {
  const { data: session } = useSession()
  const name = session?.user?.name ?? 'Account'
  const email = session?.user?.email ?? ''

  return (
    <Menu as="div" className="relative inline-flex" data-testid="profile-menu">
      <MenuTrigger aria-label={`Account: ${name}`}>
        <span className="truncate">{name}</span>
      </MenuTrigger>
      <MenuPanel widthClassName="w-60">
        <MenuHeader title={name} subtitle={email || undefined} />
        <MenuItem>
          <Link href="/overview/settings" className={menuRowClass()}>
            <Icon name="settings-outline" className="w-4 h-4 shrink-0 text-[color:var(--soc-text-muted)]" />
            Settings
          </Link>
        </MenuItem>
        <MenuItem>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: '/signin' })}
            className={menuRowClass({ destructive: true })}
          >
            <Icon name="log-out-outline" className="w-4 h-4 shrink-0 text-current opacity-70" />
            Sign out
          </button>
        </MenuItem>
      </MenuPanel>
    </Menu>
  )
}
