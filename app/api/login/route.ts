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
import {
  checkRateLimit,
  clearLoginFailures,
  clientIp,
  recordAttempt,
} from '@server/auth/rate-limit'
import { resolveDefaultOrganizationId } from '@server/auth/types'
import { db } from '@server/db/client'
import { sessions, users } from '@server/db/schema'
import { writeAuditRaw } from '@server/services/audit'

function tooManyAttempts(retryAfterS: number) {
  return NextResponse.json(
    { error: 'Too many attempts. Please try again later.' },
    { status: 429, headers: { 'Retry-After': String(retryAfterS) } },
  )
}

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

  // Brute-force protection: refuse before touching argon2 when locked out.
  const ip = clientIp(request.headers)
  const [byEmail, byIp] = await Promise.all([
    checkRateLimit('login_email', parsed.data.email),
    checkRateLimit('login_ip', ip),
  ])
  for (const decision of [byEmail, byIp]) {
    if (!decision.allowed) return tooManyAttempts(decision.retryAfterS)
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
    await Promise.all([
      recordAttempt('login_email', parsed.data.email, ip),
      recordAttempt('login_ip', ip, ip),
    ])
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
  }

  await clearLoginFailures(parsed.data.email)

  const expires = new Date(Date.now() + SESSION_MAX_AGE_S * 1000)
  const session = await authAdapter.createSession!({
    sessionToken: crypto.randomUUID(),
    userId: user.id,
    expires,
  })

  // Enrich the session row with request metadata (adapter API has no fields
  // for these) and pin the default organization so the first login lands
  // directly in the user's tenant (e.g. the seeded demo org) with no
  // organization-selection friction.
  await db
    .update(sessions)
    .set({
      ip: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null,
      userAgent: request.headers.get('user-agent'),
      activeOrganizationId: await resolveDefaultOrganizationId(user.id),
    })
    .where(eq(sessions.sessionToken, session.sessionToken))

  await db.update(users).set({ lastActiveAt: new Date() }).where(eq(users.id, user.id))

  await writeAuditRaw({
    organizationId: null,
    action: 'auth.login',
    targetType: 'user',
    targetId: user.id,
    ip: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null,
  })

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
