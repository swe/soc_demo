"use client";

import Link from "next/link";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Crosshair,
  ExternalLink,
} from "lucide-react";
import type { ReactNode } from "react";

import { SeverityBadge } from "@/components/alerts/alerts-primitives";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

import { getActorByGraphNodeId } from "@/components/threats/threat-shared-data";

import {
  type ThreatNodeDetail,
  threatNodeKindLabels,
  threatRelationLabels,
} from "./threat-analytics-data";

function MetaRow({
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

export function ThreatDetailSheet({
  detail,
  open,
  onOpenChange,
  onSelectNeighbor,
}: {
  detail: ThreatNodeDetail | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectNeighbor: (nodeId: string) => void;
}) {
  const node = detail?.node;
  const actorIntel =
    node?.kind === "actor" ? getActorByGraphNodeId(node.id) : null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 overflow-y-auto sm:max-w-md">
        {node && detail ? (
          <>
            <SheetHeader className="space-y-3 pb-4">
              <div className="flex items-start gap-3">
                <span className="bg-muted flex size-10 shrink-0 items-center justify-center rounded-lg border">
                  <Crosshair className="text-muted-foreground size-4" />
                </span>
                <div className="min-w-0">
                  <SheetTitle className="text-base leading-snug">
                    {node.label}
                  </SheetTitle>
                  <SheetDescription className="mt-1">
                    {node.subtitle ?? threatNodeKindLabels[node.kind]}
                  </SheetDescription>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="rounded-full font-normal">
                  {threatNodeKindLabels[node.kind]}
                </Badge>
                {node.severity ? (
                  <SeverityBadge severity={node.severity} />
                ) : null}
              </div>
            </SheetHeader>

            <div className="flex flex-1 flex-col gap-5">
              <section className="space-y-2">
                <h3 className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                  Overview
                </h3>
                <p className="text-sm leading-relaxed">{node.summary}</p>
              </section>

              <section className="space-y-2.5">
                <h3 className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                  Metadata
                </h3>
                {Object.entries(node.meta).map(([key, value]) => (
                  <MetaRow key={key} label={key}>
                    {value === null || value === undefined
                      ? "—"
                      : String(value)}
                  </MetaRow>
                ))}
              </section>

              {detail.neighbors.length > 0 ? (
                <>
                  <Separator />
                  <section className="space-y-2.5">
                    <h3 className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                      Graph neighbors
                    </h3>
                    <ul className="space-y-2">
                      {detail.neighbors.map((neighbor) => {
                        const Icon =
                          neighbor.direction === "out"
                            ? ArrowUpRight
                            : ArrowDownLeft;
                        return (
                          <li key={`${neighbor.direction}-${neighbor.node.id}`}>
                            <button
                              type="button"
                              onClick={() =>
                                onSelectNeighbor(neighbor.node.id)
                              }
                              className="hover:bg-muted/60 flex w-full items-start gap-2 rounded-md border px-2.5 py-2 text-left transition-colors"
                            >
                              <Icon
                                className={cn(
                                  "mt-0.5 size-3.5 shrink-0",
                                  neighbor.direction === "out"
                                    ? "text-sky-600 dark:text-sky-400"
                                    : "text-violet-600 dark:text-violet-400",
                                )}
                              />
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium">
                                  {neighbor.node.label}
                                </p>
                                <p className="text-muted-foreground text-[11px]">
                                  {threatRelationLabels[neighbor.relation]} ·{" "}
                                  {threatNodeKindLabels[neighbor.node.kind]}
                                </p>
                              </div>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </section>
                </>
              ) : null}

              {detail.alerts.length > 0 ? (
                <>
                  <Separator />
                  <section className="space-y-2.5">
                    <h3 className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                      Related alerts
                    </h3>
                    <ul className="space-y-2">
                      {detail.alerts.map((alert) => (
                        <li key={alert.id}>
                          <Link
                            href={`/alerts/${alert.id}`}
                            className="hover:bg-muted/60 flex items-start gap-2 rounded-md border px-2.5 py-2 transition-colors"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs">
                                  {alert.id}
                                </span>
                                <SeverityBadge severity={alert.severity} />
                              </div>
                              <p className="mt-1 line-clamp-2 text-xs">
                                {alert.title}
                              </p>
                            </div>
                            <ExternalLink className="text-muted-foreground mt-0.5 size-3.5 shrink-0" />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </section>
                </>
              ) : null}

              {detail.incidents.length > 0 ? (
                <>
                  <Separator />
                  <section className="space-y-2.5">
                    <h3 className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                      Related incidents
                    </h3>
                    <ul className="space-y-2">
                      {detail.incidents.map((incident) => (
                        <li key={incident.id}>
                          <Link
                            href={`/incidents/${incident.id}`}
                            className="hover:bg-muted/60 flex items-start gap-2 rounded-md border px-2.5 py-2 transition-colors"
                          >
                            <div className="min-w-0 flex-1">
                              <span className="font-mono text-xs">
                                {incident.id}
                              </span>
                              <p className="mt-1 line-clamp-2 text-xs">
                                {incident.title}
                              </p>
                            </div>
                            <ExternalLink className="text-muted-foreground mt-0.5 size-3.5 shrink-0" />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </section>
                </>
              ) : null}

              {detail.identity ? (
                <>
                  <Separator />
                  <section className="space-y-2.5">
                    <h3 className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                      Impacted identity
                    </h3>
                    <div className="rounded-md border px-3 py-2.5">
                      <p className="text-sm font-medium">
                        {detail.identity.displayName}
                      </p>
                      <p className="text-muted-foreground mt-0.5 font-mono text-xs">
                        {detail.identity.principal}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <Badge
                          variant="secondary"
                          className="rounded-full font-normal"
                        >
                          Risk {detail.identity.riskScore}
                        </Badge>
                        {detail.identity.privileged ? (
                          <Badge
                            variant="outline"
                            className="rounded-full border-amber-500/40 text-amber-700 dark:text-amber-400"
                          >
                            Privileged
                          </Badge>
                        ) : null}
                      </div>
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="mt-3 h-7 rounded-md text-xs"
                      >
                        <Link href="/assets/identities">
                          Open identities
                          <ExternalLink className="ml-1.5 size-3" />
                        </Link>
                      </Button>
                    </div>
                  </section>
                </>
              ) : null}

              {actorIntel ? (
                <>
                  <Separator />
                  <section className="space-y-2.5">
                    <h3 className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                      Threat intelligence
                    </h3>
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="h-8 w-full justify-start"
                    >
                      <Link
                        href={`/threat-intelligence/actors?actor=${actorIntel.id}`}
                      >
                        Open actor intel
                        <ExternalLink className="ml-1.5 size-3" />
                      </Link>
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="h-8 w-full justify-start"
                    >
                      <Link
                        href={`/threat-hunting/hunts?actor=${actorIntel.id}`}
                      >
                        Related hunts
                        <ExternalLink className="ml-1.5 size-3" />
                      </Link>
                    </Button>
                    {actorIntel.indicatorIds[0] ? (
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="h-8 w-full justify-start"
                      >
                        <Link
                          href={`/threat-intelligence?indicator=${actorIntel.indicatorIds[0]}`}
                        >
                          Linked indicators
                          <ExternalLink className="ml-1.5 size-3" />
                        </Link>
                      </Button>
                    ) : null}
                  </section>
                </>
              ) : null}

              {node.huntActions.length > 0 ? (
                <>
                  <Separator />
                  <section className="space-y-2.5">
                    <h3 className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                      Recommended hunt actions
                    </h3>
                    <ol className="list-decimal space-y-2 pl-4 text-sm">
                      {node.huntActions.map((action) => (
                        <li key={action} className="leading-relaxed">
                          {action}
                        </li>
                      ))}
                    </ol>
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="mt-1 h-8 w-full justify-start"
                    >
                      <Link href="/threat-hunting/hunts">
                        Open hunt library
                        <ExternalLink className="ml-1.5 size-3" />
                      </Link>
                    </Button>
                  </section>
                </>
              ) : null}
            </div>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
