/**
 * Domain rule violation raised by the service layer, carrying the HTTP status
 * the API edge should return (mapped to problem+json in server/api/respond).
 * Auth failures use AuthError; illegal lifecycle moves use TransitionError.
 */
export class ServiceError extends Error {
  constructor(
    message: string,
    public readonly status: 400 | 404 | 409 | 410 = 400,
  ) {
    super(message)
    this.name = 'ServiceError'
  }
}
