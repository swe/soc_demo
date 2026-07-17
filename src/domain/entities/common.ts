import { z } from 'zod'

export const entityRefSchema = z.object({
  type: z.enum(['asset', 'identity']),
  id: z.string(),
  label: z.string().optional(),
})
export type EntityRefDto = z.infer<typeof entityRefSchema>

export const listQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
  cursor: z.string().optional(),
})

export type Page<T> = {
  items: T[]
  nextCursor: string | null
}

/** Opaque list cursor: base64(JSON of the last row's sort key). */
export function encodeCursor(value: { t: string; id: string }): string {
  return Buffer.from(JSON.stringify(value), 'utf8').toString('base64url')
}

export function decodeCursor(cursor: string): { t: string; id: string } | null {
  try {
    const parsed = JSON.parse(Buffer.from(cursor, 'base64url').toString('utf8'))
    if (typeof parsed?.t === 'string' && typeof parsed?.id === 'string') return parsed
    return null
  } catch {
    return null
  }
}
