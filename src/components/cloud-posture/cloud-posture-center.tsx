"use client";

import { Cloud, ExternalLink, Search, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useDeferredValue, useEffect, useMemo, useState } from "react";

import { ListPagination, paginateItems } from "@/components/list-pagination";
import { type FilterFacet, FilterMenu } from "@/components/soc/filter-menu";
import {
  ModuleShell,
  ModuleToolbarActions,
  ModuleToolbarSearch,
} from "@/components/soc/module-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
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
import { VulnStatsStrip } from "@/components/vulnerabilities/vulnerabilities-primitives";
import { cloudPostureApi } from "@/lib/mock-api/cloud-posture";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

import {
  type CloudFinding,
  type CloudFindingSeverity,
  type CloudFindingStatus,
  type CloudProvider,
  cloudProviderLabels,
  cloudProviderMeta,
  cloudProviders,
  cloudSeverities,
  cloudSeverityLabels,
  cloudStatuses,
  cloudStatusLabels,
  filterCloudFindings,
  getCloudPostureStats,
} from "./cloud-posture-data";
import { useCloudPostureSession } from "./cloud-posture-session";

const COLUMN_COUNT = 7;

const severityTones: Record<CloudFindingSeverity, string> = {
  critical: "border-destructive/30 bg-destructive/10 text-destructive-text",
  high: "border-severity-high/30 bg-severity-high/10 text-severity-high-text",
  medium: "border-warning/30 bg-warning/10 text-warning-text",
  low: "border-border bg-muted text-muted-foreground",
};

const statusTones: Record<CloudFindingStatus, string> = {
  open: "border-destructive/30 bg-destructive/10 text-destructive-text",
  in_progress: "border-info/30 bg-info/10 text-info-text",
  resolved: "border-success/30 bg-success/10 text-success-text",
  accepted: "border-border bg-muted text-muted-foreground",
};

/** Official cloud vendor mark — brand color never follows parent button/text. */
function ProviderIcon({
  provider,
  size = "sm",
  className,
}: {
  provider: CloudProvider;
  size?: "xs" | "sm" | "md";
  className?: string;
}) {
  const meta = cloudProviderMeta[provider];
  const Icon = meta.icon;
  const px = size === "md" ? 16 : size === "sm" ? 14 : 12;
  const boxSize =
    size === "md" ? "size-9" : size === "sm" ? "size-6" : "size-5";

  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-md border",
        meta.background,
        boxSize,
        className,
      )}
      aria-hidden
    >
      <Icon
        className={cn("shrink-0", meta.iconClassName)}
        style={{ color: meta.color, width: px, height: px }}
      />
    </span>
  );
}

function ProviderChip({
  provider,
  size = "sm",
}: {
  provider: CloudProvider;
  size?: "sm" | "md";
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <ProviderIcon provider={provider} size={size} />
      <span className={size === "md" ? "text-sm font-medium" : "text-xs"}>
        {cloudProviderLabels[provider]}
      </span>
    </span>
  );
}

function SeverityBadge({ severity }: { severity: CloudFindingSeverity }) {
  return (
    <Badge
      variant="outline"
      className={cn("rounded-full font-medium", severityTones[severity])}
    >
      {cloudSeverityLabels[severity]}
    </Badge>
  );
}

function StatusBadge({ status }: { status: CloudFindingStatus }) {
  return (
    <Badge
      variant="outline"
      className={cn("rounded-full font-medium", statusTones[status])}
    >
      {cloudStatusLabels[status]}
    </Badge>
  );
}

function FindingsFilterControl({
  providers,
  severities,
  statuses,
  activeFilterCount,
  onToggleProvider,
  onToggleSeverity,
  onToggleStatus,
  onClear,
}: {
  providers: CloudProvider[];
  severities: CloudFindingSeverity[];
  statuses: CloudFindingStatus[];
  activeFilterCount: number;
  onToggleProvider: (p: CloudProvider) => void;
  onToggleSeverity: (s: CloudFindingSeverity) => void;
  onToggleStatus: (s: CloudFindingStatus) => void;
  onClear: () => void;
}) {
  const facets: FilterFacet[] = [
    {
      id: "provider",
      label: "Provider",
      icon: Cloud,
      options: cloudProviders.map((value) => ({
        value,
        label: (
          <span className="flex items-center gap-2">
            <ProviderIcon provider={value} />
            {cloudProviderLabels[value]}
          </span>
        ),
      })),
      selected: providers,
      onToggle: (value) => onToggleProvider(value as CloudProvider),
    },
    {
      id: "severity",
      label: "Severity",
      icon: ShieldAlert,
      options: cloudSeverities.map((value) => ({
        value,
        label: cloudSeverityLabels[value],
      })),
      selected: severities,
      onToggle: (value) => onToggleSeverity(value as CloudFindingSeverity),
    },
    {
      id: "status",
      label: "Status",
      options: cloudStatuses.map((value) => ({
        value,
        label: cloudStatusLabels[value],
      })),
      selected: statuses,
      onToggle: (value) => onToggleStatus(value as CloudFindingStatus),
    },
  ];

  return (
    <FilterMenu
      facets={facets}
      activeCount={activeFilterCount}
      onClear={onClear}
    />
  );
}

