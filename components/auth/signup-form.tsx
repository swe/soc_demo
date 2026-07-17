'use client'

import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function SignUpForm({ googleEnabled }: { googleEnabled: boolean }) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [surname, setSurname] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: `${name} ${surname}`.trim(), email, password }),
    })

    if (!res.ok) {
      const data = await res.json().catch(() => null)
      setError(
        data?.issues?.[0]?.message ?? data?.error ?? 'Registration failed. Please try again.',
      )
      setLoading(false)
      return
    }

    const loginRes = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    if (!loginRes.ok) {
      setError('Account created, but sign-in failed. Try signing in manually.')
      setLoading(false)
      return
    }
    router.push('/onboarding')
    router.refresh()
  }

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 font-medium mb-1" htmlFor="email">
              Email <span className="text-pink-500">*</span>
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
          <div className="space-y-4 sm:flex sm:space-y-0 sm:space-x-4">
            <div className="sm:w-1/2">
              <label className="block text-sm text-gray-400 font-medium mb-1" htmlFor="name">
                Name <span className="text-pink-500">*</span>
              </label>
              <input
                id="name"
                className="form-input py-2 w-full"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="given-name"
                required
              />
            </div>
            <div className="sm:w-1/2">
              <label className="block text-sm text-gray-400 font-medium mb-1" htmlFor="surname">
                Surname <span className="text-pink-500">*</span>
              </label>
              <input
                id="surname"
                className="form-input py-2 w-full"
                type="text"
                value={surname}
                onChange={(e) => setSurname(e.target.value)}
                autoComplete="family-name"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-400 font-medium mb-1" htmlFor="password">
              Password <span className="text-pink-500">*</span>
            </label>
            <input
              id="password"
              className="form-input py-2 w-full"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              minLength={10}
              required
            />
            <div className="text-xs text-gray-500 mt-1">At least 10 characters.</div>
          </div>
        </div>
        {error && <div className="mt-4 text-sm text-red-500">{error}</div>}
        <div className="mt-6">
          <button
            type="submit"
            disabled={loading}
            className="btn-sm text-white bg-linear-to-t from-blue-600 to-blue-400 hover:to-blue-500 w-full shadow-lg group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating account…' : 'Sign Up'}{' '}
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
            onClick={() => signIn('google', { redirectTo: '/onboarding' })}
            className="btn-sm w-full text-gray-300 bg-gray-800 hover:bg-gray-700 border border-gray-700 shadow-lg"
          >
            Continue with Google
          </button>
        </div>
      )}
      <div className="text-sm text-gray-500 italic mt-6 mb-4">
        By filling out this form, I consent to the collection and use of my personal data.
      </div>
      <div className="pt-4 border-t border-gray-800">
        <div className="text-sm text-gray-400">
          Already have an account?{' '}
          <Link className="font-medium text-blue-500 hover:text-blue-400" href="/signin">
            Sign In
          </Link>
        </div>
      </div>
    </>
  )
}
