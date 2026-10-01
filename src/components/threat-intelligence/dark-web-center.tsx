"use client";

import {
  CheckIcon,
  ChevronRight,
  Download,
  EyeOff,
  KeyRound,
  ListFilter,
  MessageSquareWarning,
  Search,
  ShieldAlert,
  Skull,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";

import { appendAuditLog } from "@/components/audit/audit-log-data";
import { currentProfile } from "@/components/profile/profile-data";
import { type SocStat,StatsStrip } from "@/components/soc/stats-strip";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { downloadCsv } from "@/lib/download-csv";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

import {
  DarkWebBreachDetailSheet,
  DarkWebBreachesTable,
} from "./dark-web-breaches-table";
import {
  type DarkWebExposure,
  darkWebSources,
  exposureSeverities,
  type ExposureSeverity,
  exposureSeverityLabels,
  type ExposureSort,
  exposureSortLabels,
  type ExposureStatus,
  exposureStatuses,
  exposureStatusLabels,
  type ExposureType,
  exposureTypeLabels,
  exposureTypes,
  getBreachById,
  getDarkWebStats,
} from "./dark-web-data";
import { DarkWebDetailSheet } from "./dark-web-detail-sheet";
import { DarkWebExposuresTable } from "./dark-web-exposures-table";
import { DarkWebOverview } from "./dark-web-overview";
import {
  mutedControlClassName,
  tabTriggerClassName,
} from "./dark-web-primitives";
import { queryExposures } from "./dark-web-query";
import { useDarkWebSession } from "./dark-web-session";
import {
  buildDarkWebHref,
  type DarkWebTab,
  overviewFilterToHref,
  parseDarkWebSearchParams,
} from "./dark-web-url";
import { DarkWebWatchlist } from "./dark-web-watchlist";

type FilterPanel =
  | "type"
  | "severity"
  | "status"
  | "source"
  | "domain"
  | "sort";

function DarkWebStatsStrip({
  exposures,
  watchlist,
}: {
  exposures: Iterable<DarkWebExposure>;
  watchlist: Parameters<typeof getDarkWebStats>[1];
}) {
  const stats: SocStat[] = getDarkWebStats(exposures, watchlist).map(
    (stat) => ({
      key: stat.key,
      title: stat.title,
      value: stat.value,
      context: stat.context,
      delta: stat.delta,
      preferLower: stat.preferLower,
      hideDelta: stat.key === "watchlist",
    }),
  );

  return <StatsStrip stats={stats} />;
}

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

function ExposureFilterControl({
  typeFilters,
  severityFilters,
  statusFilters,
  sourceFilters,
  domainFilters,
  domainOptions,
  sort,
  activeFilterCount,
  onToggleType,
  onToggleSeverity,
  onToggleStatus,
  onToggleSource,
  onToggleDomain,
  onSetSort,
  onClearFilters,
}: {
  typeFilters: ExposureType[];
  severityFilters: ExposureSeverity[];
  statusFilters: ExposureStatus[];
  sourceFilters: string[];
  domainFilters: string[];
  domainOptions: string[];
  sort: ExposureSort;
  activeFilterCount: number;
  onToggleType: (type: ExposureType) => void;
  onToggleSeverity: (severity: ExposureSeverity) => void;
  onToggleStatus: (status: ExposureStatus) => void;
  onToggleSource: (source: string) => void;
  onToggleDomain: (domain: string) => void;
  onSetSort: (sort: ExposureSort) => void;
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
            <span className="bg-primary text-primary-foreground absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full text-[10px] font-semibold">
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
                  onSelect={() => setPanel("type")}
                  className="flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <KeyRound className="size-4 text-zinc-500" />
                    Type
                  </span>
                  <div className="flex items-center">
                    {typeFilters.length > 0 ? (
                      <span className="mr-1 text-xs text-zinc-500">
                        {typeFilters.length}
                      </span>
                    ) : null}
                    <ChevronRight className="size-4" />
                  </div>
                </CommandItem>
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
                  onSelect={() => setPanel("status")}
                  className="flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <ListFilter className="size-4 text-zinc-500" />
                    Status
                  </span>
                  <div className="flex items-center">
                    {statusFilters.length > 0 ? (
                      <span className="mr-1 text-xs text-zinc-500">
                        {statusFilters.length}
                      </span>
                    ) : null}
                    <ChevronRight className="size-4" />
                  </div>
                </CommandItem>
                <CommandItem
                  onSelect={() => setPanel("source")}
                  className="flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <EyeOff className="size-4 text-zinc-500" />
                    Source
                  </span>
                  <div className="flex items-center">
                    {sourceFilters.length > 0 ? (
                      <span className="mr-1 text-xs text-zinc-500">
                        {sourceFilters.length}
                      </span>
                    ) : null}
                    <ChevronRight className="size-4" />
                  </div>
                </CommandItem>
                <CommandItem
                  onSelect={() => setPanel("domain")}
                  className="flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <MessageSquareWarning className="size-4 text-zinc-500" />
                    Domain
                  </span>
                  <div className="flex items-center">
                    {domainFilters.length > 0 ? (
                      <span className="mr-1 text-xs text-zinc-500">
                        {domainFilters.length}
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
                    <Skull className="size-4 text-zinc-500" />
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

        {panel === "type" ? (
          <div>
            <FilterPanelHeader title="Type" onBack={closePanel} />
            <Command>
              <CommandList>
                <CommandGroup>
                  {exposureTypes.map((type) => {
                    const checked = typeFilters.includes(type);
                    return (
                      <CommandItem
                        key={type}
                        onSelect={() => onToggleType(type)}
                        className="justify-between"
                      >
                        {exposureTypeLabels[type]}
                        {checked ? <CheckIcon className="size-4" /> : null}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </CommandList>
            </Command>
          </div>
        ) : null}

        {panel === "severity" ? (
          <div>
            <FilterPanelHeader title="Severity" onBack={closePanel} />
            <Command>
              <CommandList>
                <CommandGroup>
                  {exposureSeverities.map((severity) => {
                    const checked = severityFilters.includes(severity);
                    return (
                      <CommandItem
                        key={severity}
                        onSelect={() => onToggleSeverity(severity)}
                        className="justify-between"
                      >
                        {exposureSeverityLabels[severity]}
                        {checked ? <CheckIcon className="size-4" /> : null}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </CommandList>
            </Command>
          </div>
        ) : null}

        {panel === "status" ? (
          <div>
            <FilterPanelHeader title="Status" onBack={closePanel} />
            <Command>
              <CommandList>
                <CommandGroup>
                  {exposureStatuses.map((status) => {
                    const checked = statusFilters.includes(status);
                    return (
                      <CommandItem
                        key={status}
                        onSelect={() => onToggleStatus(status)}
                        className="justify-between"
                      >
                        {exposureStatusLabels[status]}
                        {checked ? <CheckIcon className="size-4" /> : null}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </CommandList>
            </Command>
          </div>
        ) : null}

        {panel === "source" ? (
          <div>
            <FilterPanelHeader title="Source" onBack={closePanel} />
            <Command>
              <CommandList>
                <CommandGroup>
                  {darkWebSources.map((source) => {
                    const checked = sourceFilters.includes(source);
                    return (
                      <CommandItem
                        key={source}
                        onSelect={() => onToggleSource(source)}
                        className="justify-between"
                      >
                        {source}
                        {checked ? <CheckIcon className="size-4" /> : null}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </CommandList>
            </Command>
          </div>
        ) : null}

        {panel === "domain" ? (
          <div>
            <FilterPanelHeader title="Domain" onBack={closePanel} />
            <Command>
              <CommandList>
                <CommandGroup>
                  {domainOptions.map((domain) => {
                    const checked = domainFilters.includes(domain);
                    return (
                      <CommandItem
                        key={domain}
                        onSelect={() => onToggleDomain(domain)}
                        className="justify-between"
                      >
                        {domain}
                        {checked ? <CheckIcon className="size-4" /> : null}
                      </CommandItem>
                    );
                  })}
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
                  {(Object.keys(exposureSortLabels) as ExposureSort[]).map(
                    (option) => (
                      <CommandItem
                        key={option}
                        onSelect={() => {
                          onSetSort(option);
                          closePanel();
                        }}
                        className="justify-between"
                      >
                        {exposureSortLabels[option]}
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

function TypeChipBar({
  types,
  onToggle,
}: {
  types: ExposureType[];
  onToggle: (type: ExposureType) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {exposureTypes.map((type) => {
        const active = types.includes(type);
        return (
          <button
            key={type}
            type="button"
            onClick={() => onToggle(type)}
            className={cn(
              "rounded-md border px-2.5 py-1 text-xs font-medium transition-colors",
              active
                ? "border-foreground bg-foreground text-background"
                : "border-border bg-background text-muted-foreground hover:text-foreground",
            )}
          >
            {exposureTypeLabels[type]}
          </button>
        );
      })}
    </div>
  );
}

export function DarkWebCenter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    exposures,
    breaches,
    watchlist,
    getExposure,
    patchExposures,
    addWatchlistEntry,
    removeWatchlistEntry,
    setWatchlistStatus,
  } = useDarkWebSession();

  const urlFilters = useMemo(
    () => parseDarkWebSearchParams(searchParams),
    [searchParams],
  );

  const [tab, setTab] = useState<DarkWebTab>(urlFilters.tab);
  const [searchQuery, setSearchQuery] = useState(urlFilters.search);
  const [typeFilters, setTypeFilters] = useState<ExposureType[]>(
    urlFilters.types,
  );
  const [severityFilters, setSeverityFilters] = useState<ExposureSeverity[]>(
    urlFilters.severities,
  );
  const [statusFilters, setStatusFilters] = useState<ExposureStatus[]>(
    urlFilters.statuses,
  );
  const [sourceFilters, setSourceFilters] = useState<string[]>(
    urlFilters.sources,
  );
  const [domainFilters, setDomainFilters] = useState<string[]>(
    urlFilters.domains,
  );
  const [sort, setSort] = useState<ExposureSort>(urlFilters.sort);
  const [privilegedOnly, setPrivilegedOnly] = useState(
    urlFilters.privilegedOnly,
  );
  const [openOnly, setOpenOnly] = useState(urlFilters.openOnly);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [selectedExposureId, setSelectedExposureId] = useState<string | null>(
    urlFilters.exposureId,
  );
  const [selectedBreachId, setSelectedBreachId] = useState<string | null>(
    urlFilters.breachId,
  );
  const skipNextUrlSync = useRef(false);

  const deferredSearchQuery = useDeferredValue(searchQuery);

  const domainOptions = useMemo(() => {
    const set = new Set<string>();
    for (const item of exposures) {
      if (item.domain) set.add(item.domain);
    }
    return Array.from(set).sort();
  }, [exposures]);

  useEffect(() => {
    skipNextUrlSync.current = true;
    setTab(urlFilters.tab);
    setSearchQuery(urlFilters.search);
    setTypeFilters(urlFilters.types);
    setSeverityFilters(urlFilters.severities);
    setStatusFilters(urlFilters.statuses);
    setSourceFilters(urlFilters.sources);
    setDomainFilters(urlFilters.domains);
    setSort(urlFilters.sort);
    setPrivilegedOnly(urlFilters.privilegedOnly);
    setOpenOnly(urlFilters.openOnly);
    setSelectedExposureId(urlFilters.exposureId);
    setSelectedBreachId(urlFilters.breachId);
  }, [urlFilters]);

  const queryResult = useMemo(
    () =>
      queryExposures(exposures, {
        page,
        pageSize,
        search: deferredSearchQuery,
        types: typeFilters,
        severities: severityFilters,
        statuses: statusFilters,
        sources: sourceFilters,
        domains: domainFilters,
        privilegedOnly,
        openOnly,
        sort,
      }),
    [
      exposures,
      page,
      pageSize,
      deferredSearchQuery,
      typeFilters,
      severityFilters,
      statusFilters,
      sourceFilters,
      domainFilters,
      privilegedOnly,
      openOnly,
      sort,
    ],
  );

  useEffect(() => {
    setPage(1);
    setSelectedIds(new Set());
  }, [
    deferredSearchQuery,
    typeFilters,
    severityFilters,
    statusFilters,
    sourceFilters,
    domainFilters,
    privilegedOnly,
    openOnly,
    sort,
    pageSize,
  ]);

  useEffect(() => {
    if (queryResult.page !== page) setPage(queryResult.page);
  }, [page, queryResult.page]);

  useEffect(() => {
    if (skipNextUrlSync.current) {
      skipNextUrlSync.current = false;
      return;
    }

    const nextHref = buildDarkWebHref({
      tab,
      search: deferredSearchQuery,
      types: typeFilters,
      severities: severityFilters,
      statuses: statusFilters,
      sources: sourceFilters,
      domains: domainFilters,
      privilegedOnly,
      openOnly,
      sort,
      exposureId: selectedExposureId,
      breachId: selectedBreachId,
    });
    const currentHref = buildDarkWebHref(
      parseDarkWebSearchParams(searchParams),
    );
    if (nextHref !== currentHref) {
      router.replace(nextHref, { scroll: false });
    }
  }, [
    tab,
    deferredSearchQuery,
    typeFilters,
    severityFilters,
    statusFilters,
    sourceFilters,
    domainFilters,
    privilegedOnly,
    openOnly,
    sort,
    selectedExposureId,
    selectedBreachId,
    router,
    searchParams,
  ]);

  const activeFilterCount =
    typeFilters.length +
    severityFilters.length +
    statusFilters.length +
    sourceFilters.length +
    domainFilters.length +
    (sort === "newest" ? 0 : 1) +
    (privilegedOnly ? 1 : 0) +
    (openOnly ? 1 : 0);

  const resetFilters = () => {
    setTypeFilters([]);
    setSeverityFilters([]);
    setStatusFilters([]);
    setSourceFilters([]);
    setDomainFilters([]);
    setSort("newest");
    setPrivilegedOnly(false);
    setOpenOnly(false);
    setSearchQuery("");
  };

  const toggleInList = <T,>(list: T[], value: T) =>
    list.includes(value)
      ? list.filter((item) => item !== value)
      : [...list, value];

  const selectedExposure = selectedExposureId
    ? getExposure(selectedExposureId)
    : null;
  const selectedBreach = getBreachById(selectedBreachId ?? undefined);

  const openExposure = (id: string) => {
    setSelectedBreachId(null);
    setSelectedExposureId(id);
    if (tab !== "exposures" && tab !== "overview") setTab("exposures");
  };

  const openBreach = (id: string) => {
    setSelectedExposureId(null);
    setSelectedBreachId(id);
    setTab("breaches");
  };

  const toggleSelectAllPage = () => {
    setSelectedIds((current) => {
      const next = new Set(current);
      const allSelected = queryResult.items.every((item) => next.has(item.id));
      if (allSelected) {
        for (const item of queryResult.items) next.delete(item.id);
      } else {
        for (const item of queryResult.items) next.add(item.id);
      }
      return next;
    });
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const bulkSetStatus = (status: ExposureStatus) => {
    if (selectedIds.size === 0) return;
    patchExposures(selectedIds, { status });
    toast({
      title: "Status updated",
      description: `${selectedIds.size} exposures → ${exposureStatusLabels[status]}.`,
    });
    setSelectedIds(new Set());
  };

  return (
    <main
      id="main-content"
      className="bg-background flex min-h-0 flex-1 flex-col overflow-hidden"
    >
      {tab === "exposures" ? (
        <div className="bg-background shrink-0 border-b">
          <div className="flex flex-col gap-2 px-4 py-3 sm:px-6 lg:min-h-14 lg:flex-row lg:items-center lg:justify-between lg:gap-4 lg:py-2">
            <div className="min-w-0 flex-1">
              <InputGroup className="h-9 w-full lg:max-w-sm">
                <InputGroupAddon>
                  <Search />
                </InputGroupAddon>
                <InputGroupInput
                  value={searchQuery}
                  placeholder="Search principals, domains, sources…"
                  onChange={(event) => setSearchQuery(event.target.value)}
                />
              </InputGroup>
            </div>

            <div className="flex min-w-0 flex-wrap items-center gap-2 lg:justify-end">
              <label className="border-border bg-background hover:bg-accent flex h-9 cursor-pointer items-center gap-2 rounded-md border px-2.5 text-sm">
                <Switch
                  id="open-only"
                  checked={openOnly}
                  onCheckedChange={setOpenOnly}
                />
                <span>Open only</span>
              </label>
              <label className="border-border bg-background hover:bg-accent flex h-9 cursor-pointer items-center gap-2 rounded-md border px-2.5 text-sm">
                <Switch
                  id="privileged-only"
                  checked={privilegedOnly}
                  onCheckedChange={setPrivilegedOnly}
                />
                <span>Privileged</span>
              </label>

              <ExposureFilterControl
                typeFilters={typeFilters}
                severityFilters={severityFilters}
                statusFilters={statusFilters}
                sourceFilters={sourceFilters}
                domainFilters={domainFilters}
                domainOptions={domainOptions}
                sort={sort}
                activeFilterCount={activeFilterCount}
                onToggleType={(type) =>
                  setTypeFilters((current) => toggleInList(current, type))
                }
                onToggleSeverity={(severity) =>
                  setSeverityFilters((current) =>
                    toggleInList(current, severity),
                  )
                }
                onToggleStatus={(status) =>
                  setStatusFilters((current) => toggleInList(current, status))
                }
                onToggleSource={(source) =>
                  setSourceFilters((current) => toggleInList(current, source))
                }
                onToggleDomain={(domain) =>
                  setDomainFilters((current) => toggleInList(current, domain))
                }
                onSetSort={setSort}
                onClearFilters={resetFilters}
              />

              <Button
                size="sm"
                className="h-9 gap-1.5"
                onClick={() => {
                  const exportResult = queryExposures(exposures, {
                    page: 1,
                    pageSize: Math.max(queryResult.total, 1),
                    search: deferredSearchQuery,
                    types: typeFilters,
                    severities: severityFilters,
                    statuses: statusFilters,
                    sources: sourceFilters,
                    domains: domainFilters,
                    privilegedOnly,
                    openOnly,
                    sort,
                  });
                  downloadCsv({
                    filename: `heimdall-dark-web-${new Date().toISOString().slice(0, 10)}.csv`,
                    headers: [
                      "id",
                      "title",
                      "severity",
                      "status",
                      "type",
                      "source",
                      "domain",
                      "detected_at",
                    ],
                    rows: exportResult.items.map((item) => [
                      item.id,
                      item.title,
                      item.severity,
                      item.status,
                      item.type,
                      item.source,
                      item.domain ?? "",
                      item.firstSeenLabel,
                    ]),
                  });
                  appendAuditLog({
                    actorId: currentProfile.id,
                    actorName: currentProfile.name,
                    action: "export.dark_web_csv",
                    targetType: "export",
                    targetId: "dark-web",
                    detail: `Exported ${exportResult.items.length} exposures`,
                  });
                  toast({
                    title: "Export downloaded",
                    description: `${exportResult.items.length.toLocaleString("en-US")} exposures saved as CSV.`,
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
          {tab === "overview" ? (
            <DarkWebStatsStrip exposures={exposures} watchlist={watchlist} />
          ) : null}

          <Tabs
            value={tab}
            onValueChange={(value) => setTab(value as DarkWebTab)}
            className="flex flex-col gap-4"
          >
            <div className="overflow-x-auto border-b">
              <TabsList className="inline-flex h-auto min-w-max justify-start gap-7 rounded-none bg-transparent p-0 sm:gap-8">
                <TabsTrigger value="overview" className={tabTriggerClassName}>
                  Overview
                </TabsTrigger>
                <TabsTrigger value="exposures" className={tabTriggerClassName}>
                  Exposures
                  <span className="bg-muted text-muted-foreground rounded-md px-1.5 py-0.5 text-xs">
                    {queryResult.openCount.toLocaleString("en-US")}
                  </span>
                </TabsTrigger>
                <TabsTrigger value="breaches" className={tabTriggerClassName}>
                  Breaches
                  <span className="bg-muted text-muted-foreground rounded-md px-1.5 py-0.5 text-xs">
                    {breaches.length}
                  </span>
                </TabsTrigger>
                <TabsTrigger value="watchlist" className={tabTriggerClassName}>
                  Watchlist
                  <span className="bg-muted text-muted-foreground rounded-md px-1.5 py-0.5 text-xs">
                    {watchlist.length}
                  </span>
                </TabsTrigger>
              </TabsList>
            </div>

            {tab === "overview" ? (
              <DarkWebOverview
                exposures={exposures}
                onFilter={(target) => router.push(overviewFilterToHref(target))}
                onOpenExposure={openExposure}
              />
            ) : null}

            {tab === "exposures" ? (
              <div className="space-y-3">
                <TypeChipBar
                  types={typeFilters}
                  onToggle={(type) =>
                    setTypeFilters((current) => toggleInList(current, type))
                  }
                />
                <DarkWebExposuresTable
                  items={queryResult.items}
                  total={queryResult.total}
                  page={queryResult.page}
                  pageSize={pageSize}
                  sort={sort}
                  selectedIds={selectedIds}
                  activeFilterCount={activeFilterCount}
                  onPageChange={setPage}
                  onPageSizeChange={setPageSize}
                  onSortChange={setSort}
                  onToggleSelectAllPage={toggleSelectAllPage}
                  onToggleSelect={toggleSelect}
                  onClearSelection={() => setSelectedIds(new Set())}
                  onBulkSetStatus={bulkSetStatus}
                  onSetStatus={(id, status) => {
                    patchExposures([id], { status });
                    toast({
                      title: "Status updated",
                      description: `${id} → ${exposureStatusLabels[status]}`,
                    });
                  }}
                  onOpen={openExposure}
                  onClearFilters={resetFilters}
                />
              </div>
            ) : null}

            {tab === "breaches" ? (
              <DarkWebBreachesTable
                breaches={breaches}
                exposures={exposures}
                onOpenBreach={openBreach}
              />
            ) : null}

            {tab === "watchlist" ? (
              <DarkWebWatchlist
                watchlist={watchlist}
                onAdd={addWatchlistEntry}
                onRemove={removeWatchlistEntry}
                onSetStatus={setWatchlistStatus}
              />
            ) : null}
          </Tabs>
        </div>
      </div>

      <DarkWebDetailSheet
        exposure={selectedExposure}
        open={Boolean(selectedExposure)}
        onOpenChange={(open) => {
          if (!open) setSelectedExposureId(null);
        }}
        onSetStatus={(id, status) => patchExposures([id], { status })}
        onOpenBreach={openBreach}
      />

      <DarkWebBreachDetailSheet
        breach={selectedBreach}
        exposures={exposures}
        open={Boolean(selectedBreach)}
        onOpenChange={(open) => {
          if (!open) setSelectedBreachId(null);
        }}
        onOpenExposure={openExposure}
      />
    </main>
  );
}
