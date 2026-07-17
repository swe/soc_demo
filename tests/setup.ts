process.env.DATABASE_URL ??= 'postgres://soc:soc@localhost:5433/soc_test'
process.env.AUTH_SECRET ??= 'test-only-secret-test-only-secret-test-only'
process.env.AUTH_URL ??= 'http://localhost:3000'
process.env.APP_URL ??= 'http://localhost:3000'
if (!process.env.NODE_ENV) {
  Object.assign(process.env, { NODE_ENV: 'test' })
}
