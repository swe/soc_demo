# ADR 0001 — Auth.js login architecture

**Status:** Accepted (Milestone 1)  
**Date:** 2026-07-17

## Context

We need database-backed sessions we own (revocable, listable, auditable), first-party email/password login, optional Google OIDC, and a replaceable auth boundary for later enterprise SSO (SAML/SCIM, Azure AD, Okta).

Auth.js (NextAuth v5) supports database sessions via the Drizzle adapter, but **does not allow the Credentials provider together with `session.strategy: "database"`**.

## Decision

1. **Auth.js owns** session resolution (`auth()`), sign-out, OAuth (Google when configured), and the Drizzle adapter tables (`user`, `account`, `session`, `verification_token`).
2. **Credentials login is first-party:** `POST /api/login` verifies the password (argon2) and creates a session through `authAdapter.createSession`, setting the standard Auth.js session cookie so `auth()` resolves it like any other session.
3. **Registration is first-party:** `POST /api/register` creates the user row; sign-in then follows the login path.
4. **Replaceability:** application code outside `src/server/auth/` must not import Auth.js directly. Consumers use `getSession()` / `getOrgContext()` / `requireOrgContext()`.

## Consequences

- Every session lives in Postgres and can be revoked or audited.
- Google and future OIDC providers plug into Auth.js without changing service code.
- Enterprise SAML/SCIM can later sit beside or replace Auth.js behind the same boundary.
- Credentials UX is custom (forms call `/api/login`), not the Auth.js credentials provider UI.
