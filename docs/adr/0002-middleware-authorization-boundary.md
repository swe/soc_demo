# ADR 0002 — Middleware authorization boundary

**Status:** Accepted (Milestone 1)  
**Date:** 2026-07-17

## Context

`(platform)` routes (`/overview/*`, onboarding, org selection) must not be browsable without a session. Edge middleware cannot open Postgres, so it cannot validate sessions, resolve memberships, or enforce tenant isolation.

## Decision

**Middleware performs routing only.**

- It checks for the presence of an Auth.js session cookie.
- If missing, it redirects to `/signin` with `callbackUrl`.
- It does **not** validate the session token, load the user, resolve an organization, or check permissions.

**All tenant authorization happens on the server** after the request reaches Node:

1. `getOrgContext()` / `requireOrgContext()` — session → active membership → `OrgContext` (org, role).
2. `can()` / `requirePermission()` — role → permission matrix.
3. Service layer — every data function takes `OrgContext` first.
4. `orgScoped()` — every query is filtered by `organization_id`.
5. API routes use `withOrgContext()` so handlers never run without a tenant context.

A forged or stale cookie may pass the middleware redirect but receives **401** from `requireOrgContext()` and cannot read another tenant’s rows (cross-tenant IDs return null / empty lists, exposed as 404 at the API edge where applicable).

## Consequences

- Edge stays fast and DB-free.
- Authorization has a single enforcement path (services + OrgContext), which is what security reviews should inspect.
- UI affordances may hide actions by role, but hiding is never the security boundary.
