"use client";

import { ExternalLink, Search } from "lucide-react";
import Link from "next/link";
import { useDeferredValue, useMemo, useState } from "react";

import {
  ModuleShell,
  ModuleToolbarSearch,
} from "@/components/soc/module-shell";
import { type SocStat, StatsStrip } from "@/components/soc/stats-strip";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

import { getIndicatorFromSession } from "./threat-session";
import {
  getCampaignById,
  type ThreatActorProfile,
  threatActorProfiles,
  type ThreatCampaign,
  threatCampaigns,
} from "./threat-shared-data";
import {
  ActorAvatar,
  CampaignStatusBadge,
  ConfidenceBadge,
  mutedControlClassName,
  SeverityBadge,
  SheetDetailRow,
} from "./threat-shared-primitives";

function ActorDetailSheet({
  actor,
  open,
  onOpenChange,
}: {
  actor: ThreatActorProfile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!actor) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="sm:max-w-md" />
      </Sheet>
    );
  }

  const campaigns = actor.campaignIds
    .map((id) => getCampaignById(id))
    .filter(Boolean);
  const indicators = actor.indicatorIds
    .map((id) => getIndicatorFromSession(id))
    .filter(Boolean);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 overflow-y-auto sm:max-w-md">
        <SheetHeader className="space-y-3 pb-4">
          <div className="flex items-start gap-3">
            <ActorAvatar name={actor.name} />
            <div className="min-w-0">
              <SheetTitle className="text-base leading-snug">
                {actor.name}
              </SheetTitle>
              <SheetDescription className="mt-1 text-xs">
                {actor.aliases.length > 0
                  ? `Aliases: ${actor.aliases.join(", ")}`
                  : "No known aliases"}
              </SheetDescription>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <SeverityBadge severity={actor.severity} />
            <ConfidenceBadge confidence={actor.confidence} />
            <Badge variant="secondary" className="rounded-full font-normal">
              {actor.origin}
            </Badge>
          </div>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-5 pb-6">
          <section className="space-y-2">
            <h3 className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
              Profile
            </h3>
            <p className="text-sm leading-relaxed">{actor.summary}</p>
            <SheetDetailRow label="Industries">
              {actor.industries.join(", ")}
            </SheetDetailRow>
            <SheetDetailRow label="Last activity">
              {actor.lastActivityLabel}
            </SheetDetailRow>
            <SheetDetailRow label="Techniques">
              {actor.techniques.join(", ")}
            </SheetDetailRow>
          </section>

          {campaigns.length > 0 ? (
            <section className="space-y-2.5">
              <h3 className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                Campaigns
              </h3>
              <ul className="space-y-2">
                {campaigns.map((campaign) =>
                  campaign ? (
                    <li
                      key={campaign.id}
                      className="rounded-md border px-2.5 py-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium">{campaign.name}</p>
                        <CampaignStatusBadge status={campaign.status} />
                      </div>
                      <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
                        {campaign.summary}
                      </p>
                    </li>
                  ) : null,
                )}
              </ul>
            </section>
          ) : null}

          {indicators.length > 0 ? (
            <section className="space-y-2.5">
              <h3 className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                Linked indicators
              </h3>
              <ul className="space-y-2">
                {indicators.slice(0, 6).map((indicator) =>
                  indicator ? (
                    <li key={indicator.id}>
                      <Link
                        href={`/threat-intelligence?indicator=${indicator.id}`}
                        className="hover:bg-muted/60 flex items-start gap-2 rounded-md border px-2.5 py-2 transition-colors"
                      >
                        <div className="min-w-0 flex-1">
                          <span className="font-mono text-xs">
                            {indicator.id}
                          </span>
                          <p className="mt-0.5 truncate font-mono text-[11px]">
                            {indicator.value}
                          </p>
                        </div>
                        <ExternalLink className="text-muted-foreground mt-0.5 size-3.5 shrink-0" />
                      </Link>
                    </li>
                  ) : null,
                )}
              </ul>
            </section>
          ) : null}

          <Separator />

          <section className="space-y-2.5">
            <h3 className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
              Actions
            </h3>
            <div className="flex flex-col gap-2">
              <Button
                asChild
                variant="outline"
                size="sm"
                className={cn("justify-start", mutedControlClassName)}
              >
                <Link href="/threat-hunting/analytics">
                  Open in threat analytics
                  <ExternalLink className="ml-1.5 size-3" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="sm"
                className={cn("justify-start", mutedControlClassName)}
              >
                <Link
                  href={`/threat-hunting/hunts?actor=${actor.id}`}
                >
                  Related hunts
                  <ExternalLink className="ml-1.5 size-3" />
                </Link>
              </Button>
            </div>
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function ActorsCenter({
  initialActorId,
}: {
  initialActorId?: string | null;
}) {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const [selectedId, setSelectedId] = useState<string | null>(
    initialActorId ?? null,
  );

  const filteredActors = useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();
    if (!q) return threatActorProfiles;
    return threatActorProfiles.filter((actor) => {
      const hay = [
        actor.name,
        actor.summary,
        actor.origin,
        ...actor.aliases,
        ...actor.techniques,
        ...actor.industries,
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [deferredQuery]);

  const filteredCampaigns = useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();
    if (!q) return threatCampaigns;
    return threatCampaigns.filter((campaign) => {
      const actor = threatActorProfiles.find((a) => a.id === campaign.actorId);
      const hay = [
        campaign.name,
        campaign.summary,
        actor?.name ?? "",
        ...campaign.techniqueIds,
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [deferredQuery]);

  const selected =
    threatActorProfiles.find((actor) => actor.id === selectedId) ?? null;

  const stripStats: SocStat[] = useMemo(() => {
    const highSeverity = threatActorProfiles.filter(
      (actor) => actor.severity === "critical" || actor.severity === "high",
    ).length;
    const linkedIocs = threatActorProfiles.reduce(
      (sum, actor) => sum + actor.indicatorIds.length,
      0,
    );
    const activeCampaigns = threatCampaigns.filter(
      (campaign) => campaign.status === "active",
    ).length;

    return [
      {
        key: "actors",
        title: "Actors",
        value: String(threatActorProfiles.length),
        context: "Tracked profiles",
      },
      {
        key: "campaigns",
        title: "Campaigns",
        value: String(threatCampaigns.length),
        context: `${activeCampaigns} active`,
      },
      {
        key: "high",
        title: "High / critical",
        value: String(highSeverity),
        context: "Elevated actor severity",
      },
      {
        key: "iocs",
        title: "Linked IOCs",
        value: String(linkedIocs),
        context: "Across actor profiles",
      },
    ] satisfies SocStat[];
  }, []);

  return (
    <>
      <ModuleShell
        toolbar={
          <ModuleToolbarSearch>
            <InputGroup className="h-9 w-full lg:max-w-sm">
              <InputGroupAddon>
                <Search className="size-4" />
              </InputGroupAddon>
              <InputGroupInput
                placeholder="Search actors, campaigns, techniques…"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </InputGroup>
          </ModuleToolbarSearch>
        }
      >
        <StatsStrip stats={stripStats} />

        <section className="space-y-3">
          <h2 className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
            Actors
          </h2>
          <div className="grid gap-3 md:grid-cols-2">
            {filteredActors.map((actor) => (
              <button
                key={actor.id}
                type="button"
                onClick={() => setSelectedId(actor.id)}
                className={cn(
                  "hover:bg-muted/40 rounded-lg border p-4 text-left transition-colors",
                  selectedId === actor.id && "border-foreground/40 bg-muted/30",
                )}
              >
                <div className="flex items-start gap-3">
                  <ActorAvatar name={actor.name} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">{actor.name}</p>
                      <SeverityBadge severity={actor.severity} />
                    </div>
                    <p className="text-muted-foreground mt-1 line-clamp-2 text-sm">
                      {actor.summary}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <ConfidenceBadge confidence={actor.confidence} />
                      <Badge
                        variant="secondary"
                        className="rounded-full font-normal"
                      >
                        {actor.indicatorIds.length} IOCs
                      </Badge>
                      <Badge
                        variant="secondary"
                        className="rounded-full font-normal"
                      >
                        {actor.campaignIds.length} campaigns
                      </Badge>
                    </div>
                  </div>
                </div>
              </button>
            ))}
            {filteredActors.length === 0 ? (
              <p className="text-muted-foreground text-sm md:col-span-2">
                No actors match the search.
              </p>
            ) : null}
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
            Campaigns
          </h2>
          <div className="bg-card overflow-hidden rounded-lg border">
            <ul className="divide-y">
              {filteredCampaigns.map((campaign: ThreatCampaign) => {
                const actor = threatActorProfiles.find(
                  (item) => item.id === campaign.actorId,
                );
                return (
                  <li key={campaign.id} className="p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium">{campaign.name}</p>
                          <CampaignStatusBadge status={campaign.status} />
                        </div>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          {campaign.summary}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          Actor:{" "}
                          <button
                            type="button"
                            className="text-foreground underline-offset-2 hover:underline"
                            onClick={() =>
                              actor ? setSelectedId(actor.id) : undefined
                            }
                          >
                            {actor?.name ?? campaign.actorId}
                          </button>
                          {" · "}
                          {campaign.firstSeenLabel} – {campaign.lastSeenLabel}
                        </p>
                      </div>
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className={cn("shrink-0", mutedControlClassName)}
                      >
                        <Link
                          href={`/threat-intelligence?indicator=${campaign.indicatorIds[0] ?? ""}`}
                        >
                          View IOCs
                        </Link>
                      </Button>
                    </div>
                  </li>
                );
              })}
              {filteredCampaigns.length === 0 ? (
                <li className="text-muted-foreground p-6 text-center text-sm">
                  No campaigns match the search.
                </li>
              ) : null}
            </ul>
          </div>
        </section>
      </ModuleShell>

      <ActorDetailSheet
        actor={selected}
        open={Boolean(selectedId)}
        onOpenChange={(open) => {
          if (!open) setSelectedId(null);
        }}
      />
    </>
  );
}
