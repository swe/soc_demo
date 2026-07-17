'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

type Org = { id: string; name: string; slug: string; role: string }

export default function SelectOrg() {
  const router = useRouter()
  const [orgs, setOrgs] = useState<Org[] | null>(null)
  const [error, setError] = useState('')
  const [switching, setSwitching] = useState('')

  useEffect(() => {
    fetch('/api/v1/organizations')
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((data) => setOrgs(data.organizations))
      .catch(() => setError('Could not load your organizations'))
  }, [])

  const handleSelect = async (organizationId: string) => {
    setSwitching(organizationId)
    const res = await fetch('/api/v1/organizations/current', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ organizationId }),
    })
    if (!res.ok) {
      setError('Could not switch organization')
      setSwitching('')
      return
    }
    router.push('/overview')
    router.refresh()
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="h2 font-uncut-sans">Choose an organization</h1>
      </div>
      {error && <div className="mb-4 text-sm text-red-500">{error}</div>}
      {orgs === null ? (
        <div className="text-gray-400 text-sm">Loading…</div>
      ) : orgs.length === 0 ? (
        <div className="text-gray-400 text-sm">
          You don&apos;t belong to any organization yet.{' '}
          <Link className="text-blue-500 hover:text-blue-400" href="/onboarding">
            Create one
          </Link>
          .
        </div>
      ) : (
        <ul className="space-y-2">
          {orgs.map((org) => (
            <li key={org.id}>
              <button
                type="button"
                onClick={() => handleSelect(org.id)}
                disabled={Boolean(switching)}
                className="w-full text-left px-4 py-3 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-700 disabled:opacity-50"
              >
                <span className="font-medium text-gray-100">{org.name}</span>
                <span className="text-xs text-gray-400 ml-2 uppercase">{org.role}</span>
                {switching === org.id && <span className="text-xs text-gray-400 ml-2">Switching…</span>}
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-6 text-sm text-gray-400">
        <Link className="text-blue-500 hover:text-blue-400" href="/onboarding">
          Create a new organization
        </Link>
      </div>
    </>
  )
}
