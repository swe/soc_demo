'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

type Step = 'create' | 'seed'

export default function Onboarding() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('create')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [seeding, setSeeding] = useState(false)

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await fetch('/api/v1/organizations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => null)
      setError(data?.title ?? 'Could not create the organization')
      setLoading(false)
      return
    }
    setLoading(false)
    setStep('seed')
  }

  const handleSeed = async () => {
    setSeeding(true)
    setError('')
    const res = await fetch('/api/v1/organizations/current/seed', { method: 'POST' })
    if (!res.ok) {
      const data = await res.json().catch(() => null)
      setError(data?.title ?? 'Seeding failed')
      setSeeding(false)
      return
    }
    router.push('/overview')
    router.refresh()
  }

  const handleSkip = () => {
    router.push('/overview')
    router.refresh()
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="h2 font-uncut-sans">
          {step === 'create' ? 'Create your organization' : 'Almost there'}
        </h1>
        <p className="text-gray-400 mt-2 text-sm">
          {step === 'create'
            ? 'Your organization is the workspace where your team, data, and detections live.'
            : 'Start with realistic demo data, or begin with an empty workspace.'}
        </p>
      </div>

      {step === 'create' ? (
        <form onSubmit={handleCreate}>
          <div>
            <label className="block text-sm text-gray-400 font-medium mb-1" htmlFor="org-name">
              Organization name <span className="text-pink-500">*</span>
            </label>
            <input
              id="org-name"
              className="form-input py-2 w-full"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Meridian Financial Group"
              minLength={2}
              required
            />
          </div>
          {error && <div className="mt-4 text-sm text-red-500">{error}</div>}
          <div className="mt-6">
            <button
              type="submit"
              disabled={loading}
              className="btn-sm text-white bg-linear-to-t from-blue-600 to-blue-400 hover:to-blue-500 w-full shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating…' : 'Create organization'}
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <button
            type="button"
            onClick={handleSeed}
            disabled={seeding}
            className="btn-sm text-white bg-linear-to-t from-blue-600 to-blue-400 hover:to-blue-500 w-full shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {seeding ? 'Loading demo data… this takes a moment' : 'Load demo data'}
          </button>
          <button
            type="button"
            onClick={handleSkip}
            disabled={seeding}
            className="btn-sm w-full text-gray-300 bg-gray-800 hover:bg-gray-700 border border-gray-700 shadow-lg disabled:opacity-50"
          >
            Start empty
          </button>
          {error && <div className="text-sm text-red-500">{error}</div>}
        </div>
      )}
    </>
  )
}
