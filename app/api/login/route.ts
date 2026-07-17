import { eq } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import {
  authAdapter,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_S,
  useSecureCookies,
} from '@server/auth/config'
import { verifyPassword } from '@server/auth/passwords'
import { db } from '@server/db/client'
import { sessions, users } from '@server/db/schema'

const loginSchema = z.object({
  email: z.email().transform((e) => e.toLowerCase().trim()),
  password: z.string().min(1),
})

/**
 * First-party credentials login. Verifies the password and creates a database
 * session through the Auth.js adapter, so `auth()` resolves it like any other
 * session. See the note in server/auth/config.ts for why this is not an
 * Auth.js credentials provider.
 */
export async function POST(request: NextRequest) {
  const parsed = loginSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, parsed.data.email))
    .limit(1)

  const valid = user?.passwordHash
    ? await verifyPassword(user.passwordHash, parsed.data.password)
    : false
  if (!user || !valid) {
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
  }

  const expires = new Date(Date.now() + SESSION_MAX_AGE_S * 1000)
  const session = await authAdapter.createSession!({
    sessionToken: crypto.randomUUID(),
    userId: user.id,
    expires,
  })

  // Enrich the session row with request metadata (adapter API has no fields for these).
  await db
    .update(sessions)
    .set({
      ip: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null,
      userAgent: request.headers.get('user-agent'),
    })
    .where(eq(sessions.sessionToken, session.sessionToken))

  await db.update(users).set({ lastActiveAt: new Date() }).where(eq(users.id, user.id))

  const response = NextResponse.json({ ok: true }, { status: 200 })
  response.cookies.set(SESSION_COOKIE_NAME, session.sessionToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure: useSecureCookies,
    path: '/',
    expires,
  })
  return response
}
