"use client";

import {
  Crosshair,
  ExternalLink,
  Fingerprint,
  Play,
  Radar,
  Search,
} from "lucide-react";
import Link from "next/link";
import { useDeferredValue, useMemo, useState } from "react";

import { buildInvestigateHref } from "@/components/investigate/investigate-data";
import { ListPagination, paginateItems } from "@/components/list-pagination";
import {
  ModuleShell,
  ModuleToolbarActions,
  ModuleToolbarSearch,
} from "@/components/soc/module-shell";
import { StatsStrip } from "@/components/soc/stats-strip";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getTelemetrySource } from "@/lib/source-registry";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

import { getIndicatorFromSession, useThreatSession } from "./threat-session";
import {
  buildInvestigateQueryForHunt,
  defaultHuntSourceIds,
  filterHunts,
  getActorById,
  getHuntStats,
  type Hunt,
  type HuntOutcome,
  huntOutcomeLabels,
  type HuntRunResult,
  type HuntStatus,
  huntStatuses,
  huntStatusLabels,
  resolveHuntAlerts,
  resolveHuntIncidents,
} from "./threat-shared-data";
import {
  HuntOutcomeBadge,
  HuntStatusBadge,
  mutedControlClassName,
  SeverityBadge,
  SheetDetailRow,
} from "./threat-shared-primitives";

function HuntStatsStrip({ hunts }: { hunts: Hunt[] }) {
  return (
    <StatsStrip
      stats={getHuntStats(hunts).map((stat) => ({
        key: stat.key,
        title: stat.title,
        value: stat.value,
        context: stat.context,
      }))}
    />
  );
}

