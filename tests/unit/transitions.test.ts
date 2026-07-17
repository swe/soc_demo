import { describe, expect, it } from 'vitest'

import {
  ALERT_STATUSES,
  INCIDENT_STATUSES,
  INVESTIGATION_STATUSES,
} from '@domain/enums'
import {
  ALERT_TRANSITIONS,
  INCIDENT_TRANSITIONS,
  INVESTIGATION_TRANSITIONS,
  TransitionError,
  assertTransition,
  canTransition,
  isTerminal,
  nextStatuses,
  type TransitionMap,
} from '@domain/transitions'

/**
 * Exhaustive pair coverage (ADR-0003): for every (from, to) pair of each
 * machine, the map's verdict must match the explicitly allowed set below.
 * A change to any lifecycle must be made in both places deliberately.
 */
function coverAllPairs<S extends string>(
  entity: string,
  statuses: readonly S[],
  map: TransitionMap<S>,
  allowed: ReadonlySet<`${S}->${S}`>,
) {
  it('map covers every status exactly once', () => {
    expect(Object.keys(map).sort()).toEqual([...statuses].sort())
  })

  it('every (from, to) pair matches the allowed set', () => {
    for (const from of statuses) {
      for (const to of statuses) {
        const expected = allowed.has(`${from}->${to}`)
        expect(canTransition(map, from, to), `${entity}: ${from} → ${to}`).toBe(expected)

        if (expected) {
          expect(() => assertTransition(entity, map, from, to)).not.toThrow()
        } else {
          expect(() => assertTransition(entity, map, from, to)).toThrow(TransitionError)
        }
      }
    }
  })

  it('nextStatuses mirrors the map', () => {
    for (const from of statuses) {
      expect(nextStatuses(map, from)).toEqual(map[from])
    }
  })
}

describe('alert transitions', () => {
  coverAllPairs(
    'alert',
    ALERT_STATUSES,
    ALERT_TRANSITIONS,
    new Set([
      'new->triaged',
      'new->resolved',
      'new->dismissed',
      'triaged->resolved',
      'triaged->dismissed',
    ]),
  )

  it('resolved and dismissed are terminal; new and triaged are not', () => {
    expect(isTerminal(ALERT_TRANSITIONS, 'resolved')).toBe(true)
    expect(isTerminal(ALERT_TRANSITIONS, 'dismissed')).toBe(true)
    expect(isTerminal(ALERT_TRANSITIONS, 'new')).toBe(false)
    expect(isTerminal(ALERT_TRANSITIONS, 'triaged')).toBe(false)
  })
})

describe('investigation transitions', () => {
  coverAllPairs(
    'investigation',
    INVESTIGATION_STATUSES,
    INVESTIGATION_TRANSITIONS,
    new Set(['open->active', 'open->closed', 'active->closed']),
  )

  it('closed is the only terminal state', () => {
    expect(isTerminal(INVESTIGATION_TRANSITIONS, 'closed')).toBe(true)
    expect(isTerminal(INVESTIGATION_TRANSITIONS, 'open')).toBe(false)
    expect(isTerminal(INVESTIGATION_TRANSITIONS, 'active')).toBe(false)
  })
})

describe('incident transitions', () => {
  coverAllPairs(
    'incident',
    INCIDENT_STATUSES,
    INCIDENT_TRANSITIONS,
    new Set([
      'declared->contained',
      'declared->resolved',
      'contained->resolved',
      'resolved->closed',
    ]),
  )

  it('closed is the only terminal state', () => {
    expect(isTerminal(INCIDENT_TRANSITIONS, 'closed')).toBe(true)
    expect(isTerminal(INCIDENT_TRANSITIONS, 'declared')).toBe(false)
  })
})

describe('TransitionError', () => {
  it('carries a 409 status and a readable message', () => {
    const error = new TransitionError('alert', 'resolved', 'new')
    expect(error.status).toBe(409)
    expect(error.message).toBe('Illegal alert transition: resolved → new')
    expect(error.name).toBe('TransitionError')
  })

  it('self-transitions are never legal transitions', () => {
    for (const status of ALERT_STATUSES) {
      expect(canTransition(ALERT_TRANSITIONS, status, status)).toBe(false)
    }
    for (const status of INCIDENT_STATUSES) {
      expect(canTransition(INCIDENT_TRANSITIONS, status, status)).toBe(false)
    }
    for (const status of INVESTIGATION_STATUSES) {
      expect(canTransition(INVESTIGATION_TRANSITIONS, status, status)).toBe(false)
    }
  })
})
