"use client";

import Link from "next/link";
import {
  Crosshair,
  ExternalLink,
  Fingerprint,
  Radar,
  Search,
} from "lucide-react";
import { useDeferredValue, useMemo, useState } from "react";

import { ListPagination, paginateItems } from "@/components/list-pagination";
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
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

import {
  type Indicator,
  type IndicatorStatus,
  type IndicatorType,
  filterIndicators,
  getActorById,
  getHuntById,
  getIndicatorStats,
  indicatorStatuses,
  indicatorStatusLabels,
  indicatorTypes,
  indicatorTypeLabels,
  resolveIndicatorAlerts,
} from "./threat-shared-data";
import { useThreatSession } from "./threat-session";
import {
  ConfidenceBadge,
  IndicatorStatusBadge,
  IndicatorTypeBadge,
  SeverityBadge,
  SheetDetailRow,
  mutedControlClassName,
} from "./threat-shared-primitives";

function StatsStrip({ indicators }: { indicators: Indicator[] }) {
  const stats = getIndicatorStats(indicators);
  return (
    <section className="border-border/70 border-b border-dashed pb-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4 xl:gap-0">
        {stats.map((stat, index) => (
          <section
            key={stat.key}
            className={cn(
              "space-y-2 py-2 sm:py-1",
              index > 0 && "xl:border-border/70 xl:border-l",
              index === 0 && "xl:pr-6",
              index > 0 && index < stats.length - 1 && "xl:px-6",
              index === stats.length - 1 && "xl:pl-6",
            )}
          >
            <p className="text-muted-foreground text-sm">{stat.title}</p>
            <p className="text-3xl leading-none font-semibold tracking-tight tabular-nums">
              {stat.value}
            </p>
            <span className="text-muted-foreground block text-sm">
              {stat.context}
            </span>
          </section>
        ))}
      </div>
    </section>
  );
}

