"use client";

import { MapPin, Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

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
  critical: "bg-red-600",
  high: "bg-orange-500",
  medium: "bg-amber-500",
  low: "bg-blue-500",
};

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
      <div className="border-b px-4 py-3 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1.5">
            {(["all", "critical", "high", "medium", "low"] as const).map(
              (value) => (
                <Button
                  key={value}
                  size="sm"
                  variant={severityFilter === value ? "default" : "outline"}
                  className="h-7 capitalize"
                  onClick={() => setSeverityFilter(value)}
                >
                  {value}
                </Button>
              ),
            )}
          </div>
          <div className="flex flex-wrap gap-4 text-sm">
            <div>
              <p className="text-muted-foreground text-xs">Events</p>
              <p className="font-semibold tabular-nums">{stats.total}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Critical</p>
              <p className="font-semibold tabular-nums">{stats.critical}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">High</p>
              <p className="font-semibold tabular-nums">{stats.high}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Regions</p>
              <p className="font-semibold tabular-nums">{stats.regions}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Entities</p>
              <p className="font-semibold tabular-nums">{stats.entities}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid min-h-0 flex-1 lg:grid-cols-[1fr_320px]">
        <div className="relative min-h-[420px] border-b lg:border-r lg:border-b-0">
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
                className="bg-card max-w-xs rounded-lg border p-3 shadow-sm"
              >
                <div className="space-y-1">
                  <p className="text-sm font-medium">{selected.title}</p>
                  <p className="text-muted-foreground text-xs">
                    {selected.locationLabel}
                  </p>
                  <Badge variant="outline" className="capitalize">
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

        <aside className="overflow-y-auto p-4">
          <h2 className="text-muted-foreground mb-3 text-xs font-medium tracking-wide uppercase">
            Hotspots ({visibleEvents.length})
          </h2>
          <ul className="space-y-2">
            {visibleEvents.slice(0, 40).map((event) => (
              <li key={event.id}>
                <button
                  type="button"
                  onClick={() => {
                    setSelected(event);
                    setSheetOpen(true);
                  }}
                  className={cn(
                    "hover:bg-accent/50 w-full rounded-lg border px-3 py-2 text-left transition-colors",
                    selected?.id === event.id && "border-primary/40 bg-accent/30",
                  )}
                >
                  <div className="flex items-start gap-2">
                    <MapPin className="text-muted-foreground mt-0.5 size-3.5 shrink-0" />
                    <div className="min-w-0 space-y-1">
                      <p className="truncate text-sm font-medium">{event.title}</p>
                      <p className="text-muted-foreground truncate text-xs">
                        {event.locationLabel} · {event.entities.length} entities
                      </p>
                      <Badge
                        variant="outline"
                        className="capitalize text-xs"
                      >
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
              <div className="mt-6 space-y-4 px-1">
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {selected.summary}
                </p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs">Severity</p>
                    <p className="capitalize">{selected.severity}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Observed</p>
                    <p className="font-mono text-xs">
                      {new Date(selected.observedAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                {selected.entities.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                      Hunt entities
                    </p>
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
                    <Link href="/threat-hunting/analytics">Analytics graph</Link>
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
