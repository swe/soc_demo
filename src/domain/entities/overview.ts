import { z } from 'zod'

import { SEVERITIES } from '../enums'
import { incidentSchema } from './incident'

export const overviewSchema = z.object({
  kpis: z.object({
    openAlerts: z.number(),
    openAlertsBySeverity: z.record(z.enum(SEVERITIES), z.number()),
    openIncidents: z.number(),
    activeInvestigations: z.number(),
    monitoredAssets: z.number(),
    openVulnerabilities: z.number(),
    exploitedVulnerabilities: z.number(),
  }),
  severityTrend: z.array(
    z.object({
      day: z.string(),
      critical: z.number(),
      high: z.number(),
      medium: z.number(),
      low: z.number(),
    }),
  ),
  openIncidents: z.array(incidentSchema),
  topRiskyAssets: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      type: z.string(),
      criticality: z.string(),
      riskScore: z.number(),
    }),
  ),
})
export type OverviewDto = z.infer<typeof overviewSchema>
