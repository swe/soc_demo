import {
  PHISH_CAMPAIGNS,
  PHISH_SOURCES,
  type PhishMessageStatus,
  type PhishSource,
  type PhishVerdict,
} from "@/lib/mock-api/phishing";

export type PhishingTab = "overview" | "queue";

export type PhishingListFilters = {
  tab: PhishingTab;
  search: string;
  status: PhishMessageStatus | "all";
  verdict: PhishVerdict | "all";
  source: PhishSource | "all";
  campaignId: string | "all";
  becOnly: boolean;
  messageId: string | null;
};

export const defaultPhishingListFilters: PhishingListFilters = {
  tab: "overview",
  search: "",
  status: "all",
  verdict: "all",
  source: "all",
  campaignId: "all",
  becOnly: false,
  messageId: null,
};

const tabs = ["overview", "queue"] as const satisfies readonly PhishingTab[];

const statuses: Array<PhishMessageStatus | "all"> = [
  "all",
  "new",
  "triaging",
  "remediating",
  "resolved",
  "false_positive",
];

const verdicts: Array<PhishVerdict | "all"> = [
  "all",
  "malicious",
  "suspicious",
  "bec_likely",
  "benign",
  "unknown",
];

const campaignIds = new Set(PHISH_CAMPAIGNS.map((c) => c.id));

function parseEnum<T extends string>(
  value: string | null,
  allowed: readonly T[],
  fallback: T,
): T {
  if (!value) return fallback;
  return (allowed as readonly string[]).includes(value)
    ? (value as T)
    : fallback;
}

export function parsePhishingSearchParams(
  params: URLSearchParams,
): PhishingListFilters {
  const campaignParam = params.get("campaign")?.trim() ?? "all";
  const campaignId =
    campaignParam === "all" || campaignIds.has(campaignParam)
      ? campaignParam
      : "all";
  const tabParam = params.get("tab");
  const messageId = params.get("message")?.trim() || null;
  const tab: PhishingTab =
    tabParam && (tabs as readonly string[]).includes(tabParam)
      ? (tabParam as PhishingTab)
      : messageId
        ? "queue"
        : "overview";

  return {
    tab,
    search: params.get("q")?.trim() ?? "",
    status: parseEnum(params.get("status"), statuses, "all"),
    verdict: parseEnum(params.get("verdict"), verdicts, "all"),
    source: parseEnum(
      params.get("source"),
      ["all", ...PHISH_SOURCES] as const,
      "all",
    ),
    campaignId,
    becOnly: params.get("bec") === "1",
    messageId,
  };
}

export function buildPhishingHref(
  filters: Partial<PhishingListFilters> = {},
): string {
  const merged: PhishingListFilters = {
    ...defaultPhishingListFilters,
    ...filters,
  };
  const params = new URLSearchParams();

  if (merged.tab !== "overview") params.set("tab", merged.tab);
  if (merged.search.trim()) params.set("q", merged.search.trim());
  if (merged.status !== "all") params.set("status", merged.status);
  if (merged.verdict !== "all") params.set("verdict", merged.verdict);
  if (merged.source !== "all") params.set("source", merged.source);
  if (merged.campaignId !== "all") params.set("campaign", merged.campaignId);
  if (merged.becOnly) params.set("bec", "1");
  if (merged.messageId) params.set("message", merged.messageId);

  const qs = params.toString();
  return qs ? `/email-security?${qs}` : "/email-security";
}
