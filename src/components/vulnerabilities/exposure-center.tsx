"use client";

import { Search } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useDeferredValue, useEffect, useMemo, useState } from "react";

import { ListPagination, paginateItems } from "@/components/list-pagination";
import { Badge } from "@/components/ui/badge";
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
  SheetFooter,
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
  type DeviceExposure,
  formatCompact,
  getDeviceExposureRollup,
  getVulnerability,
  type VulnStat,
} from "./vulnerabilities-data";
import { useVulnPersona } from "./vulnerabilities-persona";
import {
  PriorityBadge,
  SeverityBadge,
  SheetDetailRow,
  VulnStatsStrip,
} from "./vulnerabilities-primitives";
import {
  buildExposureHref,
  buildFindingsHref,
  parseExposureSearchParams,
} from "./vulnerabilities-url";

function deriveExposureStats(rows: DeviceExposure[]): VulnStat[] {
  const atRisk = rows.length;
  const withThreats = rows.filter((d) => d.hasActiveThreat).length;
  const internetFacing = rows.filter((d) => d.internetFacing).length;
  const highCriticality = rows.filter(
    (d) =>
      d.maxCriticality === "critical" ||
      d.maxCriticality === "high" ||
      d.riskScore >= 70,
  ).length;

  return [
    {
      key: "at-risk",
      title: "Devices at risk",
      value: String(atRisk),
      context: "With open findings",
      delta: 2.4,
      preferLower: true,
    },
    {
      key: "threats",
      title: "Active threats",
      value: String(withThreats),
      context: "Exploit or linked alerts",
      delta: 6.1,
      preferLower: true,
    },
    {
      key: "internet",
      title: "Internet-facing",
      value: String(internetFacing),
      context: "Tagged exposed assets",
      delta: 0.8,
      preferLower: true,
      href: buildExposureHref({ internetFacingOnly: true }),
    },
    {
      key: "critical",
      title: "High criticality",
      value: String(highCriticality),
      context: "Critical/high asset exposure",
      delta: 1.4,
      preferLower: true,
      href: buildExposureHref({ highCriticalityOnly: true }),
    },
  ];
}

