'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useRef, useState } from 'react'

function AcceptInviteInner() {
  const router = useRouter()
  const params = useSearchParams()
  const token = params.get('token') ?? ''
  const [state, setState] = useState<'working' | 'error'>('working')
  const [error, setError] = useState('')
  const attempted = useRef(false)

  useEffect(() => {
    if (attempted.current) return
    attempted.current = true

    if (!token) {
      setState('error')
      setError('This invite link is missing its token.')
      return
    }

    fetch('/api/v1/members/accept-invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    }).then(async (res) => {
      if (res.status === 401) {
        // Sign in (or register) first, then come back to this link.
        const callback = encodeURIComponent(`/accept-invite?token=${token}`)
        router.replace(`/signin?callbackUrl=${callback}`)
        return
      }
      if (!res.ok) {
        const body = await res.json().catch(() => null)
        setState('error')
        setError(body?.title ?? 'Could not accept this invite.')
        return
      }
      router.replace('/overview')
      router.refresh()
    }).catch(() => {
      setState('error')
      setError('Could not reach the server. Try again.')
    })
  }, [token, router])

  return (
    <>
      <div className="mb-8">
        <h1 className="h2 font-uncut-sans">Join organization</h1>
      </div>
      {state === 'working' ? (
        <div className="text-gray-400 text-sm">Accepting your invite…</div>
      ) : (
        <div className="space-y-4">
          <div className="text-sm text-red-500">{error}</div>
          <div className="text-sm text-gray-400">
            Make sure you are signed in with the invited email address.{' '}
            <Link className="text-blue-500 hover:text-blue-400" href="/signin">
              Sign in
            </Link>
          </div>
        </div>
      )}
    </>
  )
}

export default function AcceptInvite() {
  return (
    <Suspense fallback={<div className="text-gray-400 text-sm">Loading…</div>}>
      <AcceptInviteInner />
    </Suspense>
  )
}
