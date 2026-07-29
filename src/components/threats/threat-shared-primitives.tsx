"use client";

import {
  CircleCheck,
  CircleDashed,
  CircleSlash,
  Fingerprint,
  Globe,
  Hash,
  Link2,
  type LucideIcon,
  Mail,
  Network,
} from "lucide-react";
import type { ReactNode } from "react";

import { SeverityBadge as AlertSeverityBadge } from "@/components/alerts/alerts-primitives";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import {
  campaignStatusLabels,
  feedStatusLabels,
  type HuntOutcome,
  huntOutcomeLabels,
  type HuntStatus,
  huntStatusLabels,
  type IndicatorConfidence,
  indicatorConfidenceLabels,
  type IndicatorStatus,
  indicatorStatusLabels,
  type IndicatorType,
  indicatorTypeLabels,
  type ThreatCampaign,
  type ThreatFeed,
} from "./threat-shared-data";

export { AlertSeverityBadge as SeverityBadge };

export const mutedControlClassName =
  "border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground";

export function SheetDetailRow({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3 text-sm">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className="min-w-0 text-right font-medium break-words">
        {children}
      </span>
    </div>
  );
}

const typeIcons: Record<IndicatorType, LucideIcon> = {
  ip: Network,
  domain: Globe,
  hash: Hash,
  url: Link2,
  email: Mail,
};

const typeTones: Record<IndicatorType, string> = {
  ip: "text-sky-700 dark:text-sky-400",
  domain: "text-violet-700 dark:text-violet-400",
  hash: "text-amber-700 dark:text-amber-400",
  url: "text-emerald-700 dark:text-emerald-400",
  email: "text-rose-700 dark:text-rose-400",
};

export function IndicatorTypeBadge({ type }: { type: IndicatorType }) {
  const Icon = typeIcons[type];
  return (
    <Badge
      variant="outline"
      className={cn("gap-1 rounded-full font-medium", typeTones[type])}
    >
      <Icon className="size-3" />
      {indicatorTypeLabels[type]}
    </Badge>
  );
}

const statusDetails: Record<
  IndicatorStatus,
  { className: string; icon: LucideIcon }
> = {
  active: {
    className:
      "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    icon: CircleCheck,
  },
  under_review: {
    className:
      "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400",
    icon: CircleDashed,
  },
  expired: {
    className: "border-border bg-muted text-muted-foreground",
    icon: CircleSlash,
  },
  false_positive: {
    className: "border-border bg-muted text-muted-foreground",
    icon: CircleSlash,
  },
};

export function IndicatorStatusBadge({ status }: { status: IndicatorStatus }) {
  const detail = statusDetails[status];
  const Icon = detail.icon;
  return (
    <Badge
      variant="outline"
      className={cn("gap-1 rounded-full font-medium", detail.className)}
    >
      <Icon className="size-3" />
      {indicatorStatusLabels[status]}
    </Badge>
  );
}

const confidenceTones: Record<IndicatorConfidence, string> = {
  high: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  medium:
    "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  low: "border-border bg-muted text-muted-foreground",
};

export function ConfidenceBadge({
  confidence,
}: {
  confidence: IndicatorConfidence;
}) {
  return (
    <Badge
      variant="outline"
      className={cn("rounded-full font-medium", confidenceTones[confidence])}
    >
      {indicatorConfidenceLabels[confidence]}
    </Badge>
  );
}

const huntStatusTones: Record<HuntStatus, string> = {
  draft: "border-border bg-muted text-muted-foreground",
  running:
    "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-400",
  closed:
    "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
};

export function HuntStatusBadge({ status }: { status: HuntStatus }) {
  return (
    <Badge
      variant="outline"
      className={cn("rounded-full font-medium", huntStatusTones[status])}
    >
      {huntStatusLabels[status]}
    </Badge>
  );
}

const outcomeTones: Record<HuntOutcome, string> = {
  confirmed:
    "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-400",
  not_found:
    "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  inconclusive:
    "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400",
};

export function HuntOutcomeBadge({ outcome }: { outcome: HuntOutcome }) {
  return (
    <Badge
      variant="outline"
      className={cn("rounded-full font-medium", outcomeTones[outcome])}
    >
      {huntOutcomeLabels[outcome]}
    </Badge>
  );
}

const feedStatusTones: Record<ThreatFeed["status"], string> = {
  healthy:
    "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  degraded:
    "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  paused: "border-border bg-muted text-muted-foreground",
};

export function FeedStatusBadge({ status }: { status: ThreatFeed["status"] }) {
  return (
    <Badge
      variant="outline"
      className={cn("rounded-full font-medium", feedStatusTones[status])}
    >
      {feedStatusLabels[status]}
    </Badge>
  );
}

const campaignStatusTones: Record<ThreatCampaign["status"], string> = {
  active:
    "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-400",
  monitoring:
    "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-400",
  concluded: "border-border bg-muted text-muted-foreground",
};

export function CampaignStatusBadge({
  status,
}: {
  status: ThreatCampaign["status"];
}) {
  return (
    <Badge
      variant="outline"
      className={cn("rounded-full font-medium", campaignStatusTones[status])}
    >
      {campaignStatusLabels[status]}
    </Badge>
  );
}

export function ActorAvatar({ name }: { name: string }) {
  return (
    <span className="bg-muted flex size-10 shrink-0 items-center justify-center rounded-lg border">
      <Fingerprint className="text-muted-foreground size-4" />
      <span className="sr-only">{name}</span>
    </span>
  );
}
