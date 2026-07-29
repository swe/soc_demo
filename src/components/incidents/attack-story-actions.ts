import {
  type DisruptOptions,
  type DisruptResult,
  incidentsApi,
} from "@/lib/mock-api/incidents";

import type { AttackStory, AttackStoryAction } from "./attack-story";
import type { SocIncident } from "./incidents-data";

export type DisruptionPatch = Parameters<
  typeof incidentsApi.patchSync
>[1];

export type ExecuteDisruptionResult = DisruptResult;

/**
 * Attack disruption via mock API — always simulated receipts + audit.
 * `patchIncidents` is unused (kept for call-site compatibility); the API patches the session.
 */
export async function executeAttackDisruption(
  incident: SocIncident,
  story: AttackStory,
  _patchIncidents?: unknown,
  options?: DisruptOptions & { actions?: AttackStoryAction[] },
): Promise<ExecuteDisruptionResult> {
  return incidentsApi.disrupt(incident, story, options);
}
