import { eq, sql } from 'drizzle-orm'
import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it } from 'vitest'

import {
  LOCKOUT_BASE_MS,
  LOCKOUT_CAP_MS,
  RATE_LIMITS,
  checkRateLimit,
  clearLoginFailures,
  recordAttempt,
} from '@server/auth/rate-limit'
import { db } from '@server/db/client'
import { loginAttempts } from '@server/db/schema'
import { createUser, uniqueEmail } from '../helpers/fixtures'

async function attemptRow(scope: string, key: string) {
  const [row] = await db
    .select()
    .from(loginAttempts)
    .where(sql`${loginAttempts.scope} = ${scope} AND ${loginAttempts.key} = ${key}`)
    .limit(1)
  return row
}

function loginRequest(email: string, password: string, ip: string): NextRequest {
  return new NextRequest('http://localhost:3000/api/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
    headers: { 'content-type': 'application/json', 'x-forwarded-for': ip },
  })
}

function registerRequest(ip: string): NextRequest {
  return new NextRequest('http://localhost:3000/api/register', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Rate Limit Probe',
      email: uniqueEmail('rl'),
      password: 'long-enough-password',
    }),
    headers: { 'content-type': 'application/json', 'x-forwarded-for': ip },
  })
}

let ipCounter = 0
function uniqueIp(): string {
  ipCounter += 1
  return `203.0.113.${ipCounter % 250}.${Date.now() % 1000}`
}

describe('rate limiter core', () => {
  beforeEach(async () => {
    // Isolation between tests that share scopes.
  })

  it('locks the email key after the limit and reports Retry-After', async () => {
    const email = uniqueEmail('limit')
    const { limit } = RATE_LIMITS.login_email

    for (let i = 0; i < limit - 1; i += 1) {
      await recordAttempt('login_email', email)
      expect((await checkRateLimit('login_email', email)).allowed).toBe(true)
    }

    // The limit-reaching failure applies the first 5-minute lock.
    await recordAttempt('login_email', email)
    const decision = await checkRateLimit('login_email', email)
    expect(decision.allowed).toBe(false)
    if (!decision.allowed) {
      expect(decision.retryAfterS).toBeGreaterThan(0)
      expect(decision.retryAfterS).toBeLessThanOrEqual(LOCKOUT_BASE_MS / 1000)
    }

    const row = await attemptRow('login_email', email)
    expect(row.strikes).toBe(1)
  })

  it('doubles the lockout per consecutive violation, capped at 60 minutes', async () => {
    const email = uniqueEmail('backoff')
    const { limit } = RATE_LIMITS.login_email

    for (let strike = 1; strike <= 6; strike += 1) {
      // Expire the current lock so attempts flow again.
      await db
        .update(loginAttempts)
        .set({ lockedUntil: new Date(Date.now() - 1000) })
        .where(sql`${loginAttempts.scope} = 'login_email' AND ${loginAttempts.key} = ${email}`)

      for (let i = 0; i < limit; i += 1) await recordAttempt('login_email', email)

      const row = await attemptRow('login_email', email)
      expect(row.strikes).toBe(strike)
      const expectedMs = Math.min(LOCKOUT_BASE_MS * 2 ** (strike - 1), LOCKOUT_CAP_MS)
      const actualMs = row.lockedUntil!.getTime() - row.updatedAt.getTime()
      // Allow slack for execution time between statements.
      expect(Math.abs(actualMs - expectedMs)).toBeLessThan(5_000)
    }
    // 5 → 10 → 20 → 40 → 60 → 60 (cap verified by the last two iterations)
  })

  it('resets the counter when the window has passed', async () => {
    const email = uniqueEmail('window')

    await recordAttempt('login_email', email)
    await recordAttempt('login_email', email)
    expect((await attemptRow('login_email', email)).count).toBe(2)

    // Age the window past its 5 minutes.
    await db
      .update(loginAttempts)
      .set({ windowStart: new Date(Date.now() - RATE_LIMITS.login_email.windowMs - 1000) })
      .where(sql`${loginAttempts.scope} = 'login_email' AND ${loginAttempts.key} = ${email}`)

    await recordAttempt('login_email', email)
    expect((await attemptRow('login_email', email)).count).toBe(1)
  })

  it('keeps email and IP keys independent', async () => {
    const email = uniqueEmail('independent')
    const ip = uniqueIp()

    for (let i = 0; i < RATE_LIMITS.login_email.limit; i += 1) {
      await recordAttempt('login_email', email)
      await recordAttempt('login_ip', ip)
    }
    expect((await checkRateLimit('login_email', email)).allowed).toBe(false)
    // IP limit (30) is higher, so the IP key is still open.
    expect((await checkRateLimit('login_ip', ip)).allowed).toBe(true)
  })

  it('clearLoginFailures removes the email counter entirely', async () => {
    const email = uniqueEmail('clear')
    await recordAttempt('login_email', email)
    await clearLoginFailures(email)
    expect(await attemptRow('login_email', email)).toBeUndefined()
  })
})

describe('login route guard', () => {
  it('throttles repeated failures with 429 + Retry-After, then success clears the counter', async () => {
    const { POST } = await import('../../app/api/login/route')
    const { user, password } = await createUser()
    const ip = uniqueIp()
    const { limit } = RATE_LIMITS.login_email

    // Failures up to the limit are 401s; the lock then produces 429s.
    for (let i = 0; i < limit; i += 1) {
      const res = await POST(loginRequest(user.email, 'wrong-password', ip))
      expect(res.status).toBe(401)
    }
    const throttled = await POST(loginRequest(user.email, 'wrong-password', ip))
    expect(throttled.status).toBe(429)
    expect(Number(throttled.headers.get('Retry-After'))).toBeGreaterThan(0)

    // Correct credentials are also refused while locked (no oracle).
    const lockedGood = await POST(loginRequest(user.email, password, ip))
    expect(lockedGood.status).toBe(429)

    // Expire the lock: a successful login goes through and clears the counter.
    await db
      .update(loginAttempts)
      .set({ lockedUntil: new Date(Date.now() - 1000) })
      .where(eq(loginAttempts.key, user.email))
    const ok = await POST(loginRequest(user.email, password, ip))
    expect(ok.status).toBe(200)
    expect(await attemptRow('login_email', user.email)).toBeUndefined()
  })

  it('login under the threshold is unaffected', async () => {
    const { POST } = await import('../../app/api/login/route')
    const { user, password } = await createUser()
    const res = await POST(loginRequest(user.email, password, uniqueIp()))
    expect(res.status).toBe(200)
  })
})

describe('register route guard', () => {
  it('locks the IP after the hourly attempt limit with 429 + Retry-After', async () => {
    const { POST } = await import('../../app/api/register/route')
    const ip = uniqueIp()
    const { limit } = RATE_LIMITS.register_ip

    for (let i = 0; i < limit; i += 1) {
      const res = await POST(registerRequest(ip))
      expect(res.status).toBe(201)
    }
    const throttled = await POST(registerRequest(ip))
    expect(throttled.status).toBe(429)
    expect(Number(throttled.headers.get('Retry-After'))).toBeGreaterThan(0)

    // A different IP is unaffected.
    const other = await POST(registerRequest(uniqueIp()))
    expect(other.status).toBe(201)
  })
})
