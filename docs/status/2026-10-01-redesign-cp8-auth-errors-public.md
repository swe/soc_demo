# CP8 auth, errors and public pages — status report

- **Date:** 2026-10-01
- **Milestone / checkpoint:** Portal UI redesign, CP8 (auth, error and public pages)
- **Branch / commit:** dev, commit after `6c45323`
- **Status:** Complete

## Objective

Give the screens outside the app shell (sign-in, registration, password reset, error pages,
privacy and terms) the same tokens, type scale and controls as the console. Copy, form logic,
demo credentials and routes stay as they were.

## Scope

In scope:

- `/login`, `/register`, `/forgot-password` and the auth layout.
- `/401`, `/403`, `/404`, `/503`, `/error`, plus unknown URLs.
- `/privacy`, `/terms`.
- The last three Tabler icon users: `password-input`, `copy-button`, `date-range-picker`.

Out of scope:

- Removing the unused icon and motion packages (CP9).

## What was implemented

- **Auth shell:** canvas background, a centred 400px column with the logo and tagline, and a
  Privacy · Terms footer. Cards are rounded-2xl with title-2 headings and callout descriptions;
  fields have more vertical rhythm; links are primary-coloured and sentence case ("Sign in",
  "Forgot password").
- **Password input:** rebuilt on the shared `InputGroup`, so it matches every other field
  (height, focus ring, 44px on touch). The eye toggle is a Lucide icon with "Show password" /
  "Hide password" labels and `aria-pressed`.
- **Error pages:** one `ErrorPage` component (icon tile, "Error 404" caption, title-1 heading,
  description, actions). On phones the actions stack full width with the primary action on
  top. The 7rem numerals are gone. The five error components keep their messages and actions.
- **Unknown URLs:** a root `not-found.tsx` renders the same 404 page instead of the Next.js
  default.
- **Privacy and terms:** a shared `LegalPage` frame with a back link (44px target), the logo
  and the text in a card.
- **Icons:** copy button and date-range picker use Lucide; no source file imports Tabler now.

## Files added

- `src/components/errors/error-page.tsx`
- `src/components/layout/legal-page.tsx`
- `src/app/not-found.tsx`
- `docs/status/2026-10-01-redesign-cp8-auth-errors-public.md`

## Files modified

- `src/app/(auth)/`: layout, login, register and forgot-password pages and forms
- `src/app/privacy/page.tsx`, `src/app/terms/page.tsx`
- `src/components/errors/`: forbidden, general-error, maintenance-error, not-found-error,
  unauthorized-error
- `src/components/password-input.tsx`, `copy-button.tsx`, `date-range-picker.tsx`,
  `back-button.tsx` ("Go back")
- `e2e/workflows.spec.ts` (password toggle and unknown-URL tests)

## Architectural decisions

- **`ErrorPage` lives in `components/errors`:** it is only used by the error screens, so it
  stays next to them rather than in `soc/state` (which is for in-page states).
- **Password input reuses `InputGroup`:** no bespoke field styling left outside the primitives.

## Deviations from plan

- Added a root `not-found.tsx`. Unknown URLs still return 404; they now show the styled page.

## Risks

- None known. Auth flows are unchanged and covered by the route suite.

## Test results

- `tsc --noEmit`: pass
- `eslint .`: 0 problems
- `next build`: pass
- `playwright test`: 291/291 passed (mobile, tablet, desktop and zoom fit); zoom summary
  `withProblems=0`.
- Screenshots reviewed: login, register, forgot password, 404, 503 and privacy at 390px; login,
  404 and privacy at 1440px; login and 404 in dark mode; the profile security page with the new
  password input.

## Acceptance status

- Auth, error and public pages use the shared tokens and controls: met.
- 44px touch targets and no overflow: met.
- Palette and copy preserved: met.

## Next recommended step

CP9: remove `@tabler/icons-react`, `@radix-ui/react-icons`, `framer-motion` and `motion` if
unused; remove obsolete styles; full route × breakpoint × theme sweep; final docs.
