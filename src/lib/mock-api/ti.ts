import {
  getSessionFeeds,
  getSessionIndicators,
  ingestIndicators,
  nextIndicatorId,
  setFeedStatus,
  toggleFeedPause,
} from "@/components/threats/threat-session";
import type {
  Indicator,
  ThreatFeed,
} from "@/components/threats/threat-shared-data";

import { auditFromReceipt } from "./audit";
import { mockDelay } from "./delay";
import { type ActionReceipt, type ListResult,makeReceipt } from "./types";

export type TaxiiCollection = {
  id: string;
  title: string;
  description: string;
  objects: number;
  lastPollLabel: string;
  status: "healthy" | "degraded" | "paused";
};

export type StixImportResult = {
  receipt: ActionReceipt;
  indicators: Indicator[];
};

export type TaxiiSyncResult = {
  receipt: ActionReceipt;
  collection: TaxiiCollection | null;
  indicators: Indicator[];
  /** Optional Investigate deep-link query suggested after sync. */
  suggestInvestigateQuery?: string;
  suggestSourceIds?: string[];
};

const seedTaxiiCollections: TaxiiCollection[] = [
  {
    id: "taxii-mitre",
    title: "MITRE ATT&CK STIX",
    description: "Enterprise ATT&CK objects via TAXII 2.1.",
    objects: 1842,
    lastPollLabel: "12 min ago",
    status: "healthy",
  },
  {
    id: "taxii-osint",
    title: "OSINT bundle feed",
    description: "Community IOCs and campaign reports.",
    objects: 964,
    lastPollLabel: "28 min ago",
    status: "healthy",
  },
  {
    id: "taxii-isac",
    title: "ISAC shared collection",
    description: "Sector ISAC indicators and sightings.",
    objects: 412,
    lastPollLabel: "2h ago",
    status: "degraded",
  },
  {
    id: "taxii-internal",
    title: "Heimdall internal TI",
    description: "Org-produced STIX from confirmed incidents.",
    objects: 186,
    lastPollLabel: "5 min ago",
    status: "healthy",
  },
];

const DEMO_STIX_OBJECTS: Array<
  Pick<Indicator, "type" | "value" | "title" | "severity" | "confidence" | "tags">
> = [
  {
    type: "domain",
    value: "cdn-edge-verify[.]top",
    title: "STIX indicator · lookalike CDN verify",
    severity: "high",
    confidence: "high",
    tags: ["stix", "phishing", "import"],
  },
  {
    type: "ip",
    value: "45.83.191.22",
    title: "STIX indicator · C2 relay",
    severity: "critical",
    confidence: "medium",
    tags: ["stix", "c2", "import"],
  },
  {
    type: "hash",
    value: "a3f1c9e8b2d44701f65e90aa12bcdeef00112233",
    title: "STIX indicator · dropper SHA1",
    severity: "high",
    confidence: "high",
    tags: ["stix", "malware", "import"],
  },
  {
    type: "url",
    value: "https://login-okta-sso[.]net/oauth/authorize",
    title: "STIX indicator · fake IdP authorize URL",
    severity: "critical",
    confidence: "high",
    tags: ["stix", "credential", "import"],
  },
];

const TAXII_SYNC_OBJECTS: Record<
  string,
  Array<
    Pick<
      Indicator,
      "type" | "value" | "title" | "severity" | "confidence" | "tags"
    >
  >
> = {
  "taxii-mitre": [
    {
      type: "domain",
      value: "attack-pattern-beacon[.]io",
      title: "TAXII · ATT&CK-linked beacon domain",
      severity: "medium",
      confidence: "medium",
      tags: ["taxii", "mitre", "T1071"],
    },
  ],
  "taxii-osint": [
    {
      type: "ip",
      value: "103.27.238.91",
      title: "TAXII · OSINT scanner cluster",
      severity: "medium",
      confidence: "low",
      tags: ["taxii", "osint", "scan"],
    },
    {
      type: "domain",
      value: "paste-drop[.]xyz",
      title: "TAXII · OSINT staging domain",
      severity: "high",
      confidence: "medium",
      tags: ["taxii", "osint"],
    },
  ],
  "taxii-isac": [
    {
      type: "hash",
      value: "9c1e44aa77bb0011ffeeddcc9988776655443322",
      title: "TAXII · ISAC shared implant",
      severity: "critical",
      confidence: "high",
      tags: ["taxii", "isac", "malware"],
    },
  ],
  "taxii-internal": [
    {
      type: "ip",
      value: "10.64.12.88",
      title: "TAXII · internal confirmed C2 pivot",
      severity: "high",
      confidence: "high",
      tags: ["taxii", "internal", "confirmed"],
    },
  ],
};