function formatRunTime(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function HuntDetailSheet({
  hunt,
  runResult,
  open,
  onOpenChange,
  onStart,
  onClose,
  onRun,
  running,
}: {
  hunt: Hunt | null;
  runResult: HuntRunResult | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStart: (hunt: Hunt) => void;
  onClose: (hunt: Hunt, outcome: HuntOutcome) => void;
  onRun: (hunt: Hunt) => void;
  running: boolean;
}) {
  if (!hunt) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="sm:max-w-md" />
      </Sheet>
    );
  }

  const actors = hunt.actorIds.map((id) => getActorById(id)).filter(Boolean);
  const indicators = hunt.indicatorIds
    .map((id) => getIndicatorFromSession(id))
    .filter(Boolean);
  const alerts = resolveHuntAlerts(hunt);
  const incidents = resolveHuntIncidents(hunt);
  const investigateQuery = buildInvestigateQueryForHunt(hunt);
  const sourceIds = defaultHuntSourceIds(hunt);
  const investigateHref = buildInvestigateHref(investigateQuery, sourceIds);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 overflow-y-auto sm:max-w-md">
        <SheetHeader className="space-y-3 pb-4">
          <div className="flex items-start gap-3">
            <span className="bg-muted flex size-10 shrink-0 items-center justify-center rounded-lg border">
              <Crosshair className="text-muted-foreground size-4" />
            </span>
            <div className="min-w-0">
              <SheetTitle className="text-base leading-snug">
                {hunt.title}
              </SheetTitle>
              <SheetDescription className="mt-1 font-mono text-xs">
                {hunt.id}
                {hunt.promotedFromDetectionId
                  ? ` · from ${hunt.promotedFromDetectionId}`
                  : ""}
              </SheetDescription>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <SeverityBadge severity={hunt.severity} />
            <HuntStatusBadge status={hunt.status} />
            {hunt.outcome ? <HuntOutcomeBadge outcome={hunt.outcome} /> : null}
          </div>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-5 pb-6">
          <section className="space-y-2">
            <h3 className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
              Hypothesis
            </h3>
            <p className="text-sm leading-relaxed">{hunt.hypothesis}</p>
            <SheetDetailRow label="Assignee">{hunt.assignee}</SheetDetailRow>
            <SheetDetailRow label="Created">{hunt.createdLabel}</SheetDetailRow>
            <SheetDetailRow label="Updated">{hunt.updatedLabel}</SheetDetailRow>
            <SheetDetailRow label="Techniques">
              {hunt.techniqueIds.join(", ") || "—"}
            </SheetDetailRow>
          </section>

          <section className="space-y-2">
            <h3 className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
              Hunt query · Heimdall QL
            </h3>
            <pre className="bg-muted/40 max-h-36 overflow-auto rounded-md border p-2.5 font-mono text-[10px] leading-relaxed whitespace-pre-wrap">
              {investigateQuery}
            </pre>
            <div className="flex flex-wrap gap-1.5">
              {sourceIds.map((id) => (
                <span
                  key={id}
                  className="bg-muted text-muted-foreground rounded-full border px-2 py-0.5 text-[10px]"
                >
                  {getTelemetrySource(id)?.shortName ?? id}
                </span>
              ))}
            </div>
          </section>

          {hunt.findings ? (
            <section className="space-y-2">
              <h3 className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                Findings
              </h3>
              <p className="text-sm leading-relaxed">{hunt.findings}</p>
            </section>
          ) : null}

          {runResult ? (
            <section className="space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                  Last run · {runResult.hitCount} hit
                  {runResult.hitCount === 1 ? "" : "s"}
                </h3>
                <span className="text-muted-foreground font-mono text-[10px]">
                  {formatRunTime(runResult.ranAt)}
                </span>
              </div>
              <div className="overflow-hidden rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Entity</TableHead>
                      <TableHead className="text-xs">Sev</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {runResult.hits.map((hit) => (
                      <TableRow key={hit.id}>
                        <TableCell className="max-w-[180px] truncate font-mono text-[11px]">
                          {hit.entity}
                        </TableCell>
                        <TableCell>
                          <SeverityBadge severity={hit.severity} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <Button asChild size="sm" className="w-full justify-start">
                <Link href={investigateHref}>
                  Open in Investigate
                  <ExternalLink className="ml-1.5 size-3" />
                </Link>
              </Button>
            </section>
          ) : null}

          {indicators.length > 0 ? (
            <section className="space-y-2.5">
              <h3 className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                Linked indicators
              </h3>
              <ul className="space-y-2">
                {indicators.map((indicator) =>
                  indicator ? (
                    <li key={indicator.id}>
                      <Link
                        href={`/threat-intelligence?indicator=${indicator.id}`}
                        className="hover:bg-muted/60 flex items-start gap-2 rounded-md border px-2.5 py-2 transition-colors"
                      >
                        <Radar className="text-muted-foreground mt-0.5 size-3.5 shrink-0" />
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

          {actors.length > 0 ? (
            <section className="space-y-2.5">
              <h3 className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                Actors
              </h3>
              <ul className="space-y-2">
                {actors.map((actor) =>
                  actor ? (
                    <li key={actor.id}>
                      <Link
                        href={`/threat-intelligence/actors?actor=${actor.id}`}
                        className="hover:bg-muted/60 flex items-start gap-2 rounded-md border px-2.5 py-2 transition-colors"
                      >
                        <Fingerprint className="text-muted-foreground mt-0.5 size-3.5 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium">{actor.name}</p>
                        </div>
                        <ExternalLink className="text-muted-foreground mt-0.5 size-3.5 shrink-0" />
                      </Link>
                    </li>
                  ) : null,
                )}
              </ul>
            </section>
          ) : null}

          {alerts.length > 0 ? (
            <section className="space-y-2.5">
              <h3 className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                Related alerts
              </h3>
              <ul className="space-y-2">
                {alerts.map((alert) => (
                  <li key={alert.id}>
                    <Link
                      href={`/alerts/${alert.id}`}
                      className="hover:bg-muted/60 flex items-start gap-2 rounded-md border px-2.5 py-2 transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <span className="font-mono text-xs">{alert.id}</span>
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
          ) : null}

          {incidents.length > 0 ? (
            <section className="space-y-2.5">
              <h3 className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                Related incidents
              </h3>
              <ul className="space-y-2">
                {incidents.map((incident) => (
                  <li key={incident.id}>
                    <Link
                      href={`/incidents/${incident.id}`}
                      className="hover:bg-muted/60 flex items-start gap-2 rounded-md border px-2.5 py-2 transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <span className="font-mono text-xs">{incident.id}</span>
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
          ) : null}

          <Separator />

          <section className="space-y-2.5">
            <h3 className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
              Actions
            </h3>
            <div className="flex flex-col gap-2">
              {hunt.status === "draft" ? (
                <Button
                  size="sm"
                  className="justify-start"
                  onClick={() => onStart(hunt)}
                >
                  Start hunt
                </Button>
              ) : null}
              {hunt.status !== "closed" ? (
                <Button
                  size="sm"
                  variant="outline"
                  className={cn("justify-start", mutedControlClassName)}
                  disabled={running}
                  onClick={() => onRun(hunt)}
                >
                  <Play className="mr-1.5 size-3.5" />
                  {running ? "Running…" : "Run hunt"}
                </Button>
              ) : null}
              {hunt.status === "running" ? (
                <>
                  {(
                    ["confirmed", "not_found", "inconclusive"] as HuntOutcome[]
                  ).map((outcome) => (
                    <Button
                      key={outcome}
                      size="sm"
                      variant="outline"
                      className={cn("justify-start", mutedControlClassName)}
                      onClick={() => onClose(hunt, outcome)}
                    >
                      Close · {huntOutcomeLabels[outcome]}
                    </Button>
                  ))}
                </>
              ) : null}
              <Button
                asChild
                variant="outline"
                size="sm"
                className={cn("justify-start", mutedControlClassName)}
              >
                <Link href={investigateHref}>
                  Open in Investigate
                  <ExternalLink className="ml-1.5 size-3" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="sm"
                className={cn("justify-start", mutedControlClassName)}
              >
                <Link href="/threat-hunting/analytics">
                  Open threat analytics
                  <ExternalLink className="ml-1.5 size-3" />
                </Link>
              </Button>
              {hunt.promotedFromDetectionId ? (
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className={cn("justify-start", mutedControlClassName)}
                >
                  <Link href="/threat-hunting/detections">
                    Open detections
                    <ExternalLink className="ml-1.5 size-3" />
                  </Link>
                </Button>
              ) : null}
            </div>
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function HuntLibraryCenter({
  initialHuntId,
  filterIndicatorId,
  filterActorId,
}: {
  initialHuntId?: string | null;
  filterIndicatorId?: string | null;
  filterActorId?: string | null;
}) {
  const { hunts, startHunt, closeHunt, runHunt, getHuntRun } =
    useThreatSession();
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const [statusFilters, setStatusFilters] = useState<HuntStatus[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [selectedId, setSelectedId] = useState<string | null>(
    initialHuntId ?? null,
  );
  const [runningId, setRunningId] = useState<string | null>(null);

  const baseHunts = useMemo(() => {
    let list = hunts;
    if (filterIndicatorId) {
      list = list.filter((hunt) =>
        hunt.indicatorIds.includes(filterIndicatorId),
      );
    }
    if (filterActorId) {
      list = list.filter((hunt) => hunt.actorIds.includes(filterActorId));
    }
    return list;
  }, [filterActorId, filterIndicatorId, hunts]);

  const filtered = useMemo(
    () =>
      filterHunts(baseHunts, {
        query: deferredQuery,
        statuses: statusFilters,
      }),
    [baseHunts, deferredQuery, statusFilters],
  );

  const pageItems = useMemo(
    () => paginateItems(filtered, page, pageSize),
    [filtered, page, pageSize],
  );

  const selected = hunts.find((hunt) => hunt.id === selectedId) ?? null;
  const runResult = selectedId ? (getHuntRun(selectedId) ?? null) : null;

  const toggleStatus = (status: HuntStatus) => {
    setPage(1);
    setStatusFilters((current) =>
      current.includes(status)
        ? current.filter((item) => item !== status)
        : [...current, status],
    );
  };

  return (
    <>
      <ModuleShell
        toolbar={
          <>
            <ModuleToolbarSearch>
              <InputGroup className="h-9 w-full lg:max-w-sm">
                <InputGroupAddon>
                  <Search className="size-4" />
                </InputGroupAddon>
                <InputGroupInput
                  placeholder="Search hunts, techniques, IOCs…"
                  value={query}
                  onChange={(event) => {
                    setPage(1);
                    setQuery(event.target.value);
                  }}
                />
              </InputGroup>
            </ModuleToolbarSearch>
            <ModuleToolbarActions>
              {huntStatuses.map((status) => {
                const active = statusFilters.includes(status);
                return (
                  <Button
                    key={status}
                    type="button"
                    size="sm"
                    variant={active ? "default" : "outline"}
                    className={cn(
                      "h-8 rounded-md text-xs",
                      !active && mutedControlClassName,
                    )}
                    onClick={() => toggleStatus(status)}
                  >
                    {huntStatusLabels[status]}
                  </Button>
                );
              })}
            </ModuleToolbarActions>
          </>
        }
      >
        <HuntStatsStrip hunts={hunts} />

        {(filterIndicatorId || filterActorId) && (
          <div className="bg-muted/40 flex flex-wrap items-center gap-2 rounded-md border px-3 py-2 text-sm">
            <span className="text-muted-foreground">Filtered by</span>
            {filterIndicatorId ? (
              <Link
                href={`/threat-intelligence?indicator=${filterIndicatorId}`}
                className="font-mono text-xs underline-offset-2 hover:underline"
              >
                {filterIndicatorId}
              </Link>
            ) : null}
            {filterActorId ? (
              <Link
                href={`/threat-intelligence/actors?actor=${filterActorId}`}
                className="underline-offset-2 hover:underline"
              >
                {getActorById(filterActorId)?.name ?? filterActorId}
              </Link>
            ) : null}
            <Button asChild variant="ghost" size="sm" className="ml-auto h-7">
              <Link href="/threat-hunting/hunts">Clear</Link>
            </Button>
          </div>
        )}

        <div className="bg-card overflow-hidden rounded-lg border">
          <Table className="table-fixed">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">ID</TableHead>
                <TableHead>Hunt</TableHead>
                <TableHead className="w-[100px]">Status</TableHead>
                <TableHead className="hidden w-[100px] md:table-cell">
                  Severity
                </TableHead>
                <TableHead className="hidden w-[120px] lg:table-cell">
                  Assignee
                </TableHead>
                <TableHead className="hidden w-[110px] xl:table-cell">
                  Updated
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageItems.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-muted-foreground h-24 text-center"
                  >
                    No hunts match the current filters.
                  </TableCell>
                </TableRow>
              ) : (
                pageItems.map((hunt) => (
                  <TableRow
                    key={hunt.id}
                    className="hover:bg-muted/40 cursor-pointer"
                    data-state={selectedId === hunt.id ? "selected" : undefined}
                    onClick={() => setSelectedId(hunt.id)}
                  >
                    <TableCell className="font-mono text-xs">{hunt.id}</TableCell>
                    <TableCell>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {hunt.title}
                        </p>
                        <p className="text-muted-foreground line-clamp-1 text-xs">
                          {hunt.hypothesis}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col items-start gap-1">
                        <HuntStatusBadge status={hunt.status} />
                        {hunt.outcome ? (
                          <HuntOutcomeBadge outcome={hunt.outcome} />
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <SeverityBadge severity={hunt.severity} />
                    </TableCell>
                    <TableCell className="text-muted-foreground hidden text-sm lg:table-cell">
                      {hunt.assignee}
                    </TableCell>
                    <TableCell className="text-muted-foreground hidden text-xs xl:table-cell">
                      {hunt.updatedLabel}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <ListPagination
            page={page}
            pageSize={pageSize}
            total={filtered.length}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPage(1);
              setPageSize(size);
            }}
          />
        </div>
      </ModuleShell>

      <HuntDetailSheet
        hunt={selected}
        runResult={runResult}
        open={Boolean(selectedId)}
        onOpenChange={(open) => {
          if (!open) setSelectedId(null);
        }}
        onStart={(hunt) => {
          const next = startHunt(hunt.id);
          if (!next) return;
          toast({
            title: "Hunt started",
            description: `${hunt.id} is now running.`,
          });
        }}
        onClose={(hunt, outcome) => {
          const next = closeHunt(hunt.id, outcome);
          if (!next) return;
          toast({
            title: "Hunt closed",
            description: `${hunt.id} closed as ${huntOutcomeLabels[outcome]}.`,
          });
        }}
        running={runningId === selectedId}
        onRun={(hunt) => {
          setRunningId(hunt.id);
          window.setTimeout(() => {
            const result = runHunt(hunt.id);
            setRunningId(null);
            if (!result) {
              toast({
                title: "Hunt run failed",
                description: "Hunt not found in session.",
                variant: "destructive",
              });
              return;
            }
            toast({
              title: "Hunt run complete",
              description: `${result.hitCount} hit${result.hitCount === 1 ? "" : "s"} persisted in session.`,
            });
          }, 360);
        }}
      />
    </>
  );
}
