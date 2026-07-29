"use client";

import { useMemo, useSyncExternalStore } from "react";

import { appendAuditLog } from "@/components/audit/audit-log-data";
import {
  nextDetectionId,
  upsertDetection,
} from "@/components/detections/detections-session";
import type { DetectionRule } from "@/components/detections/detections-data";
import { currentProfile } from "@/components/profile/profile-data";

import {
  type Hunt,
  type HuntOutcome,
  type Indicator,
  type ThreatFeed,
  threatFeeds as seedFeeds,
  threatHunts as seedHunts,
  threatIndicators as seedIndicators,
} from "./threat-shared-data";

type HuntStore = Map<string, Hunt>;
type FeedStore = Map<string, ThreatFeed>;
type IndicatorStore = Map<string, Indicator>;

let huntStore: HuntStore = new Map(seedHunts.map((hunt) => [hunt.id, hunt]));
let feedStore: FeedStore = new Map(seedFeeds.map((feed) => [feed.id, feed]));
let indicatorStore: IndicatorStore = new Map(
  seedIndicators.map((indicator) => [indicator.id, indicator]),
);

const listeners = new Set<() => void>();

/** Cached for useSyncExternalStore — getSnapshot must return a stable reference. */
let cachedSnapshot = { huntStore, feedStore, indicatorStore };

function emit() {
  cachedSnapshot = { huntStore, feedStore, indicatorStore };
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
  const sourceIndicators =
    linked.length > 0
      ? linked.slice(0, 5)
      : [];

  const detectionId = nextDetectionId();
  const primary = sourceIndicators[0];
  const detection: DetectionRule = {
    id: detectionId,
    name: `IOC detection · ${feed.name}`,
    status: "experimental",
    severity: primary?.severity ?? "high",
    mitreTactic: "Initial Access",
    mitreTechnique: primary?.techniqueIds[0] ?? "T1071",
    lastTriggeredAt: new Date().toISOString(),
    alertCount: primary?.relatedAlertIds.length ?? 0,
    ownerId: currentProfile.id,
    ownerName: currentProfile.name,
    playbookId: null,
    playbookCode: null,
    summary: `Detection minted from ${feed.name} (${feed.provider}). Tracks ${Math.max(sourceIndicators.length, 1)} IOC${sourceIndicators.length === 1 ? "" : "s"} pushed from threat feed ingest.`,
    linkedAlertIds: primary?.relatedAlertIds.slice(0, 8) ?? [],
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
      getHunt: (id: string) => snapshot.huntStore.get(id) ?? null,
      getFeed: (id: string) => snapshot.feedStore.get(id) ?? null,
      startHunt,
      closeHunt,
      setFeedStatus,
      toggleFeedPause,
      pushFeedIocsToDetection,
    }),
    [snapshot],
  );
}
