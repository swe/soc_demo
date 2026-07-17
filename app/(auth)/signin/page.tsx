import Link from 'next/link'
import { Suspense } from 'react'

import SignInForm from '@/components/auth/signin-form'
import { googleAuthEnabled } from '@/src/env'

export const metadata = {
  title: 'Sign In - Svalbard Intelligence',
  description: 'Sign in to the Svalbard security operations platform.',
}

export default function SignIn() {
  return (
    <>
      <div className="mb-8">
        <h1 className="h2 font-uncut-sans">Welcome Back!</h1>
      </div>
      <Suspense>
        <SignInForm googleEnabled={googleAuthEnabled} />
      </Suspense>
      <div className="mt-6">
        <div className="text-sm text-gray-400">
          Don&apos;t you have an account?{' '}
          <Link className="font-medium text-blue-500 hover:text-blue-400" href="/signup">
            Sign Up
          </Link>
        </div>
      </div>
    </>
  )
}