function IndicatorDetailSheet({
  indicator,
  open,
  onOpenChange,
}: {
  indicator: Indicator | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!indicator) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="sm:max-w-md" />
      </Sheet>
    );
  }

  const actors = indicator.actorIds
    .map((id) => getActorById(id))
    .filter(Boolean);
  const hunts = indicator.relatedHuntIds
    .map((id) => getHuntById(id))
    .filter(Boolean);
  const alerts = resolveIndicatorAlerts(indicator);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 overflow-y-auto sm:max-w-md">
        <SheetHeader className="space-y-3 pb-4">
          <div className="flex items-start gap-3">
            <span className="bg-muted flex size-10 shrink-0 items-center justify-center rounded-lg border">
              <Radar className="text-muted-foreground size-4" />
            </span>
            <div className="min-w-0">
              <SheetTitle className="text-base leading-snug">
                {indicator.title}
              </SheetTitle>
              <SheetDescription className="mt-1 font-mono text-xs break-all">
                {indicator.value}
              </SheetDescription>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <SeverityBadge severity={indicator.severity} />
            <IndicatorTypeBadge type={indicator.type} />
            <IndicatorStatusBadge status={indicator.status} />
            <ConfidenceBadge confidence={indicator.confidence} />
          </div>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-5 pb-6">
          <section className="space-y-2.5">
            <h3 className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
              Indicator
            </h3>
            <SheetDetailRow label="ID">
              <span className="font-mono text-xs">{indicator.id}</span>
            </SheetDetailRow>
            <SheetDetailRow label="First seen">
              {indicator.firstSeenLabel}
            </SheetDetailRow>
            <SheetDetailRow label="Last seen">
              {indicator.lastSeenLabel}
            </SheetDetailRow>
            <SheetDetailRow label="Sources">
              {indicator.sources.join(", ")}
            </SheetDetailRow>
            {indicator.techniqueIds.length > 0 ? (
              <SheetDetailRow label="Techniques">
                {indicator.techniqueIds.join(", ")}
              </SheetDetailRow>
            ) : null}
            <p className="text-muted-foreground text-sm leading-relaxed">
              {indicator.notes}
            </p>
            {indicator.tags.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {indicator.tags.map((tag) => (
                  <span
                    key={tag}
                    className="border-border/70 bg-muted/40 text-muted-foreground inline-flex whitespace-nowrap rounded-md border px-1.5 py-0.5 text-[11px] font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            ) : null}
          </section>

          {actors.length > 0 ? (
            <section className="space-y-2.5">
              <h3 className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                Related actors
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
                          <p className="text-muted-foreground text-[11px]">
                            {actor.origin} · {actor.confidence} confidence
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

          {hunts.length > 0 ? (
            <section className="space-y-2.5">
              <h3 className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                Related hunts
              </h3>
              <ul className="space-y-2">
                {hunts.map((hunt) =>
                  hunt ? (
                    <li key={hunt.id}>
                      <Link
                        href={`/threat-hunting/hunts?hunt=${hunt.id}`}
                        className="hover:bg-muted/60 flex items-start gap-2 rounded-md border px-2.5 py-2 transition-colors"
                      >
                        <Crosshair className="text-muted-foreground mt-0.5 size-3.5 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium">{hunt.title}</p>
                          <p className="text-muted-foreground font-mono text-[11px]">
                            {hunt.id}
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

          {indicator.darkWebExposureIds.length > 0 ? (
            <section className="space-y-2.5">
              <h3 className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                Dark web source
              </h3>
              <Button
                asChild
                variant="outline"
                size="sm"
                className={cn("justify-start", mutedControlClassName)}
              >
                <Link
                  href={`/threat-intelligence/dark-web?tab=exposures&exposure=${indicator.darkWebExposureIds[0]}`}
                >
                  Open exposure {indicator.darkWebExposureIds[0]}
                  <ExternalLink className="ml-1.5 size-3" />
                </Link>
              </Button>
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
                <Link
                  href={`/threat-hunting/hunts?indicator=${indicator.id}`}
                >
                  <Crosshair className="mr-1.5 size-3.5" />
                  Start hunt from indicator
                </Link>
              </Button>
              {indicator.techniqueIds[0] ? (
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className={cn("justify-start", mutedControlClassName)}
                >
                  <Link href="/threat-hunting/analytics">
                    View related techniques
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

export function IndicatorsCenter({
  initialIndicatorId,
}: {
  initialIndicatorId?: string | null;
}) {
  const { indicators } = useThreatSession();
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const [typeFilters, setTypeFilters] = useState<IndicatorType[]>([]);
  const [statusFilters, setStatusFilters] = useState<IndicatorStatus[]>([]);
  const [activeOnly, setActiveOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedId, setSelectedId] = useState<string | null>(
    initialIndicatorId ?? null,
  );

  const filtered = useMemo(
    () =>
      filterIndicators(indicators, {
        query: deferredQuery,
        types: typeFilters,
        statuses: statusFilters,
        activeOnly,
      }),
    [indicators, deferredQuery, typeFilters, statusFilters, activeOnly],
  );

  const pageItems = useMemo(
    () => paginateItems(filtered, page, pageSize),
    [filtered, page, pageSize],
  );

  const selected =
    indicators.find((item) => item.id === selectedId) ?? null;

  const toggleType = (type: IndicatorType) => {
    setPage(1);
    setTypeFilters((current) =>
      current.includes(type)
        ? current.filter((item) => item !== type)
        : [...current, type],
    );
  };

  const toggleStatus = (status: IndicatorStatus) => {
    setPage(1);
    setStatusFilters((current) =>
      current.includes(status)
        ? current.filter((item) => item !== status)
        : [...current, status],
    );
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto p-4 md:p-6">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight">Indicators</h1>
        <p className="text-muted-foreground text-sm">
          IOC store spanning feeds, dark web, and actor campaigns — pivot into
          hunts and alerts.
        </p>
      </div>

      <StatsStrip indicators={indicators} />

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <InputGroup className="max-w-md">
          <InputGroupAddon>
            <Search className="size-4" />
          </InputGroupAddon>
          <InputGroupInput
            placeholder="Search value, ID, tag, technique…"
            value={query}
            onChange={(event) => {
              setPage(1);
              setQuery(event.target.value);
            }}
          />
        </InputGroup>

        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-sm">
            <Switch
              checked={activeOnly}
              onCheckedChange={(checked) => {
                setPage(1);
                setActiveOnly(checked);
              }}
            />
            Active only
          </label>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {indicatorTypes.map((type) => {
          const active = typeFilters.includes(type);
          return (
            <Button
              key={type}
              type="button"
              size="sm"
              variant={active ? "default" : "outline"}
              className={cn("h-7 rounded-md text-xs", !active && mutedControlClassName)}
              onClick={() => toggleType(type)}
            >
              {indicatorTypeLabels[type]}
            </Button>
          );
        })}
        <span className="bg-border mx-1 hidden h-7 w-px sm:block" />
        {indicatorStatuses.map((status) => {
          const active = statusFilters.includes(status);
          return (
            <Button
              key={status}
              type="button"
              size="sm"
              variant={active ? "default" : "outline"}
              className={cn("h-7 rounded-md text-xs", !active && mutedControlClassName)}
              onClick={() => toggleStatus(status)}
            >
              {indicatorStatusLabels[status]}
            </Button>
          );
        })}
      </div>

      <div className="bg-card overflow-hidden rounded-lg border">
        <Table className="table-fixed">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">ID</TableHead>
              <TableHead className="w-[90px]">Type</TableHead>
              <TableHead>Value</TableHead>
              <TableHead className="w-[100px]">Severity</TableHead>
              <TableHead className="w-[120px]">Status</TableHead>
              <TableHead className="hidden w-[100px] lg:table-cell">
                Confidence
              </TableHead>
              <TableHead className="hidden w-[110px] xl:table-cell">
                Last seen
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageItems.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-muted-foreground h-24 text-center"
                >
                  No indicators match the current filters.
                </TableCell>
              </TableRow>
            ) : (
              pageItems.map((item) => (
                <TableRow
                  key={item.id}
                  className="hover:bg-muted/40 cursor-pointer"
                  data-state={selectedId === item.id ? "selected" : undefined}
                  onClick={() => setSelectedId(item.id)}
                >
                  <TableCell className="font-mono text-xs">{item.id}</TableCell>
                  <TableCell>
                    <IndicatorTypeBadge type={item.type} />
                  </TableCell>
                  <TableCell>
                    <div className="min-w-0">
                      <p className="truncate font-mono text-xs">{item.value}</p>
                      <p className="text-muted-foreground truncate text-xs">
                        {item.title}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <SeverityBadge severity={item.severity} />
                  </TableCell>
                  <TableCell>
                    <IndicatorStatusBadge status={item.status} />
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <ConfidenceBadge confidence={item.confidence} />
                  </TableCell>
                  <TableCell className="text-muted-foreground hidden text-xs xl:table-cell">
                    {item.lastSeenLabel}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <div className="border-t px-3 py-2">
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
      </div>

      <IndicatorDetailSheet
        indicator={selected}
        open={Boolean(selectedId)}
        onOpenChange={(open) => {
          if (!open) setSelectedId(null);
        }}
      />
    </div>
  );
}
