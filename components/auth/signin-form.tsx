'use client'

import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

export default function SignInForm({ googleEnabled }: { googleEnabled: boolean }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') ?? '/overview'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    if (!res.ok) {
      setError('Invalid email or password')
      setLoading(false)
      return
    }
    router.push(callbackUrl)
    router.refresh()
  }

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 font-medium mb-1" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              className="form-input py-2 w-full"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>
          <div>
            <div className="flex justify-between">
              <label className="block text-sm text-gray-400 font-medium mb-1" htmlFor="password">
                Password
              </label>
              <Link className="text-sm font-medium text-blue-500 hover:text-blue-400 ml-2" href="/reset-password">
                Troubles?
              </Link>
            </div>
            <input
              id="password"
              className="form-input py-2 w-full"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>
        </div>
        {error && <div className="mt-4 text-sm text-red-500">{error}</div>}
        <div className="mt-6">
          <button
            type="submit"
            disabled={loading}
            className="btn-sm text-white bg-linear-to-t from-blue-600 to-blue-400 hover:to-blue-500 w-full shadow-lg group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in…' : 'Sign In'}{' '}
            <span className="tracking-normal text-blue-200 group-hover:translate-x-0.5 transition-transform duration-150 ease-in-out ml-1">
              -&gt;
            </span>
          </button>
        </div>
      </form>
      {googleEnabled && (
        <div className="mt-4">
          <button
            type="button"
            onClick={() => signIn('google', { redirectTo: callbackUrl })}
            className="btn-sm w-full text-gray-300 bg-gray-800 hover:bg-gray-700 border border-gray-700 shadow-lg"
          >
            Continue with Google
          </button>
        </div>
      )}
    </>
  )
}
