'use client'

import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

type Org = { id: string; name: string; slug: string; role: string }

export default function DropdownOrg() {
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
    <Menu as="div" className="relative inline-flex">
      <MenuButton className="inline-flex justify-center items-center group">
        <div className="flex items-center truncate">
          <span className="truncate text-sm font-medium text-gray-600 dark:text-gray-100 group-hover:text-gray-800 dark:group-hover:text-white">
            {current.name}
          </span>
          <svg className="w-3 h-3 shrink-0 ml-1 fill-current text-gray-400 dark:text-gray-500" viewBox="0 0 12 12">
            <path d="M5.9 11.4L.5 6l1.4-1.4 4 4 4-4L11.3 6z" />
          </svg>
        </div>
      </MenuButton>
      <MenuItems
        transition
        className="origin-top-right z-10 absolute top-full right-0 min-w-[11rem] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 py-1.5 rounded-xl shadow-lg overflow-hidden mt-1 focus:outline-none transition duration-200 ease-out data-[closed]:scale-95 data-[closed]:opacity-0"
      >
        <div className="pt-0.5 pb-1 px-3 mb-1 border-b border-gray-200 dark:border-gray-700/60 text-xs uppercase text-gray-400 dark:text-gray-500 font-semibold">
          Organization
        </div>
        {orgs.map((org) => (
          <MenuItem key={org.id}>
            <button
              type="button"
              onClick={() => handleSwitch(org.id)}
              className={`w-full text-left font-medium text-sm flex items-center py-1 px-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 data-[focus]:bg-gray-50 dark:data-[focus]:bg-gray-700/50 ${org.id === current.id ? 'text-indigo-600' : 'text-gray-700 dark:text-gray-300'}`}
            >
              {org.name}
              {org.id === current.id && <span className="ml-auto text-xs text-indigo-500">Active</span>}
            </button>
          </MenuItem>
        ))}
        <div className="border-t border-gray-200 dark:border-gray-700/60 mt-1 pt-1">
          <MenuItem>
            <Link
              className="font-medium text-sm flex items-center py-1 px-3 text-indigo-600 hover:bg-gray-50 dark:hover:bg-gray-700/50 data-[focus]:bg-gray-50 dark:data-[focus]:bg-gray-700/50"
              href="/onboarding"
            >
              New organization
            </Link>
          </MenuItem>
        </div>
      </MenuItems>
    </Menu>
  )
}
