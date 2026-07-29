"use client";

import { useMemo, useSyncExternalStore } from "react";

import { appendAuditLog } from "@/components/audit/audit-log-data";
import type { DetectionRule } from "@/components/detections/detections-data";
import {
  getDetectionsFromSession,
  nextDetectionId,
  upsertDetection,
} from "@/components/detections/detections-session";
import {
  eventEntity,
  runMockQuery,
} from "@/components/investigate/investigate-data";
import { currentProfile } from "@/components/profile/profile-data";

import {
  buildInvestigateQueryForHunt,
  defaultHuntSourceIds,
  type Hunt,
  type HuntOutcome,
  type HuntRunHit,
  type HuntRunResult,
  type Indicator,
  type ThreatFeed,
  threatFeeds as seedFeeds,
  threatHunts as seedHunts,
  threatIndicators as seedIndicators,
} from "./threat-shared-data";

type HuntStore = Map<string, Hunt>;
type FeedStore = Map<string, ThreatFeed>;
type IndicatorStore = Map<string, Indicator>;
type HuntRunStore = Map<string, HuntRunResult>;

let huntStore: HuntStore = new Map(seedHunts.map((hunt) => [hunt.id, hunt]));
let feedStore: FeedStore = new Map(seedFeeds.map((feed) => [feed.id, feed]));
let indicatorStore: IndicatorStore = new Map(
  seedIndicators.map((indicator) => [indicator.id, indicator]),
);
let huntRunStore: HuntRunStore = new Map();

const listeners = new Set<() => void>();

/** Cached for useSyncExternalStore — getSnapshot must return a stable reference. */
let cachedSnapshot = { huntStore, feedStore, indicatorStore, huntRunStore };

function emit() {
  cachedSnapshot = { huntStore, feedStore, indicatorStore, huntRunStore };
  for (const listener of listeners) listener();
}

