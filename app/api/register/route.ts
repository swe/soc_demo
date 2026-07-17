import { eq } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { hashPassword } from '@server/auth/passwords'
import { db } from '@server/db/client'
import { users } from '@server/db/schema'

const registerSchema = z.object({
  name: z.string().trim().min(1).max(200),
  email: z.email().transform((e) => e.toLowerCase().trim()),
  password: z.string().min(10, 'Password must be at least 10 characters').max(200),
})

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = registerSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: parsed.error.issues },
      { status: 400 },
    )
  }

  const { name, email, password } = parsed.data

  const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1)
  if (existing) {
    // Do not leak which emails exist beyond what sign-up inherently must
    return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 })
  }

  const passwordHash = await hashPassword(password)
  const [user] = await db
    .insert(users)
    .values({ name, email, passwordHash })
    .returning({ id: users.id, email: users.email })

  return NextResponse.json({ user }, { status: 201 })
}
