"use client";

import {
  CheckIcon,
  ChevronRight,
  Download,
  ListFilter,
  Search,
  ShieldAlert,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";

import { appendAuditLog } from "@/components/audit/audit-log-data";
import { ListPagination } from "@/components/list-pagination";
import { currentProfile } from "@/components/profile/profile-data";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { downloadCsv } from "@/lib/download-csv";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

import {
  type FindingSort,
  findingSortLabels,
  formatCompact,
  vulnerabilities,
  type Vulnerability,
  vulnSeverities,
  type VulnSeverity,
  vulnSeverityLabels,
} from "./vulnerabilities-data";
import { VulnerabilitiesOverview } from "./vulnerabilities-overview";
import {
  getFindingsPresetForPersona,
  personaPresetChipActive,
  useVulnPersona,
  type VulnPersona,
  vulnPersonaLabels,
  vulnPersonas,
} from "./vulnerabilities-persona";
import {
  mutedControlClassName,
  PriorityBadge,
  SeverityBadge,
  tabTriggerClassName,
  ThreatBadge,
} from "./vulnerabilities-primitives";
import { queryWeaknesses } from "./vulnerabilities-query";
import {
  buildFindingsHref,
  defaultFindingsFilters,
  type FindingsListFilters,
  parseFindingsSearchParams,
} from "./vulnerabilities-url";
import { VulnerabilityDetailSheet } from "./vulnerability-detail-sheet";

export type VulnerabilitiesView = "overview" | "findings";

type FilterPanel = "severity" | "sort" | "scope";

function FilterPanelHeader({
  title,
  onBack,
}: {
  title: string;
  onBack: () => void;
}) {
  return (
    <div className="flex items-center border-b p-2">
      <Button
        variant="ghost"
        size="sm"
        className="h-7 gap-1 px-2 text-xs"
        onClick={onBack}
      >
        <ChevronRight className="size-3.5 rotate-180" />
        {title}
      </Button>
    </div>
  );
}

function FindingsFilterControl({
  severityFilters,
  sort,
  scope,
  activeFilterCount,
  onToggleSeverity,
  onSetSort,
  onSetScope,
  onClearFilters,
}: {
  severityFilters: VulnSeverity[];
  sort: FindingSort;
  scope: "endpoint" | "cloud" | "all";
  activeFilterCount: number;
  onToggleSeverity: (severity: VulnSeverity) => void;
  onSetSort: (sort: FindingSort) => void;
  onSetScope: (scope: "endpoint" | "cloud" | "all") => void;
  onClearFilters: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [panel, setPanel] = useState<FilterPanel | null>(null);
  const closePanel = () => setPanel(null);

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setPanel(null);
      }}
    >
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn("relative h-9 gap-1.5 px-2.5", mutedControlClassName)}
        >
          <ListFilter className="size-3.5" />
          Filter
          {activeFilterCount > 0 ? (
            <span className="bg-primary text-primary-foreground absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full text-xs font-semibold">
              {activeFilterCount}
            </span>
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0" align="end">
        {panel === null ? (
          <Command>
            <CommandList>
              <CommandGroup>
                <CommandItem
                  onSelect={() => setPanel("severity")}
                  className="flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <ShieldAlert className="size-4 text-zinc-500" />
                    Severity
                  </span>
                  <div className="flex items-center">
                    {severityFilters.length > 0 ? (
                      <span className="mr-1 text-xs text-zinc-500">
                        {severityFilters.length}
                      </span>
                    ) : null}
                    <ChevronRight className="size-4" />
                  </div>
                </CommandItem>
                <CommandItem
                  onSelect={() => setPanel("scope")}
                  className="flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <ListFilter className="size-4 text-zinc-500" />
                    Scope
                  </span>
                  <div className="flex items-center">
                    {scope !== "all" ? (
                      <span className="mr-1 text-xs text-zinc-500 capitalize">
                        {scope}
                      </span>
                    ) : null}
                    <ChevronRight className="size-4" />
                  </div>
                </CommandItem>
                <CommandItem
                  onSelect={() => setPanel("sort")}
                  className="flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <ListFilter className="size-4 text-zinc-500" />
                    Sort
                  </span>
                  <ChevronRight className="size-4" />
                </CommandItem>
              </CommandGroup>
              {activeFilterCount > 0 ? (
                <>
                  <CommandSeparator />
                  <CommandGroup>
                    <CommandItem
                      onSelect={() => {
                        onClearFilters();
                        setOpen(false);
                      }}
                      className="text-destructive"
                    >
                      Clear filters
                    </CommandItem>
                  </CommandGroup>
                </>
              ) : null}
            </CommandList>
          </Command>
        ) : null}

        {panel === "severity" ? (
          <div>
            <FilterPanelHeader title="Severity" onBack={closePanel} />
            <Command>
              <CommandList>
                <CommandGroup>
                  {vulnSeverities.map((severity) => {
                    const checked = severityFilters.includes(severity);
                    return (
                      <CommandItem
                        key={severity}
                        onSelect={() => onToggleSeverity(severity)}
                        className="justify-between"
                      >
                        {vulnSeverityLabels[severity]}
                        {checked ? <CheckIcon className="size-4" /> : null}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </CommandList>
            </Command>
          </div>
        ) : null}

        {panel === "scope" ? (
          <div>
            <FilterPanelHeader title="Scope" onBack={closePanel} />
            <Command>
              <CommandList>
                <CommandGroup>
                  {(
                    [
                      ["all", "All scopes"],
                      ["endpoint", "Endpoint"],
                      ["cloud", "Cloud"],
                    ] as const
                  ).map(([value, label]) => (
                    <CommandItem
                      key={value}
                      onSelect={() => {
                        onSetScope(value);
                        closePanel();
                      }}
                      className="justify-between"
                    >
                      {label}
                      {scope === value ? <CheckIcon className="size-4" /> : null}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </div>
        ) : null}

        {panel === "sort" ? (
          <div>
            <FilterPanelHeader title="Sort" onBack={closePanel} />
            <Command>
              <CommandList>
                <CommandGroup>
                  {(Object.keys(findingSortLabels) as FindingSort[]).map(
                    (option) => (
                      <CommandItem
                        key={option}
                        onSelect={() => {
                          onSetSort(option);
                          closePanel();
                        }}
                        className="justify-between"
                      >
                        {findingSortLabels[option]}
                        {sort === option ? (
                          <CheckIcon className="size-4" />
                        ) : null}
                      </CommandItem>
                    ),
                  )}
                </CommandGroup>
              </CommandList>
            </Command>
          </div>
        ) : null}
      </PopoverContent>
    </Popover>
  );
}

function FindingRow({
  vulnerability: v,
  onOpen,
}: {
  vulnerability: Vulnerability;
  onOpen: () => void;
}) {
  return (
    <TableRow className="cursor-pointer" onClick={onOpen}>
      <TableCell>
        <PriorityBadge score={v.socPriority} />
      </TableCell>
      <TableCell>
        <button
          type="button"
          className="text-primary font-mono text-sm font-medium hover:underline"
          onClick={onOpen}
        >
          {v.cve}
        </button>
      </TableCell>
      <TableCell>
        <SeverityBadge severity={v.severity} />
      </TableCell>
      <TableCell className="max-w-[240px]">
        <span className="line-clamp-2 text-sm">{v.title}</span>
      </TableCell>
      <TableCell onClick={(e) => e.stopPropagation()}>
        {v.linkedAlertIds.length === 0 ? (
          <span className="text-muted-foreground text-xs">—</span>
        ) : (
          <div className="flex flex-wrap gap-1">
            {v.linkedAlertIds.map((id) => (
              <Link
                key={id}
                href={`/alerts/${id}`}
                className="text-primary font-mono text-xs hover:underline"
              >
                {id}
              </Link>
            ))}
          </div>
        )}
      </TableCell>
      <TableCell onClick={(e) => e.stopPropagation()}>
        {v.linkedIncidentIds.length === 0 ? (
          <span className="text-muted-foreground text-xs">—</span>
        ) : (
          <div className="flex flex-wrap gap-1">
            {v.linkedIncidentIds.map((id) => (
              <Link
                key={id}
                href={`/incidents/${id}`}
                className="text-primary font-mono text-xs hover:underline"
              >
                {id}
              </Link>
            ))}
          </div>
        )}
      </TableCell>
      <TableCell className="tabular-nums">
        {formatCompact(v.exposedDeviceCount)}
      </TableCell>
      <TableCell>
        <ThreatBadge threats={v.threats} />
      </TableCell>
    </TableRow>
  );
}

export function VulnerabilitiesCenter({ view }: { view: VulnerabilitiesView }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { persona } = useVulnPersona();

  const urlFilters = useMemo(
    () => parseFindingsSearchParams(searchParams),
    [searchParams],
  );
  const selectedFromUrl = searchParams.get("id");

  const [searchQuery, setSearchQuery] = useState(urlFilters.search);
  const [severityFilters, setSeverityFilters] = useState<VulnSeverity[]>(
    urlFilters.severities,
  );
  const [sort, setSort] = useState<FindingSort>(urlFilters.sort);
  const [exploitableOnly, setExploitableOnly] = useState(
    urlFilters.exploitableOnly,
  );
  const [zeroDayOnly, setZeroDayOnly] = useState(urlFilters.zeroDayOnly);
  const [withAlertsOnly, setWithAlertsOnly] = useState(
    urlFilters.withAlertsOnly,
  );
  const [withIncidentsOnly, setWithIncidentsOnly] = useState(
    urlFilters.withIncidentsOnly,
  );
  const [scope, setScope] = useState<FindingsListFilters["scope"]>(
    urlFilters.scope,
  );
  const [selectedId, setSelectedId] = useState<string | null>(selectedFromUrl);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const skipNextUrlSync = useRef(false);

  const deferredSearchQuery = useDeferredValue(searchQuery);

  useEffect(() => {
    if (view !== "findings") return;
    skipNextUrlSync.current = true;
    setSearchQuery(urlFilters.search);
    setSeverityFilters(urlFilters.severities);
    setSort(urlFilters.sort);
    setExploitableOnly(urlFilters.exploitableOnly);
    setZeroDayOnly(urlFilters.zeroDayOnly);
    setWithAlertsOnly(urlFilters.withAlertsOnly);
    setWithIncidentsOnly(urlFilters.withIncidentsOnly);
    setScope(urlFilters.scope);
    setSelectedId(selectedFromUrl);
  }, [urlFilters, selectedFromUrl, view]);

  const queryResult = useMemo(
    () =>
      queryWeaknesses(vulnerabilities, {
        page,
        pageSize,
        search: deferredSearchQuery,
        severities: severityFilters,
        exploitableOnly,
        zeroDayOnly,
        withAlertsOnly,
        withIncidentsOnly,
        scope,
        sort,
      }),
    [
      page,
      pageSize,
      deferredSearchQuery,
      severityFilters,
      exploitableOnly,
      zeroDayOnly,
      withAlertsOnly,
      withIncidentsOnly,
      scope,
      sort,
    ],
  );

  useEffect(() => {
    setPage(1);
  }, [
    deferredSearchQuery,
    pageSize,
    severityFilters,
    sort,
    exploitableOnly,
    zeroDayOnly,
    withAlertsOnly,
    withIncidentsOnly,
    scope,
  ]);

  useEffect(() => {
    if (queryResult.page !== page) {
      setPage(queryResult.page);
    }
  }, [page, queryResult.page]);

  useEffect(() => {
    if (view !== "findings") return;
    if (skipNextUrlSync.current) {
      skipNextUrlSync.current = false;
      return;
    }

    const nextHref = buildFindingsHref(
      {
        search: deferredSearchQuery,
        severities: severityFilters,
        exploitableOnly,
        zeroDayOnly,
        withAlertsOnly,
        withIncidentsOnly,
        scope,
        sort,
      },
      selectedId ?? undefined,
    );
    const currentHref = buildFindingsHref(
      parseFindingsSearchParams(searchParams),
      searchParams.get("id") ?? undefined,
    );
    if (nextHref !== currentHref) {
      router.replace(nextHref, { scroll: false });
    }
  }, [
    view,
    deferredSearchQuery,
    severityFilters,
    exploitableOnly,
    zeroDayOnly,
    withAlertsOnly,
    withIncidentsOnly,
    scope,
    sort,
    selectedId,
    router,
    searchParams,
  ]);

  const activeFilterCount =
    severityFilters.length +
    (sort === defaultFindingsFilters.sort ? 0 : 1) +
    (scope === "all" ? 0 : 1) +
    (exploitableOnly ? 1 : 0) +
    (zeroDayOnly ? 1 : 0) +
    (withAlertsOnly ? 1 : 0) +
    (withIncidentsOnly ? 1 : 0);

  const currentFilters: FindingsListFilters = {
    search: deferredSearchQuery,
    severities: severityFilters,
    exploitableOnly,
    zeroDayOnly,
    withAlertsOnly,
    withIncidentsOnly,
    scope,
    sort,
  };

  const resetFilters = () => {
    setSeverityFilters([]);
    setSort("priority-desc");
    setExploitableOnly(false);
    setZeroDayOnly(false);
    setWithAlertsOnly(false);
    setWithIncidentsOnly(false);
    setScope("all");
    setSearchQuery("");
  };

  const applyPersonaPreset = (p: VulnPersona) => {
    const preset = getFindingsPresetForPersona(p);
    setSeverityFilters([]);
    setSearchQuery("");
    setScope("all");
    setExploitableOnly(Boolean(preset.exploitableOnly));
    setZeroDayOnly(Boolean(preset.zeroDayOnly));
    setWithAlertsOnly(Boolean(preset.withAlertsOnly));
    setWithIncidentsOnly(Boolean(preset.withIncidentsOnly));
    setSort(preset.sort ?? "priority-desc");
  };

  const toggleSeverityFilter = (severity: VulnSeverity) => {
    setSeverityFilters((current) =>
      current.includes(severity)
        ? current.filter((item) => item !== severity)
        : [...current, severity],
    );
  };

  const selected =
    queryResult.items.find((v) => v.id === selectedId) ??
    vulnerabilities.find((v) => v.id === selectedId) ??
    null;

  return (
    <main
      id="main-content"
      className="bg-background flex min-h-0 flex-1 flex-col overflow-hidden"
    >
      {view === "findings" ? (
        <div className="bg-background shrink-0 border-b">
          <div className="flex flex-col gap-2 px-4 py-3 sm:px-6 lg:min-h-14 lg:flex-row lg:items-center lg:justify-between lg:gap-4 lg:py-2">
            <div className="min-w-0 flex-1">
              <InputGroup className="h-9 w-full lg:max-w-sm">
                <InputGroupAddon>
                  <Search />
                </InputGroupAddon>
                <InputGroupInput
                  value={searchQuery}
                  placeholder="Search CVEs, titles, CWE…"
                  onChange={(event) => setSearchQuery(event.target.value)}
                />
              </InputGroup>
            </div>

            <div className="flex min-w-0 flex-wrap items-center gap-2 lg:justify-end">
              <div className="flex flex-wrap items-center gap-1">
                {vulnPersonas
                  .filter((p) => p !== "ciso")
                  .map((p) => {
                    const active = personaPresetChipActive(p, currentFilters);
                    return (
                      <Button
                        key={p}
                        type="button"
                        variant={active ? "default" : "outline"}
                        size="sm"
                        className={cn(
                          "h-8 px-2.5 text-xs",
                          !active && mutedControlClassName,
                          p === persona && !active && "ring-foreground/20 ring-1",
                        )}
                        onClick={() => applyPersonaPreset(p)}
                      >
                        {vulnPersonaLabels[p].replace(" Analyst", "")}
                      </Button>
                    );
                  })}
              </div>

              <label className="border-border bg-background hover:bg-accent flex h-9 cursor-pointer items-center gap-2 rounded-md border px-2.5 text-sm">
                <Switch
                  checked={exploitableOnly}
                  onCheckedChange={setExploitableOnly}
                  aria-label="Exploitable only"
                />
                <span className="whitespace-nowrap">Exploitable</span>
              </label>

              <label className="border-border bg-background hover:bg-accent flex h-9 cursor-pointer items-center gap-2 rounded-md border px-2.5 text-sm">
                <Switch
                  checked={withAlertsOnly}
                  onCheckedChange={setWithAlertsOnly}
                  aria-label="Linked alerts only"
                />
                <span className="whitespace-nowrap">Linked alerts</span>
              </label>

              <label className="border-border bg-background hover:bg-accent flex h-9 cursor-pointer items-center gap-2 rounded-md border px-2.5 text-sm">
                <Switch
                  checked={zeroDayOnly}
                  onCheckedChange={setZeroDayOnly}
                  aria-label="Zero-day only"
                />
                <span className="whitespace-nowrap">Zero-day</span>
              </label>

              <label className="border-border bg-background hover:bg-accent flex h-9 cursor-pointer items-center gap-2 rounded-md border px-2.5 text-sm">
                <Switch
                  checked={withIncidentsOnly}
                  onCheckedChange={setWithIncidentsOnly}
                  aria-label="Linked incidents only"
                />
                <span className="whitespace-nowrap">Incidents</span>
              </label>

              <FindingsFilterControl
                severityFilters={severityFilters}
                sort={sort}
                scope={scope}
                activeFilterCount={activeFilterCount}
                onToggleSeverity={toggleSeverityFilter}
                onSetSort={setSort}
                onSetScope={setScope}
                onClearFilters={resetFilters}
              />

              <Button
                size="sm"
                className="h-9 gap-1.5"
                onClick={() => {
                  const exportResult = queryWeaknesses(vulnerabilities, {
                    page: 1,
                    pageSize: Math.max(queryResult.total, 1),
                    search: deferredSearchQuery,
                    severities: severityFilters,
                    exploitableOnly,
                    zeroDayOnly,
                    withAlertsOnly,
                    withIncidentsOnly,
                    scope,
                    sort,
                  });
                  downloadCsv({
                    filename: `heimdall-vulnerabilities-${new Date().toISOString().slice(0, 10)}.csv`,
                    headers: [
                      "id",
                      "cve",
                      "title",
                      "severity",
                      "cvss",
                      "epss",
                      "exploitable",
                      "exposed_devices",
                      "scope",
                      "soc_priority",
                    ],
                    rows: exportResult.items.map((finding) => [
                      finding.id,
                      finding.cve,
                      finding.title,
                      finding.severity,
                      finding.cvss,
                      finding.epss,
                      finding.exploitable ? "yes" : "no",
                      finding.exposedDeviceCount,
                      finding.scope,
                      finding.socPriority,
                    ]),
                  });
                  appendAuditLog({
                    actorId: currentProfile.id,
                    actorName: currentProfile.name,
                    action: "export.vulnerabilities_csv",
                    targetType: "export",
                    targetId: "vulnerabilities",
                    detail: `Exported ${exportResult.items.length} findings`,
                  });
                  toast({
                    title: "Export downloaded",
                    description: `${exportResult.items.length.toLocaleString("en-US")} findings saved as CSV.`,
                  });
                }}
              >
                <Download className="size-3.5" />
                <span className="hidden sm:inline">Export</span>
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6">
        <div className="mx-auto flex w-full flex-col gap-4">
          <Tabs
            value={view}
            onValueChange={(value) =>
              router.push(
                value === "overview"
                  ? "/vulnerabilities"
                  : "/vulnerabilities/findings",
              )
            }
            className="flex flex-col gap-4"
          >
            <div className="overflow-x-auto border-b">
              <TabsList className="inline-flex h-auto min-w-max justify-start gap-7 rounded-none bg-transparent p-0 sm:gap-8">
                <TabsTrigger value="overview" className={tabTriggerClassName}>
                  Overview
                </TabsTrigger>
                <TabsTrigger value="findings" className={tabTriggerClassName}>
                  Findings
                  <span className="bg-muted text-muted-foreground rounded-md px-1.5 py-0.5 text-xs">
                    {queryResult.total.toLocaleString("en-US")}
                  </span>
                </TabsTrigger>
              </TabsList>
            </div>

            {view === "overview" ? (
              <VulnerabilitiesOverview />
            ) : (
              <div className="bg-card overflow-hidden rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Priority</TableHead>
                      <TableHead>CVE</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Linked alerts</TableHead>
                      <TableHead>Incidents</TableHead>
                      <TableHead>Exposed devices</TableHead>
                      <TableHead>Threats</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {queryResult.items.map((v) => (
                      <FindingRow
                        key={v.id}
                        vulnerability={v}
                        onOpen={() => setSelectedId(v.id)}
                      />
                    ))}
                    {queryResult.items.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={8}
                          className="text-muted-foreground h-24 text-center"
                        >
                          No findings match these filters.
                        </TableCell>
                      </TableRow>
                    ) : null}
                  </TableBody>
                </Table>
                <ListPagination
                  page={queryResult.page}
                  pageSize={pageSize}
                  total={queryResult.total}
                  onPageChange={setPage}
                  onPageSizeChange={(size) => {
                    setPageSize(size);
                    setPage(1);
                  }}
                />
              </div>
            )}
          </Tabs>
        </div>
      </div>

      <VulnerabilityDetailSheet
        vulnerability={selected}
        siblings={queryResult.items}
        onOpenChange={(open) => {
          if (!open) setSelectedId(null);
        }}
        onNavigate={(id) => setSelectedId(id)}
      />
    </main>
  );
}
