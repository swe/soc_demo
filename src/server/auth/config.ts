import { DrizzleAdapter } from '@auth/drizzle-adapter'
import { eq } from 'drizzle-orm'
import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'

import { env, googleAuthEnabled } from '../../env'
import { db } from '../db/client'
import { accounts, sessions, users, verificationTokens } from '../db/schema'

export const SESSION_MAX_AGE_S = 30 * 24 * 60 * 60 // 30 days, sliding

/**
 * Session cookie name must match Auth.js conventions so that sessions created
 * by our first-party credentials login (`app/api/login`) are readable
 * by `auth()`. Secure prefix is tied to the deployment URL scheme.
 * See docs/adr/0001-authjs-login-architecture.md.
 */
export const useSecureCookies = env.AUTH_URL.startsWith('https://')
export const SESSION_COOKIE_NAME = useSecureCookies
  ? '__Secure-authjs.session-token'
  : 'authjs.session-token'

export const authAdapter = DrizzleAdapter(db, {
  usersTable: users,
  accountsTable: accounts,
  sessionsTable: sessions,
  verificationTokensTable: verificationTokens,
})

/**
 * Auth.js owns: session resolution (`auth()`), sign-out, and OAuth (Google).
 * Credentials login is deliberately NOT an Auth.js provider — Auth.js forbids
 * credentials with database sessions, so our /api/login route verifies the
 * password and creates the adapter session itself. This keeps every session
 * in Postgres and keeps the auth boundary replaceable.
 *
 * Full rationale: docs/adr/0001-authjs-login-architecture.md
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: authAdapter,
  session: {
    strategy: 'database',
    maxAge: SESSION_MAX_AGE_S,
    updateAge: 24 * 60 * 60,
  },
  secret: env.AUTH_SECRET,
  trustHost: true,
  pages: {
    signIn: '/signin',
  },
  providers: googleAuthEnabled
    ? [Google({ clientId: env.AUTH_GOOGLE_ID, clientSecret: env.AUTH_GOOGLE_SECRET })]
    : [],
  callbacks: {
    // Shape the payload explicitly: the raw adapter session includes the
    // session token, which must never reach the client.
    async session({ session, user }) {
      return {
        expires: session.expires?.toISOString?.() ?? String(session.expires),
        user: { id: user.id, email: user.email, name: user.name, image: user.image },
      } as never
    },
  },
  events: {
    async signIn({ user }) {
      if (user?.id) {
        await db.update(users).set({ lastActiveAt: new Date() }).where(eq(users.id, user.id))
      }
    },
  },
})
