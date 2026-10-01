# CP7 compliance, knowledge base, administration — status report

- **Date:** 2026-10-01
- **Milestone / checkpoint:** Portal UI redesign, CP7 (compliance, knowledge base,
  administration, on-call, audit, profile)
- **Branch / commit:** dev, commit after `a84cfd1`
- **Status:** Complete

## Objective

Move the remaining back-office modules onto the shared shell, filter, table and token
patterns from CP5 and CP6. Data, URL state, routes and role logic stay as they were.

## Scope

In scope:

- Compliance: controls, evidence, findings and GRC auditor packs.
- Knowledge base: procedures, reports, documentation, trainings.
- Administration: user management, user detail, integrations, enterprise, audit log.
- On-call and the profile pages (account, preferences, security, notifications).

Out of scope:

- Auth, error and public pages (CP8).
- Removing the remaining Tabler icons in shared inputs (CP8/CP9).

## What was implemented

- **Filters:** the six hand-built `FilterPanelHeader` popovers (procedures, reports,
  documentation, trainings, compliance, user management) are now `FilterMenu` facets, with the
  bottom sheet on phones. User management gained an MFA facet in the same menu.
- **Shell:** those six pages, integrations and enterprise use `ModuleShell` toolbar slots.
  Enterprise uses `StatsStrip` and module tabs with an API-key count.
- **Profile:** the section nav uses Lucide icons; on phones it is a module tab strip, on
  desktop a sidebar list with the primary-tint active state. Sections are cards on the canvas
  background with type-scale headings. The admin user detail page uses the same frame.
- **Tables on phones:** procedures, reports, compliance controls, evidence and findings,
  members, invitations, audit, sessions and on-call hide secondary columns, fold severity or
  status under the title, and use fixed layout so nothing runs past the card.
- **GRC auditor packs:** grid columns can shrink and owner names truncate, so the owner list
  no longer clips.
- **Colours:** 184 status and severity class replacements to tokens across these modules;
  `text-destructive` on text became `text-destructive-text`. Uppercase micro-labels became
  `text-caption` / `text-callout`.
- **Global fix:** `cn()` now registers the type-scale classes (`text-callout`, `text-title-3`,
  …) as font sizes in tailwind-merge. Before, they were treated as colours and removed
  `text-white` from filled small buttons (for example "Disable MFA" and "Export alerts").

## Files added

- `docs/status/2026-10-01-redesign-cp7-admin-modules.md`

## Files modified

- `src/lib/utils.ts`
- `src/components/administration/`: connect-integration-dialog, enterprise-admin-center,
  integrations-management, integrations-overview, user-management, user-profile-page
- `src/components/audit/audit-log-center.tsx`
- `src/components/compliance/`: compliance-center, compliance-overview,
  compliance-primitives, grc-auditor-packs-panel
- `src/components/knowledge-base/`: documentation-center, knowledge-base-primitives,
  procedures-center, reports-center, trainings-center
- `src/components/on-call/on-call-center.tsx`
- `src/components/profile/`: active-sessions-card, change-password-form,
  hard-token-onboarding-dialog, manage-mfa-card, notifications-form, profile-layout-nav,
  profile-page-shell, profile-section, security-snapshot
- `e2e/workflows.spec.ts` (filled-button text colour regression test)

## Architectural decisions

- **Type-scale classes are registered with tailwind-merge:** this is the root fix, rather than
  adding `!text-white` overrides where buttons combine a size with a colour.
- **Profile nav uses links styled as module tabs:** each section is its own route, so the
  tab look comes from `moduleTabTriggerClassName` on `Link`s rather than a Radix `Tabs` root.

## Deviations from plan

- None. The tailwind-merge bug pre-dated CP7 and affected every module; it was found during
  the profile review and fixed globally.

## Risks

- On phones the compliance and user-management toolbars wrap onto two rows. They never
  overflow.
- The audit log only has session events in the demo, so the full-width rows were checked
  in code.

## Test results

- `tsc --noEmit`: pass
- `eslint .`: 0 problems
- `next build`: pass
- `playwright test`: 285/285 passed (mobile, tablet, desktop and zoom fit); zoom summary
  `withProblems=0`.
- Computed colour check: "Disable MFA" and "Export alerts" render white text again.
- Screenshots reviewed at 390px: procedures, reports, documentation, trainings, compliance and
  GRC, users, user detail, integrations, enterprise, audit, on-call, profile security; user
  detail at 1440px.

## Acceptance status

- Back-office modules use the shared shell, filter and table patterns: met.
- No horizontal overflow at any breakpoint or zoom level: met.
- Palette preserved; status colours from tokens: met.
- Functionality and URL state preserved: met (e2e).

## Next recommended step

CP8: sign-in, MFA and recovery screens, error pages, privacy and terms; replace Tabler icons
in `password-input`, `copy-button` and `date-range-picker`.