function ExposureDetailSheet({
  device,
  onOpenChange,
}: {
  device: DeviceExposure | null;
  onOpenChange: (open: boolean) => void;
}) {
  const findings = useMemo(() => {
    if (!device) return [];
    return device.findingIds
      .map((id) => getVulnerability(id))
      .filter((v): v is NonNullable<typeof v> => Boolean(v));
  }, [device]);

  return (
    <Sheet open={device !== null} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 overflow-y-auto sm:max-w-md">
        {device ? (
          <>
            <SheetHeader className="space-y-2 pb-4">
              <SheetTitle className="truncate text-base">
                {device.hostname}
              </SheetTitle>
              <SheetDescription className="truncate text-xs">
                {device.platform} · {formatCompact(device.vulnerabilityCount)}{" "}
                findings
              </SheetDescription>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <PriorityBadge score={device.maxPriority} />
                <Badge variant="outline" className="rounded-full font-medium">
                  Risk {device.riskScore}
                </Badge>
                <SeverityBadge severity={device.maxCriticality} />
                {device.internetFacing ? (
                  <Badge
                    variant="outline"
                    className="border-amber-500/30 bg-amber-500/10 text-amber-700 rounded-full font-medium dark:text-amber-400"
                  >
                    Internet-facing
                  </Badge>
                ) : null}
                {device.hasActiveThreat ? (
                  <Badge
                    variant="outline"
                    className="border-destructive/30 bg-destructive/10 text-destructive rounded-full font-medium dark:text-red-400"
                  >
                    Active threat
                  </Badge>
                ) : null}
              </div>
            </SheetHeader>

            <div className="flex flex-1 flex-col gap-4">
              <section className="space-y-2.5">
                <h3 className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                  Summary
                </h3>
                <SheetDetailRow label="Findings">
                  {formatCompact(device.vulnerabilityCount)}
                </SheetDetailRow>
                <SheetDetailRow label="Max priority">
                  {device.maxPriority}
                </SheetDetailRow>
                <SheetDetailRow label="Linked alerts">
                  {formatCompact(device.linkedAlertCount)}
                </SheetDetailRow>
              </section>

              <Separator />

              <section className="space-y-2">
                <h3 className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                  Findings
                </h3>
                {findings.length === 0 ? (
                  <p className="text-muted-foreground text-sm">
                    No findings listed.
                  </p>
                ) : (
                  <ul className="divide-border/60 divide-y">
                    {findings.map((v) => (
                      <li
                        key={v.id}
                        className="flex items-center justify-between gap-3 py-2 first:pt-0 last:pb-0"
                      >
                        <div className="min-w-0">
                          <Link
                            href={buildFindingsHref({}, v.id)}
                            className="text-primary font-mono text-sm font-medium hover:underline"
                          >
                            {v.cve}
                          </Link>
                          <p className="text-muted-foreground truncate text-xs">
                            {v.title}
                          </p>
                        </div>
                        <PriorityBadge score={v.socPriority} />
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>

            <SheetFooter className="mt-6 border-t pt-4">
              <Link
                href={`/assets/devices?id=${encodeURIComponent(device.deviceId)}`}
                className="text-primary text-sm font-medium hover:underline"
              >
                Open device in Assets
              </Link>
            </SheetFooter>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

export function ExposureCenter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { persona } = useVulnPersona();
  const selectedFromUrl = searchParams.get("id");
  const urlFilters = useMemo(
    () => parseExposureSearchParams(searchParams),
    [searchParams],
  );

  const cisoDefaults = persona === "ciso";

  const [searchQuery, setSearchQuery] = useState(urlFilters.search);
  const [internetFacingOnly, setInternetFacingOnly] = useState(
    urlFilters.internetFacingOnly || cisoDefaults,
  );
  const [highCriticalityOnly, setHighCriticalityOnly] = useState(
    urlFilters.highCriticalityOnly || cisoDefaults,
  );
  const [selectedId, setSelectedId] = useState<string | null>(selectedFromUrl);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const deferredSearch = useDeferredValue(searchQuery);

  useEffect(() => {
    setSelectedId(selectedFromUrl);
    setSearchQuery(urlFilters.search);
    const hasInternet = searchParams.has("internet");
    const hasCritical = searchParams.has("critical");
    setInternetFacingOnly(
      hasInternet ? urlFilters.internetFacingOnly : cisoDefaults,
    );
    setHighCriticalityOnly(
      hasCritical ? urlFilters.highCriticalityOnly : cisoDefaults,
    );
  }, [selectedFromUrl, urlFilters, searchParams, cisoDefaults]);

  const rows = useMemo(() => getDeviceExposureRollup(), []);
  const stats = useMemo(() => deriveExposureStats(rows), [rows]);

  const filtered = useMemo(() => {
    const q = deferredSearch.trim().toLowerCase();
    return rows.filter((d) => {
      if (internetFacingOnly && !d.internetFacing) return false;
      if (
        highCriticalityOnly &&
        !(
          d.maxCriticality === "critical" ||
          d.maxCriticality === "high" ||
          d.riskScore >= 70
        )
      ) {
        return false;
      }
      if (!q) return true;
      return (
        d.hostname.toLowerCase().includes(q) ||
        d.platform.toLowerCase().includes(q) ||
        d.deviceId.toLowerCase().includes(q)
      );
    });
  }, [rows, deferredSearch, internetFacingOnly, highCriticalityOnly]);

  useEffect(() => {
    setPage(1);
  }, [deferredSearch, internetFacingOnly, highCriticalityOnly, pageSize]);

  useEffect(() => {
    const nextHref = buildExposureHref(
      {
        search: deferredSearch,
        internetFacingOnly,
        highCriticalityOnly,
      },
      selectedId ?? undefined,
    );
    const currentHref = buildExposureHref(
      parseExposureSearchParams(searchParams),
      searchParams.get("id") ?? undefined,
    );
    if (nextHref !== currentHref) {
      router.replace(nextHref, { scroll: false });
    }
  }, [
    deferredSearch,
    internetFacingOnly,
    highCriticalityOnly,
    selectedId,
    router,
    searchParams,
  ]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, pageCount);
  const pageItems = paginateItems(filtered, safePage, pageSize);

  const selected =
    rows.find((d) => d.deviceId === selectedId) ??
    filtered.find((d) => d.deviceId === selectedId) ??
    null;

  return (
    <main
      id="main-content"
      className="bg-background flex min-h-0 flex-1 flex-col overflow-hidden"
    >
      <div className="border-b">
        <div className="flex flex-col gap-2 px-4 py-3 sm:px-6 lg:min-h-14 lg:flex-row lg:items-center lg:justify-between lg:gap-4 lg:py-2">
          <div className="min-w-0 flex-1">
            <InputGroup className="h-9 w-full lg:max-w-sm">
              <InputGroupAddon>
                <Search />
              </InputGroupAddon>
              <InputGroupInput
                value={searchQuery}
                placeholder="Search hostnames, platforms…"
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </InputGroup>
          </div>
          <div className="flex min-w-0 flex-wrap items-center gap-2 lg:justify-end">
            <label className="border-border bg-background hover:bg-accent flex h-9 cursor-pointer items-center gap-2 rounded-md border px-2.5 text-sm">
              <Switch
                checked={internetFacingOnly}
                onCheckedChange={setInternetFacingOnly}
                aria-label="Internet-facing only"
              />
              <span className="whitespace-nowrap">Internet-facing</span>
            </label>
            <label className="border-border bg-background hover:bg-accent flex h-9 cursor-pointer items-center gap-2 rounded-md border px-2.5 text-sm">
              <Switch
                checked={highCriticalityOnly}
                onCheckedChange={setHighCriticalityOnly}
                aria-label="High criticality only"
              />
              <span className="whitespace-nowrap">High criticality</span>
            </label>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6">
        <div className="mx-auto flex w-full flex-col gap-4">
          <VulnStatsStrip stats={stats} columns={4} />

          <div className="bg-card overflow-hidden rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Hostname</TableHead>
                  <TableHead>Platform</TableHead>
                  <TableHead>Risk</TableHead>
                  <TableHead>Criticality</TableHead>
                  <TableHead>Findings</TableHead>
                  <TableHead>Max priority</TableHead>
                  <TableHead>Exposure</TableHead>
                  <TableHead>Threat</TableHead>
                  <TableHead>Linked alerts</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageItems.map((d) => (
                  <TableRow
                    key={d.deviceId}
                    className="cursor-pointer"
                    onClick={() => setSelectedId(d.deviceId)}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Link
                        href={`/assets/devices?id=${encodeURIComponent(d.deviceId)}`}
                        className="text-primary text-sm font-medium hover:underline"
                      >
                        {d.hostname}
                      </Link>
                    </TableCell>
                    <TableCell className="text-sm">{d.platform}</TableCell>
                    <TableCell>
                      <PriorityBadge score={d.riskScore} />
                    </TableCell>
                    <TableCell>
                      <SeverityBadge severity={d.maxCriticality} />
                    </TableCell>
                    <TableCell className="tabular-nums">
                      {formatCompact(d.vulnerabilityCount)}
                    </TableCell>
                    <TableCell>
                      <PriorityBadge score={d.maxPriority} />
                    </TableCell>
                    <TableCell>
                      {d.internetFacing ? (
                        <Badge
                          variant="outline"
                          className="border-amber-500/30 bg-amber-500/10 text-amber-700 rounded-full font-medium dark:text-amber-400"
                        >
                          Internet
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {d.hasActiveThreat ? (
                        <Badge
                          variant="outline"
                          className={cn(
                            "border-destructive/30 bg-destructive/10 text-destructive rounded-full font-medium dark:text-red-400",
                          )}
                        >
                          Active
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </TableCell>
                    <TableCell className="tabular-nums">
                      {formatCompact(d.linkedAlertCount)}
                    </TableCell>
                  </TableRow>
                ))}
                {pageItems.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      className="text-muted-foreground h-24 text-center"
                    >
                      No exposed devices match these filters.
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
            <ListPagination
              page={safePage}
              pageSize={pageSize}
              total={filtered.length}
              onPageChange={setPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setPage(1);
              }}
            />
          </div>
        </div>
      </div>

      <ExposureDetailSheet
        device={selected}
        onOpenChange={(open) => {
          if (!open) setSelectedId(null);
        }}
      />
    </main>
  );
}