function FindingDetailSheet({
  finding,
  onOpenChange,
  onStatusChange,
}: {
  finding: CloudFinding | null;
  onOpenChange: (open: boolean) => void;
  onStatusChange: (id: string, status: CloudFindingStatus) => void;
}) {
  const router = useRouter();
  const [opening, setOpening] = useState(false);

  const openIncident = async () => {
    if (!finding) return;
    setOpening(true);
    try {
      const { incident, receipt } = await cloudPostureApi.openIncident(finding);
      toast({
        title: "Incident opened",
        description: `${receipt.message}`,
      });
      onOpenChange(false);
      router.push(`/incidents/${incident.id}`);
    } catch (error) {
      toast({
        title: "Could not open incident",
        description:
          error instanceof Error ? error.message : "Unexpected error",
      });
    } finally {
      setOpening(false);
    }
  };

  return (
    <Sheet open={finding !== null} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 overflow-y-auto sm:max-w-md">
        {finding ? (
          <>
            <SheetHeader className="space-y-3 pb-4">
              <div className="min-w-0">
                <SheetTitle className="text-base">{finding.title}</SheetTitle>
                <SheetDescription className="mt-2 flex items-center gap-2">
                  <ProviderChip provider={finding.provider} />
                  <span className="text-muted-foreground font-mono text-xs">
                    {finding.id}
                  </span>
                </SheetDescription>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <SeverityBadge severity={finding.severity} />
                <StatusBadge status={finding.status} />
                <Badge variant="outline" className="rounded-full font-medium">
                  {finding.category}
                </Badge>
              </div>
            </SheetHeader>

            <div className="space-y-5 border-t py-4 text-sm">
              <p className="text-muted-foreground leading-relaxed">
                {finding.description}
              </p>

              <dl className="space-y-3">
                <div>
                  <dt className="text-muted-foreground text-xs">Resource</dt>
                  <dd className="mt-0.5 font-medium">{finding.resourceName}</dd>
                  <dd className="text-muted-foreground mt-0.5 truncate font-mono text-xs">
                    {finding.resourceArn}
                  </dd>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <dt className="text-muted-foreground text-xs">Region</dt>
                    <dd className="mt-0.5 font-mono text-xs">
                      {finding.region}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground text-xs">
                      First seen
                    </dt>
                    <dd className="mt-0.5 font-mono text-xs">
                      {finding.firstSeen.slice(0, 10)}
                    </dd>
                  </div>
                </div>
                {finding.linkedAssetId ? (
                  <div>
                    <dt className="text-muted-foreground text-xs">
                      Linked asset
                    </dt>
                    <dd className="mt-0.5">
                      <Link
                        href={`/assets/devices?q=${encodeURIComponent(finding.linkedAssetId)}`}
                        className="text-primary hover:underline"
                      >
                        {finding.linkedAssetId}
                      </Link>
                    </dd>
                  </div>
                ) : null}
              </dl>

              {finding.complianceControlIds &&
              finding.complianceControlIds.length > 0 ? (
                <div>
                  <h3 className="mb-2 text-xs font-medium tracking-wide uppercase">
                    Compliance
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {finding.complianceControlIds.map((code) => (
                      <Link
                        key={code}
                        href={`/compliance?q=${encodeURIComponent(code)}`}
                        className="border-border/70 bg-background hover:text-foreground text-muted-foreground rounded-md border px-2 py-1 font-mono text-xs transition-colors"
                      >
                        {code}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : null}

              <div>
                <h3 className="mb-2 text-xs font-medium tracking-wide uppercase">
                  Remediations
                </h3>
                <ol className="text-muted-foreground list-decimal space-y-1.5 pl-4 text-sm">
                  {finding.remediations.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
              </div>

              <div className="flex flex-col gap-2 pt-1">
                {finding.severity === "critical" &&
                (finding.status === "open" ||
                  finding.status === "in_progress") ? (
                  <Button
                    size="sm"
                    className="justify-start gap-1.5"
                    disabled={opening}
                    onClick={() => void openIncident()}
                  >
                    <ShieldAlert className="size-3.5" />
                    {opening ? "Opening…" : "Open incident"}
                  </Button>
                ) : null}
                {finding.investigateQuery ? (
                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="justify-start gap-1.5"
                  >
                    <Link
                      href={`/investigate?q=${encodeURIComponent(finding.investigateQuery)}`}
                    >
                      <ExternalLink className="size-3.5" />
                      Investigate
                    </Link>
                  </Button>
                ) : null}
                <div className="flex flex-wrap gap-2">
                  {finding.status !== "in_progress" ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onStatusChange(finding.id, "in_progress")}
                    >
                      Mark in progress
                    </Button>
                  ) : null}
                  {finding.status !== "accepted" ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onStatusChange(finding.id, "accepted")}
                    >
                      Accept risk
                    </Button>
                  ) : null}
                  {finding.status !== "resolved" ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onStatusChange(finding.id, "resolved")}
                    >
                      Resolve
                    </Button>
                  ) : null}
                </div>
              </div>
            </div>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

export function CloudPostureCenter() {
  const { findings, patchStatus, bulkPatchStatus } = useCloudPostureSession();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(() => searchParams.get("q") ?? "");
  const deferredQuery = useDeferredValue(query);
  const [providers, setProviders] = useState<CloudProvider[]>([]);
  const [severities, setSeverities] = useState<CloudFindingSeverity[]>(() => {
    const raw = searchParams.get("severity");
    if (!raw) return [];
    return raw
      .split(",")
      .filter((s): s is CloudFindingSeverity =>
        (cloudSeverities as string[]).includes(s),
      );
  });
  const [statuses, setStatuses] = useState<CloudFindingStatus[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [activeId, setActiveId] = useState<string | null>(() =>
    searchParams.get("id"),
  );
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  useEffect(() => {
    const q = searchParams.get("q");
    if (q != null) setQuery(q);
    const id = searchParams.get("id");
    if (id) setActiveId(id);
    const severity = searchParams.get("severity");
    if (severity) {
      setSeverities(
        severity
          .split(",")
          .filter((s): s is CloudFindingSeverity =>
            (cloudSeverities as string[]).includes(s),
          ),
      );
    }
  }, [searchParams]);

  const stats = useMemo(() => getCloudPostureStats(findings), [findings]);

  const filtered = useMemo(
    () =>
      filterCloudFindings(findings, {
        q: deferredQuery,
        providers,
        severities,
        statuses,
      }),
    [findings, deferredQuery, providers, severities, statuses],
  );

  useEffect(() => {
    setPage(1);
  }, [deferredQuery, providers, severities, statuses]);

  const pageItems = useMemo(
    () => paginateItems(filtered, page, pageSize),
    [filtered, page, pageSize],
  );

  const activeFinding = activeId
    ? (findings.find((f) => f.id === activeId) ?? null)
    : null;

  const activeFilterCount =
    providers.length + severities.length + statuses.length;

  const toggleId = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectedVisibleCount = pageItems.filter((f) =>
    selectedIds.has(f.id),
  ).length;
  const hasSelection = selectedVisibleCount > 0;
  const allPageSelected =
    pageItems.length > 0 && pageItems.every((f) => selectedIds.has(f.id));
  const partiallySelected = hasSelection && !allPageSelected;

  const toggleSelectAllPage = (checked: boolean | "indeterminate") => {
    const select = checked === true;
    setSelectedIds((prev) => {
      const next = new Set(prev);
      for (const item of pageItems) {
        if (select) next.add(item.id);
        else next.delete(item.id);
      }
      return next;
    });
  };

  const handleStatus = (id: string, status: CloudFindingStatus) => {
    patchStatus(id, status);
    toast({
      title: "Finding updated",
      description: `${id} marked ${cloudStatusLabels[status].toLowerCase()}`,
    });
  };

  const handleBulk = (status: CloudFindingStatus) => {
    const count = bulkPatchStatus(selectedIds, status);
    if (count === 0) {
      toast({ title: "No findings updated" });
      return;
    }
    setSelectedIds(new Set());
    toast({
      title: "Bulk update applied",
      description: `${count} findings marked ${cloudStatusLabels[status].toLowerCase()}`,
    });
  };

  return (
    <>
      <ModuleShell
        toolbar={
          <>
            <ModuleToolbarSearch>
              <InputGroup className="h-9 w-full lg:max-w-sm">
                <InputGroupAddon>
                  <Search className="text-muted-foreground size-4" />
                </InputGroupAddon>
                <InputGroupInput
                  placeholder="Search findings, resources, controls…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </InputGroup>
            </ModuleToolbarSearch>
            <ModuleToolbarActions>
              {cloudProviders.map((provider) => {
                const active = providers.includes(provider);
                return (
                  <Button
                    key={provider}
                    type="button"
                    size="sm"
                    variant="outline"
                    className={cn(
                      "h-8 gap-1.5 rounded-md text-xs",
                      active && "border-foreground/30 bg-muted/40",
                    )}
                    onClick={() =>
                      setProviders((prev) =>
                        prev.includes(provider)
                          ? prev.filter((x) => x !== provider)
                          : [...prev, provider],
                      )
                    }
                  >
                    <ProviderIcon provider={provider} size="xs" />
                    {cloudProviderLabels[provider]}
                  </Button>
                );
              })}
              <FindingsFilterControl
                providers={providers}
                severities={severities}
                statuses={statuses}
                activeFilterCount={activeFilterCount}
                onToggleProvider={(p) =>
                  setProviders((prev) =>
                    prev.includes(p)
                      ? prev.filter((x) => x !== p)
                      : [...prev, p],
                  )
                }
                onToggleSeverity={(s) =>
                  setSeverities((prev) =>
                    prev.includes(s)
                      ? prev.filter((x) => x !== s)
                      : [...prev, s],
                  )
                }
                onToggleStatus={(s) =>
                  setStatuses((prev) =>
                    prev.includes(s)
                      ? prev.filter((x) => x !== s)
                      : [...prev, s],
                  )
                }
                onClear={() => {
                  setProviders([]);
                  setSeverities([]);
                  setStatuses([]);
                }}
              />
            </ModuleToolbarActions>
          </>
        }
      >
        <VulnStatsStrip stats={stats} />

        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader>
              {hasSelection ? (
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-10 px-4">
                    <Checkbox
                      aria-label="Select all visible findings"
                      checked={
                        allPageSelected
                          ? true
                          : partiallySelected
                            ? "indeterminate"
                            : false
                      }
                      onCheckedChange={toggleSelectAllPage}
                    />
                  </TableHead>
                  <TableHead colSpan={COLUMN_COUNT - 1}>
                    <div className="flex flex-wrap items-center gap-2 py-0.5">
                      <span className="text-foreground text-sm font-medium">
                        {selectedVisibleCount} selected
                      </span>
                      <div className="ml-auto flex flex-wrap items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8"
                          onClick={() => handleBulk("in_progress")}
                        >
                          Mark in progress
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8"
                          onClick={() => handleBulk("accepted")}
                        >
                          Accept
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8"
                          onClick={() => setSelectedIds(new Set())}
                        >
                          Clear
                        </Button>
                      </div>
                    </div>
                  </TableHead>
                </TableRow>
              ) : (
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-10 px-4">
                    <Checkbox
                      checked={false}
                      onCheckedChange={toggleSelectAllPage}
                      aria-label="Select all visible findings"
                    />
                  </TableHead>
                  <TableHead>Finding</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Provider
                  </TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead className="hidden lg:table-cell">
                    Resource
                  </TableHead>
                  <TableHead className="hidden sm:table-cell">Region</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              )}
            </TableHeader>
            <TableBody>
              {pageItems.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-muted-foreground h-24 text-center text-sm"
                  >
                    No findings match the current filters.
                  </TableCell>
                </TableRow>
              ) : (
                pageItems.map((finding) => (
                  <TableRow
                    key={finding.id}
                    className="cursor-pointer"
                    data-state={
                      selectedIds.has(finding.id) ? "selected" : undefined
                    }
                    onClick={() => setActiveId(finding.id)}
                  >
                    <TableCell
                      onClick={(e) => e.stopPropagation()}
                      className="w-10"
                    >
                      <Checkbox
                        checked={selectedIds.has(finding.id)}
                        onCheckedChange={() => toggleId(finding.id)}
                        aria-label={`Select ${finding.id}`}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="min-w-0">
                        <p className="truncate font-medium">{finding.title}</p>
                        <p className="text-muted-foreground font-mono text-xs">
                          {finding.id} · {finding.category}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <ProviderChip provider={finding.provider} />
                    </TableCell>
                    <TableCell>
                      <SeverityBadge severity={finding.severity} />
                    </TableCell>
                    <TableCell className="hidden max-w-[220px] lg:table-cell">
                      <span className="truncate font-mono text-xs">
                        {finding.resourceName}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground hidden font-mono text-xs sm:table-cell">
                      {finding.region}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={finding.status} />
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
              setPageSize(size);
              setPage(1);
            }}
          />
        </div>
      </ModuleShell>

      <FindingDetailSheet
        finding={activeFinding}
        onOpenChange={(open) => {
          if (!open) setActiveId(null);
        }}
        onStatusChange={handleStatus}
      />
    </>
  );
}