export function subscribeThreatSession(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getThreatSessionSnapshot() {
  return cachedSnapshot;
}

export function getSessionHunts(): Hunt[] {
  return Array.from(huntStore.values());
}

export function getSessionFeeds(): ThreatFeed[] {
  return Array.from(feedStore.values());
}

export function getSessionIndicators(): Indicator[] {
  return Array.from(indicatorStore.values());
}

export function getIndicatorFromSession(id: string): Indicator | null {
  return indicatorStore.get(id) ?? null;
}

export function getHuntFromSession(id: string) {
  return huntStore.get(id) ?? null;
}

export function getFeedFromSession(id: string) {
  return feedStore.get(id) ?? null;
}

export function getHuntRunResult(huntId: string): HuntRunResult | null {
  return huntRunStore.get(huntId) ?? null;
}

function setHunt(hunt: Hunt) {
  const next = new Map(huntStore);
  next.set(hunt.id, hunt);
  huntStore = next;
  emit();
}

function setFeed(feed: ThreatFeed) {
  const next = new Map(feedStore);
  next.set(feed.id, feed);
  feedStore = next;
  emit();
}

function setIndicator(indicator: Indicator) {
  const next = new Map(indicatorStore);
  next.set(indicator.id, indicator);
  indicatorStore = next;
  emit();
}

export function nextIndicatorId(prefix = "IOC"): string {
  let max = 2000;
  for (const indicator of indicatorStore.values()) {
    const match = new RegExp(`^${prefix}-(\\d+)$`).exec(indicator.id);
    if (match) max = Math.max(max, Number(match[1]));
  }
  return `${prefix}-${max + 1}`;
}

/** Ingest indicators from a STIX/TAXII mock import and bump linked feeds. */
export function ingestIndicators(
  indicators: Indicator[],
  feedId?: string,
): Indicator[] {
  const created: Indicator[] = [];
  for (const indicator of indicators) {
    setIndicator(indicator);
    created.push(indicator);
  }
  if (feedId) {
    const feed = feedStore.get(feedId);
    if (feed) {
      setFeed({
        ...feed,
        indicatorCount: feed.indicatorCount + created.length,
        lastIngestLabel: "Just now",
        lastIngestAt: new Date().toISOString(),
        status: feed.status === "paused" ? "paused" : "healthy",
      });
    }
  }
  return created;
}

function setHuntRun(result: HuntRunResult) {
  const next = new Map(huntRunStore);
  next.set(result.huntId, result);
  huntRunStore = next;
  emit();
}

export function nextHuntId() {
  let max = 0;
  for (const hunt of huntStore.values()) {
    const match = /^HUNT-(\d+)$/.exec(hunt.id);
    if (match) max = Math.max(max, Number(match[1]));
  }
  return `HUNT-${String(max + 1).padStart(3, "0")}`;
}

export function startHunt(id: string): Hunt | null {
  const hunt = huntStore.get(id);
  if (!hunt || hunt.status !== "draft") {
    return hunt ?? null;
  }

  const next: Hunt = {
    ...hunt,
    status: "running",
    updatedLabel: "Just now",
    outcome: undefined,
  };
  setHunt(next);

  appendAuditLog({
    actorId: currentProfile.id,
    actorName: currentProfile.name,
    action: "hunt.started",
    targetType: "hunt",
    targetId: id,
    detail: `Started hunt: ${hunt.title}`,
  });

  return next;
}

export function closeHunt(
  id: string,
  outcome: HuntOutcome,
  findings?: string,
): Hunt | null {
  const hunt = huntStore.get(id);
  if (!hunt || hunt.status === "closed") {
    return hunt ?? null;
  }

  const next: Hunt = {
    ...hunt,
    status: "closed",
    outcome,
    findings:
      findings ??
      hunt.findings ??
      `Closed as ${outcome.replaceAll("_", " ")} by ${currentProfile.name}.`,
    updatedLabel: "Just now",
  };
  setHunt(next);

  appendAuditLog({
    actorId: currentProfile.id,
    actorName: currentProfile.name,
    action: "hunt.closed",
    targetType: "hunt",
    targetId: id,
    detail: `Closed hunt as ${outcome}: ${hunt.title}`,
  });

  return next;
}

/** Execute hunt QL against mock Investigate corpus; persist result set in session. */
export function runHunt(id: string): HuntRunResult | null {
  const hunt = huntStore.get(id);
  if (!hunt) return null;

  if (hunt.status === "draft") {
    startHunt(id);
  }

  const query = buildInvestigateQueryForHunt(hunt);
  const sourceIds = defaultHuntSourceIds(hunt);
  const events = runMockQuery(query, sourceIds);
  const hits: HuntRunHit[] = events.slice(0, 12).map((event) => ({
    id: event.id,
    timestamp: event.timestamp,
    entity: eventEntity(event),
    sourceId: event.sourceId,
    severity: event.severity,
    summary: event.message,
  }));

  const result: HuntRunResult = {
    huntId: id,
    ranAt: new Date().toISOString(),
    query,
    sourceIds,
    hitCount: events.length,
    hits,
  };
  setHuntRun(result);

  const current = huntStore.get(id) ?? hunt;
  setHunt({
    ...current,
    heimdallQl: current.heimdallQl ?? query,
    sourceIds: current.sourceIds ?? sourceIds,
    updatedLabel: "Just now",
  });

  appendAuditLog({
    actorId: currentProfile.id,
    actorName: currentProfile.name,
    action: "hunt.run",
    targetType: "hunt",
    targetId: id,
    detail: `Hunt run · ${events.length} hit(s)`,
  });

  return result;
}

export type PromoteDetectionResult = {
  detection: DetectionRule;
  hunt: Hunt;
};

/** Mint a draft hunt from a detection rule (Promote to hunt). */
export function createHuntFromDetection(
  detectionId: string,
): PromoteDetectionResult | null {
  const detection =
    getDetectionsFromSession().find((rule) => rule.id === detectionId) ?? null;
  if (!detection) return null;

  const huntId = nextHuntId();
  const hunt: Hunt = {
    id: huntId,
    title: `Hunt · ${detection.name}`.slice(0, 96),
    hypothesis: `Detection ${detection.id} (${detection.mitreTechnique} / ${detection.mitreTactic}) may indicate active adversary activity. ${detection.summary}`,
    status: "draft",
    techniqueIds: [...detection.mitreTechniques],
    indicatorIds: [],
    actorIds: [],
    relatedAlertIds: [...detection.linkedAlertIds],
    relatedIncidentIds: [],
    assignee: currentProfile.name,
    createdLabel: "Just now",
    updatedLabel: "Just now",
    severity: detection.severity,
    heimdallQl: detection.ruleBody,
    sourceIds: [...detection.enabledSourceIds],
    promotedFromDetectionId: detection.id,
  };
  setHunt(hunt);

  appendAuditLog({
    actorId: currentProfile.id,
    actorName: currentProfile.name,
    action: "hunt.promoted_from_detection",
    targetType: "hunt",
    targetId: huntId,
    detail: `Promoted from detection ${detectionId}`,
  });

  return { detection, hunt };
}

export function setFeedStatus(
  id: string,
  status: ThreatFeed["status"],
): ThreatFeed | null {
  const feed = feedStore.get(id);
  if (!feed || feed.status === status) {
    return feed ?? null;
  }

  const next: ThreatFeed = {
    ...feed,
    status,
    lastIngestLabel: status === "paused" ? "Paused" : "Just now",
  };
  setFeed(next);

  appendAuditLog({
    actorId: currentProfile.id,
    actorName: currentProfile.name,
    action: status === "paused" ? "feed.paused" : "feed.resumed",
    targetType: "feed",
    targetId: id,
    detail: `${feed.name}: ${feed.status} → ${status}`,
  });

  return next;
}

export function toggleFeedPause(id: string): ThreatFeed | null {
  const feed = feedStore.get(id);
  if (!feed) return null;
  if (feed.status === "paused") {
    return setFeedStatus(id, "healthy");
  }
  return setFeedStatus(id, "paused");
}

export type PushIocResult = {
  detection: DetectionRule;
  indicators: Indicator[];
};

/** Create (or refresh) a detection from feed IOCs and mark indicators under review. */
export function pushFeedIocsToDetection(feedId: string): PushIocResult | null {
  const feed = feedStore.get(feedId);
  if (!feed) return null;

  const linked = Array.from(indicatorStore.values()).filter((indicator) =>
    indicator.feedIds.includes(feedId),
  );
  const sourceIndicators = linked.length > 0 ? linked.slice(0, 5) : [];

  const detectionId = nextDetectionId();
  const primary = sourceIndicators[0];
  const technique = primary?.techniqueIds[0] ?? "T1071";
  const detection: DetectionRule = {
    id: detectionId,
    name: `IOC detection · ${feed.name}`,
    status: "experimental",
    severity: primary?.severity ?? "high",
    mitreTactic: "Initial Access",
    mitreTechnique: technique,
    mitreTechniques: [technique],
    lastTriggeredAt: new Date().toISOString(),
    alertCount: primary?.relatedAlertIds.length ?? 0,
    ownerId: currentProfile.id,
    ownerName: currentProfile.name,
    playbookId: null,
    playbookCode: null,
    summary: `Detection minted from ${feed.name} (${feed.provider}). Tracks ${Math.max(sourceIndicators.length, 1)} IOC${sourceIndicators.length === 1 ? "" : "s"} pushed from threat feed ingest.`,
    linkedAlertIds: primary?.relatedAlertIds.slice(0, 8) ?? [],
    ruleBody: [
      `// Heimdall QL — IOC feed ${feed.name}`,
      `events`,
      `  | where ioc.value in (${
        sourceIndicators.length > 0
          ? sourceIndicators.map((i) => `"${i.value}"`).join(", ")
          : '"*"'
      })`,
      `  | where mitre.technique == "${technique}"`,
      `  | summarize hits=count() by entity.name, source.id`,
    ].join("\n"),
    lineageSource: "heimdall",
    enabledSourceIds: [
      "int-splunk-core",
      "int-sentinel-workspace",
      "int-chronicle-secops",
    ],
    deployState: "draft",
    deployedSourceIds: [],
    lastDeployAt: null,
    deployVersion: 0,
    deployHistory: [],
  };
  upsertDetection(detection);

  const updatedIndicators: Indicator[] = [];
  for (const indicator of sourceIndicators) {
    const next: Indicator = {
      ...indicator,
      status: "under_review",
      notes: indicator.notes
        ? `${indicator.notes}\n\nPushed to detection ${detectionId}.`
        : `Pushed to detection ${detectionId} from feed ${feed.name}.`,
      tags: indicator.tags.includes("detection-pushed")
        ? indicator.tags
        : [...indicator.tags, "detection-pushed"],
    };
    setIndicator(next);
    updatedIndicators.push(next);
  }

  appendAuditLog({
    actorId: currentProfile.id,
    actorName: currentProfile.name,
    action: "feed.push_ioc_detection",
    targetType: "feed",
    targetId: feedId,
    detail: `Pushed IOCs to ${detectionId} (${updatedIndicators.length} indicators)`,
  });

  if (updatedIndicators[0]) {
    appendAuditLog({
      actorId: currentProfile.id,
      actorName: currentProfile.name,
      action: "indicator.linked_detection",
      targetType: "indicator",
      targetId: updatedIndicators[0].id,
      detail: `Linked to ${detectionId}`,
    });
  }

  return { detection, indicators: updatedIndicators };
}

export function useThreatSession() {
  const snapshot = useSyncExternalStore(
    subscribeThreatSession,
    getThreatSessionSnapshot,
    getThreatSessionSnapshot,
  );

  return useMemo(
    () => ({
      hunts: Array.from(snapshot.huntStore.values()),
      feeds: Array.from(snapshot.feedStore.values()),
      indicators: Array.from(snapshot.indicatorStore.values()),
      huntRuns: snapshot.huntRunStore,
      getHunt: (id: string) => snapshot.huntStore.get(id) ?? null,
      getFeed: (id: string) => snapshot.feedStore.get(id) ?? null,
      getHuntRun: (id: string) => snapshot.huntRunStore.get(id) ?? null,
      startHunt,
      closeHunt,
      runHunt,
      createHuntFromDetection,
      setFeedStatus,
      toggleFeedPause,
      pushFeedIocsToDetection,
    }),
    [snapshot],
  );
}
