/**
 * Domain rule violation raised by the service layer, carrying the HTTP status
 * the API edge should return (mapped to problem+json in server/api/respond).
 * Auth failures use AuthError; illegal lifecycle moves use TransitionError.
 */
export class ServiceError extends Error {
  constructor(
    message: string,
    public readonly status: 400 | 403 | 404 | 409 | 410 = 400,
  ) {
    super(message)
    this.name = 'ServiceError'
  }
}

/**
 * True when `err` is a PostgreSQL unique violation (23505), optionally for a
 * specific constraint. Handles both the raw postgres-js error and errors
 * wrapped by drizzle (which keep the original as `cause`).
 */
export function isUniqueViolation(err: unknown, constraint?: string): boolean {
  if (typeof err !== 'object' || err === null) return false
  const e = err as { code?: string; constraint_name?: string; cause?: unknown }
  if (e.code === '23505') {
    return constraint === undefined || e.constraint_name === constraint
  }
  return e.cause !== undefined && isUniqueViolation(e.cause, constraint)
}
