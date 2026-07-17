import { describe, expect, it } from 'vitest'

import * as domain from '@domain/enums'
import * as pg from '@server/db/schema/enums'

/**
 * The pg enums are constructed from the domain arrays, but this test guards
 * against someone redefining a pg enum with a literal list later.
 */
describe('database enums mirror domain enums', () => {
  const pairs: [readonly string[], { enumValues: string[] }][] = [
    [domain.ROLES, pg.roleEnum],
    [domain.MEMBERSHIP_STATUSES, pg.membershipStatusEnum],
    [domain.ASSET_TYPES, pg.assetTypeEnum],
    [domain.CRITICALITIES, pg.criticalityEnum],
    [domain.ENTITY_STATUSES, pg.entityStatusEnum],
    [domain.IDENTITY_TYPES, pg.identityTypeEnum],
    [domain.PRIVILEGE_TIERS, pg.privilegeTierEnum],
    [domain.SEVERITIES, pg.severityEnum],
    [domain.ALERT_STATUSES, pg.alertStatusEnum],
    [domain.DISPOSITIONS, pg.dispositionEnum],
    [domain.INVESTIGATION_STATUSES, pg.investigationStatusEnum],
    [domain.INCIDENT_STATUSES, pg.incidentStatusEnum],
    [domain.VULNERABILITY_STATUSES, pg.vulnerabilityStatusEnum],
    [domain.INTEGRATION_STATUSES, pg.integrationStatusEnum],
    [domain.ACTOR_TYPES, pg.actorTypeEnum],
    [domain.EVENT_CATEGORIES, pg.eventCategoryEnum],
  ]

  it('every pg enum has exactly the domain values', () => {
    for (const [domainValues, pgEnum] of pairs) {
      expect(pgEnum.enumValues).toEqual([...domainValues])
    }
  })
})
