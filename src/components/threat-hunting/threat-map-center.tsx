"use client";

import { MapPin, Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { SegmentedControl } from "@/components/soc/segmented-control";
import {
  getThreatGeoStats,
  investigateHrefForEntity,
  investigateHrefForGeoEvent,
  type ThreatGeoEvent,
  threatGeoEvents,
} from "@/components/threat-hunting/threat-map-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Map,
  MapControls,
  MapMarker,
  MapPopup,
  MarkerContent,
} from "@/components/ui/map";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const severityColor: Record<ThreatGeoEvent["severity"], string> = {
  critical: "bg-severity-critical",
  high: "bg-severity-high",
  medium: "bg-severity-medium",
  low: "bg-severity-low",
};

const severityOptions = [
  { value: "all", label: "All" },
  { value: "critical", label: "Critical" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
] as const satisfies readonly {
  value: ThreatGeoEvent["severity"] | "all";
  label: string;
}[];

export function ThreatMapCenter() {
  const stats = getThreatGeoStats();
  const [selected, setSelected] = useState<ThreatGeoEvent | null>(
    threatGeoEvents[0] ?? null,
  );
  const [sheetOpen, setSheetOpen] = useState(false);
  const [severityFilter, setSeverityFilter] = useState<
    ThreatGeoEvent["severity"] | "all"
  >("all");

  const visibleEvents = useMemo(() => {
    if (severityFilter === "all") return threatGeoEvents;
    return threatGeoEvents.filter((e) => e.severity === severityFilter);
  }, [severityFilter]);

  const center = useMemo<[number, number]>(() => {
    if (!selected) return [20, 0];
    return [selected.longitude, selected.latitude];
  }, [selected]);

  return (
    <main
      id="main-content"
      className="bg-background flex min-h-0 flex-1 flex-col overflow-hidden"
    >
      <div className="bg-background border-separator px-gutter shrink-0 border-b py-2.5">
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
          <SegmentedControl
            aria-label="Severity"
            value={severityFilter}
            onChange={setSeverityFilter}
            options={severityOptions}
          />
          <dl className="no-scrollbar flex max-w-full gap-5 overflow-x-auto text-sm">
            <div className="shrink-0">
              <dt className="text-muted-foreground text-caption">Events</dt>
              <dd className="font-semibold tabular-nums">{stats.total}</dd>
            </div>
            <div className="shrink-0">
              <dt className="text-muted-foreground text-caption">Critical</dt>
              <dd className="font-semibold tabular-nums">{stats.critical}</dd>
            </div>
            <div className="shrink-0">
              <dt className="text-muted-foreground text-caption">High</dt>
              <dd className="font-semibold tabular-nums">{stats.high}</dd>
            </div>
            <div className="shrink-0">
              <dt className="text-muted-foreground text-caption">Regions</dt>
              <dd className="font-semibold tabular-nums">{stats.regions}</dd>
            </div>
            <div className="shrink-0">
              <dt className="text-muted-foreground text-caption">Entities</dt>
              <dd className="font-semibold tabular-nums">{stats.entities}</dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 overflow-y-auto lg:grid-cols-[minmax(0,1fr)_320px] lg:overflow-hidden">
        <div className="border-separator relative min-h-[360px] border-b sm:min-h-[420px] lg:border-r lg:border-b-0">
          <Map
            center={center}
            zoom={selected ? 3.2 : 1.4}
            className="absolute inset-0 h-full w-full"
          >
            {visibleEvents.map((event) => (
              <MapMarker
                key={event.id}
                longitude={event.longitude}
                latitude={event.latitude}
                onClick={() => {
                  setSelected(event);
                  setSheetOpen(true);
                }}
              >
                <MarkerContent>
                  <button
                    type="button"
                    className="relative flex size-5 items-center justify-center"
                    aria-label={event.title}
                  >
                    <span
                      className={cn(
                        "absolute size-5 animate-ping rounded-full opacity-30",
                        severityColor[event.severity],
                      )}
                    />
                    <span
                      className={cn(
                        "relative size-3 rounded-full border-2 border-white",
                        severityColor[event.severity],
                      )}
                    />
                  </button>
                </MarkerContent>
              </MapMarker>
            ))}

            {selected ? (
              <MapPopup
                longitude={selected.longitude}
                latitude={selected.latitude}
                offset={18}
                anchor="bottom"
                className="bg-card shadow-raised max-w-xs rounded-xl border p-3"
              >
                <div className="space-y-1">
                  <p className="text-sm font-medium">{selected.title}</p>
                  <p className="text-muted-foreground text-xs">
                    {selected.locationLabel}
                  </p>
                  <Badge variant={selected.severity} className="capitalize">
                    {selected.severity}
                  </Badge>
                </div>
              </MapPopup>
            ) : null}

            <MapControls
              position="bottom-left"
              showZoom
              showCompass={false}
              showLocate={false}
              showFullscreen={false}
            />
          </Map>
        </div>

        <aside className="bg-canvas p-gutter lg:overflow-y-auto lg:p-4">
          <h2 className="text-callout mb-2 font-semibold">
            Hotspots{" "}
            <span className="text-muted-foreground font-normal tabular-nums">
              {visibleEvents.length}
            </span>
          </h2>
          <ul className="bg-card shadow-card divide-separator divide-y overflow-hidden rounded-xl border">
            {visibleEvents.slice(0, 40).map((event) => (
              <li key={event.id}>
                <button
                  type="button"
                  onClick={() => {
                    setSelected(event);
                    setSheetOpen(true);
                  }}
                  aria-current={selected?.id === event.id ? "true" : undefined}
                  className={cn(
                    "hover:bg-muted/60 focus-visible:bg-muted/60 w-full px-3 py-2.5 text-left transition-colors outline-none focus-visible:shadow-[inset_3px_0_0_var(--ring)]",
                    selected?.id === event.id &&
                      "bg-primary/5 shadow-[inset_3px_0_0_var(--primary)]",
                  )}
                >
                  <div className="flex items-start gap-2">
                    <MapPin className="text-muted-foreground mt-0.5 size-3.5 shrink-0" />
                    <div className="min-w-0 space-y-1">
                      <p className="truncate text-sm font-medium">
                        {event.title}
                      </p>
                      <p className="text-muted-foreground truncate text-xs">
                        {event.locationLabel} · {event.entities.length} entities
                      </p>
                      <Badge variant={event.severity} className="capitalize">
                        {event.severity}
                      </Badge>
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </aside>
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-full sm:max-w-md">
          {selected ? (
            <>
              <SheetHeader>
                <SheetTitle>{selected.title}</SheetTitle>
                <SheetDescription>{selected.locationLabel}</SheetDescription>
              </SheetHeader>
              <div className="space-y-5">
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {selected.summary}
                </p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground text-caption">
                      Severity
                    </p>
                    <Badge
                      variant={selected.severity}
                      className="mt-1 capitalize"
                    >
                      {selected.severity}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-caption">
                      Observed
                    </p>
                    <p className="font-mono text-xs">
                      {new Date(selected.observedAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                {selected.entities.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-callout font-semibold">Hunt entities</p>
                    <div className="flex flex-wrap gap-1.5">
                      {selected.entities.map((entity) => (
                        <Button
                          key={`${entity.kind}-${entity.value}`}
                          size="sm"
                          variant="secondary"
                          className="h-7 gap-1 font-mono text-xs"
                          asChild
                        >
                          <Link href={investigateHrefForEntity(entity)}>
                            <Search className="size-3" />
                            <span className="text-muted-foreground lowercase">
                              {entity.kind}:
                            </span>
                            {entity.label ?? entity.value}
                          </Link>
                        </Button>
                      ))}
                    </div>
                  </div>
                ) : null}

                <div className="flex flex-wrap gap-2">
                  <Button size="sm" asChild>
                    <Link href={investigateHrefForGeoEvent(selected)}>
                      Investigate
                    </Link>
                  </Button>
                  {selected.alertId ? (
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/alerts/${selected.alertId}`}>
                        Open alert
                      </Link>
                    </Button>
                  ) : null}
                  {selected.indicatorId ? (
                    <Button size="sm" variant="outline" asChild>
                      <Link
                        href={`/threat-intelligence?indicator=${selected.indicatorId}`}
                      >
                        Open indicator
                      </Link>
                    </Button>
                  ) : null}
                  {selected.actorId ? (
                    <Button size="sm" variant="outline" asChild>
                      <Link
                        href={`/threat-intelligence/actors?actor=${selected.actorId}`}
                      >
                        Open actor
                      </Link>
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline" asChild>
                      <Link href="/threat-intelligence">Threat intel</Link>
                    </Button>
                  )}
                  <Button size="sm" variant="secondary" asChild>
                    <Link
                      href={`/threat-hunting/hunts?from=map&geo=${encodeURIComponent(selected.id)}&q=${encodeURIComponent(selected.title)}`}
                    >
                      Hunt from here
                    </Link>
                  </Button>
                  <Button size="sm" variant="outline" asChild>
                    <Link href="/threat-hunting/analytics">
                      Analytics graph
                    </Link>
                  </Button>
                </div>
              </div>
            </>
          ) : null}
        </SheetContent>
      </Sheet>
    </main>
  );
}
