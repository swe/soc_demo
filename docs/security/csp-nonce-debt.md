# Deferred: nonce-based Content-Security-Policy

**Status:** deferred technical debt (M2.6 accepted)  
**Opened:** 2026-07-17  
**Owner:** platform / M3+ security hardening (not a new M2.x milestone)

## Current state

M2.6 ships a pragmatic CSP via `next.config.js` `headers()`:

- `script-src 'self' 'unsafe-inline'`
- `style-src 'self' 'unsafe-inline'`
- `frame-ancestors 'none'`, `object-src 'none'`, plus standard defensive headers

`'unsafe-inline'` is required today because the Next.js App Router emits inline
bootstrap scripts and styles without a nonce/hash pipeline in this codebase.
Middleware (ADR-0002) is intentionally cookie-presence-only and does not mint
per-request nonces.

## Why this is debt

`'unsafe-inline'` weakens XSS containment. A stolen inline injection can still
execute under the current policy. The correct end state is a nonce-based CSP:

1. Middleware (or a Next.js headers hook that can see the request) issues a
   fresh nonce per response.
2. The nonce is threaded into `Content-Security-Policy` as
   `script-src 'self' 'nonce-…'` (and style if needed).
3. Framework inline scripts receive the matching `nonce` attribute
   (`next/script`, Document, etc.).
4. `'unsafe-inline'` is removed from `script-src`.

## Explicitly out of M2.6 / M2-series

Changing middleware to issue nonces expands the middleware authorization
boundary (ADR-0002) and touches every HTML document. That is UI/platform work
better scheduled with M3 (design system / App Router modernization) or a
focused security follow-up — **not** another M2.x hardening sprint.

## Acceptance for the future fix

- No `'unsafe-inline'` in `script-src`
- All Playwright flows still green (auth, overview with Chart.js + Leaflet)
- Documented in an ADR if the middleware boundary changes
