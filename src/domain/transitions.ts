import type { AlertStatus, IncidentStatus, InvestigationStatus } from './enums'

/**
 * Single source of truth for domain lifecycle rules (ADR-0003).
 *
 * Services enforce these maps via assertTransition(); the UI reads the same
 * maps (canTransition / nextStatuses) to render only legal actions.
 * No status graph may be hardcoded anywhere else.
 */

export type TransitionMap<S extends string> = Readonly<Record<S, readonly S[]>>

export const ALERT_TRANSITIONS: TransitionMap<AlertStatus> = {
  new: ['triaged', 'resolved', 'dismissed'],
  triaged: ['resolved', 'dismissed'],
  resolved: [],
  dismissed: [],
}

export const INVESTIGATION_TRANSITIONS: TransitionMap<InvestigationStatus> = {
  open: ['active', 'closed'],
  active: ['closed'],
  closed: [],
}

export const INCIDENT_TRANSITIONS: TransitionMap<IncidentStatus> = {
  declared: ['contained', 'resolved'],
  contained: ['resolved'],
  resolved: ['closed'],
  closed: [],
}

/** Thrown by assertTransition; mapped to 409 problem+json at the API edge. */
export class TransitionError extends Error {
  readonly status = 409

  constructor(entity: string, from: string, to: string) {
    super(`Illegal ${entity} transition: ${from} → ${to}`)
    this.name = 'TransitionError'
  }
}

export function canTransition<S extends string>(map: TransitionMap<S>, from: S, to: S): boolean {
  return map[from].includes(to)
}

/** Legal next statuses from a given state (UI renders these as actions). */
export function nextStatuses<S extends string>(map: TransitionMap<S>, from: S): readonly S[] {
  return map[from]
}

export function isTerminal<S extends string>(map: TransitionMap<S>, status: S): boolean {
  return map[status].length === 0
}

export function assertTransition<S extends string>(
  entity: string,
  map: TransitionMap<S>,
  from: S,
  to: S,
): void {
  if (!canTransition(map, from, to)) throw new TransitionError(entity, from, to)
}
