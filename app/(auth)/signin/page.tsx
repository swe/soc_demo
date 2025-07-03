'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AuthHeader from '../auth-header'
import AuthImage from '../auth-image'

export default function SignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    if (email === 'info@svalbard.ca' && password === 'Pas$w0rd!') {
      setTimeout(() => {
        router.push('/dashboard')
      }, 500)
    } else {
      setError('Invalid email or password')
      setIsLoading(false)
    }
  }

  return (
    <main className="bg-white dark:bg-gray-900">

      <div className="relative md:flex">

        {/* Content */}
        <div className="md:w-1/2">
          <div className="min-h-[100dvh] h-full flex flex-col after:flex-1">

            <AuthHeader />

            <div className="max-w-sm mx-auto w-full px-4 py-8">
              <h1 className="text-3xl text-gray-800 dark:text-gray-100 font-bold mb-6">Welcome back!</h1>
              {/* Form */}
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="email">Email Address</label>
                    <input 
                      id="email" 
                      className="form-input w-full" 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="password">Password</label>
                    <input 
                      id="password" 
                      className="form-input w-full" 
                      type="password" 
                      autoComplete="on" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                {error && (
                  <div className="mt-4 p-3 bg-red-500/20 text-red-700 rounded-lg">
                    {error}
                  </div>
                )}

                <div className="flex items-center justify-end mt-6">
                  <button 
                    type="submit"
                    disabled={isLoading}
                    className="btn bg-gray-900 text-gray-100 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Signing In...' : 'Sign In'}
                  </button>
                </div>
              </form>
            </div>

          </div>
        </div>

        <AuthImage />

      </div>

    </main>
  )
}

