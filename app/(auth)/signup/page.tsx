import SignUpForm from '@/components/auth/signup-form'
import { googleAuthEnabled } from '@/src/env'

export const metadata = {
  title: 'Sign Up - Svalbard Intelligence',
  description: 'Create your Svalbard security operations account.',
}

export default function SignUp() {
  return (
    <>
      <div className="mb-8">
        <h1 className="h2 font-uncut-sans">Sign Up</h1>
      </div>
      <SignUpForm googleEnabled={googleAuthEnabled} />
    </>
  )
}