let taxiiStore: TaxiiCollection[] = seedTaxiiCollections.map((c) => ({ ...c }));

function buildIndicator(
  partial: Pick<
    Indicator,
    "type" | "value" | "title" | "severity" | "confidence" | "tags"
  >,
  feedIds: string[],
  sources: string[],
): Indicator {
  return {
    id: nextIndicatorId(),
    type: partial.type,
    value: partial.value,
    title: partial.title,
    status: "active",
    confidence: partial.confidence,
    severity: partial.severity,
    sources,
    actorIds: [],
    campaignIds: [],
    relatedAlertIds: [],
    relatedHuntIds: [],
    darkWebExposureIds: [],
    feedIds,
    techniqueIds: partial.tags.filter((t) => /^T\d/.test(t)),
    firstSeenLabel: "Today",
    lastSeenLabel: "Just now",
    firstSeenMinutes: 5,
    tags: partial.tags,
    notes: "Ingested via STIX/TAXII mock import (Heimdall consolidator).",
  };
}

function investigateQueryForIoc(indicator: Indicator): {
  query: string;
  sourceIds: string[];
} {
  switch (indicator.type) {
    case "ip":
      return {
        query: `network.flow | where dest.ip == "${indicator.value}" or src.ip == "${indicator.value}" | project hostname, dest.ip, dest.port, bytes_out`,
        sourceIds: ["int-palo-edge", "int-splunk-core", "int-chronicle-secops"],
      };
    case "domain":
      return {
        query: `dns.query | where query contains "${indicator.value.replace(/\[\.\]/g, ".")}" | project hostname, query, qtype, src.ip`,
        sourceIds: ["int-cloudflare", "int-splunk-core", "int-palo-edge"],
      };
    case "hash":
      return {
        query: `process.create | where hash.sha1 == "${indicator.value}" or hash.sha256 == "${indicator.value}" | project hostname, process.name, cmdline`,
        sourceIds: [
          "int-defender-endpoint",
          "int-crowdstrike-falcon",
          "int-splunk-core",
        ],
      };
    case "url":
      return {
        query: `network.http | where url contains "${indicator.value.slice(0, 40)}" | project hostname, url, dest.ip, status`,
        sourceIds: ["int-palo-edge", "int-splunk-core"],
      };
    default:
      return {
        query: `events | where message contains "${indicator.value}" | take 50`,
        sourceIds: ["int-splunk-core"],
      };
  }
}

export const tiApi = {
  async listFeeds(): Promise<ListResult<ThreatFeed>> {
    await mockDelay(60);
    const items = getSessionFeeds();
    return { items, total: items.length };
  },

  async listIndicators(): Promise<ListResult<Indicator>> {
    await mockDelay(60);
    const items = getSessionIndicators();
    return { items, total: items.length };
  },

  async listTaxiiCollections(): Promise<ListResult<TaxiiCollection>> {
    await mockDelay(50);
    return { items: taxiiStore, total: taxiiStore.length };
  },

  async pauseFeed(feedId: string): Promise<{
    feed: ThreatFeed | null;
    receipt: ActionReceipt;
  }> {
    await mockDelay(140);
    const feed = toggleFeedPause(feedId);
    const receipt = makeReceipt({
      outcome: "simulated",
      message: feed
        ? `Feed ${feed.name} is now ${feed.status}`
        : "Feed not found",
      targetType: "feed",
      targetId: feedId,
    });
    if (feed) auditFromReceipt(receipt, "ti.feed_pause_toggle", "feed");
    return { feed, receipt };
  },

  async setFeedStatus(
    feedId: string,
    status: ThreatFeed["status"],
  ): Promise<{ feed: ThreatFeed | null; receipt: ActionReceipt }> {
    await mockDelay(120);
    const feed = setFeedStatus(feedId, status);
    const receipt = makeReceipt({
      outcome: "simulated",
      message: feed
        ? `Feed ${feed.name} status → ${status}`
        : "Feed not found",
      targetType: "feed",
      targetId: feedId,
    });
    if (feed) auditFromReceipt(receipt, "ti.feed_status", "feed");
    return { feed, receipt };
  },

  /** Import a demo STIX 2.1 bundle → creates IOCs + receipt. */
  async importStixBundle(): Promise<StixImportResult> {
    await mockDelay(220);
    const feedId = "feed-osint-domain";
    const indicators = DEMO_STIX_OBJECTS.map((obj) =>
      buildIndicator(obj, [feedId], ["STIX bundle import", "Heimdall TI"]),
    );
    const created = ingestIndicators(indicators, feedId);
    const receipt = makeReceipt({
      outcome: "ok",
      message: `Imported STIX 2.1 bundle (${created.length} indicators · ${DEMO_STIX_OBJECTS.length + 12} objects)`,
      targetType: "ti-feed",
      targetId: "stix-bundle-demo",
      detail: `type=bundle; indicators=${created.length}`,
      externalRef: `stix-${Date.now().toString(36)}`,
    });
    auditFromReceipt(receipt, "ti.stix_bundle_imported", "feed");
    for (const ioc of created.slice(0, 2)) {
      auditFromReceipt(
        makeReceipt({
          outcome: "ok",
          message: `IOC created from STIX: ${ioc.value}`,
          targetType: "indicator",
          targetId: ioc.id,
        }),
        "ti.indicator_from_stix",
        "indicator",
      );
    }
    return { receipt, indicators: created };
  },

  /** Sync a TAXII collection → feeds indicators and optionally suggests Investigate. */
  async syncTaxiiCollection(collectionId: string): Promise<TaxiiSyncResult> {
    await mockDelay(260);
    const idx = taxiiStore.findIndex((c) => c.id === collectionId);
    const collection = idx >= 0 ? taxiiStore[idx]! : null;
    if (!collection) {
      const receipt = makeReceipt({
        outcome: "failed",
        message: `TAXII collection ${collectionId} not found`,
        targetType: "feed",
        targetId: collectionId,
      });
      auditFromReceipt(receipt, "ti.taxii_sync", "feed");
      return { receipt, collection: null, indicators: [] };
    }

    const objects = TAXII_SYNC_OBJECTS[collectionId] ?? [
      {
        type: "domain" as const,
        value: `taxii-sync-${Date.now().toString(36)}[.]example`,
        title: `TAXII sync · ${collection.title}`,
        severity: "medium" as const,
        confidence: "medium" as const,
        tags: ["taxii", "sync"],
      },
    ];

    const feedId =
      collectionId === "taxii-internal"
        ? "feed-actor-ttp"
        : "feed-osint-domain";
    const indicators = objects.map((obj) =>
      buildIndicator(obj, [feedId], [collection.title, "TAXII 2.1"]),
    );
    const created = ingestIndicators(indicators, feedId);

    taxiiStore = taxiiStore.map((c, i) =>
      i === idx
        ? {
            ...c,
            objects: c.objects + created.length,
            lastPollLabel: "just now",
            status: "healthy" as const,
          }
        : c,
    );
    const updated = taxiiStore[idx]!;

    const primary = created[0];
    const suggest = primary ? investigateQueryForIoc(primary) : undefined;

    const receipt = makeReceipt({
      outcome: "ok",
      message: `TAXII sync “${collection.title}” · ${created.length} indicator${created.length === 1 ? "" : "s"}`,
      targetType: "feed",
      targetId: collectionId,
      detail: `objects+=${created.length}; lastPoll=just now`,
      externalRef: `taxii-${Date.now().toString(36)}`,
    });
    auditFromReceipt(receipt, "ti.taxii_sync", "feed");

    return {
      receipt,
      collection: updated,
      indicators: created,
      suggestInvestigateQuery: suggest?.query,
      suggestSourceIds: suggest?.sourceIds,
    };
  },
};
