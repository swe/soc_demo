"use client";

import {
  Download,
  EyeOff,
  Globe,
  KeyRound,
  ListFilter,
  Search,
  ShieldAlert,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";

import { appendAuditLog } from "@/components/audit/audit-log-data";
import { currentProfile } from "@/components/profile/profile-data";
import { FilterChip } from "@/components/soc/filter-chip";
import { type FilterFacet, FilterMenu } from "@/components/soc/filter-menu";
import {
  ModuleShell,
  ModuleToolbarActions,
  ModuleToolbarSearch,
} from "@/components/soc/module-shell";
import {
  ModuleTabsList,
  ModuleTabsTrigger,
  TabCount,
} from "@/components/soc/module-tabs";
import { type SocStat, StatsStrip } from "@/components/soc/stats-strip";
import { ToolbarToggle } from "@/components/soc/toolbar-toggle";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Tabs } from "@/components/ui/tabs";
import { downloadCsv } from "@/lib/download-csv";
import { toast } from "@/lib/toast";

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
import { queryExposures } from "./dark-web-query";
import { useDarkWebSession } from "./dark-web-session";
import {
  buildDarkWebHref,
  type DarkWebTab,
  overviewFilterToHref,
  parseDarkWebSearchParams,
} from "./dark-web-url";
import { DarkWebWatchlist } from "./dark-web-watchlist";

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
  const facets: FilterFacet[] = [
    {
      id: "type",
      label: "Type",
      icon: KeyRound,
      options: exposureTypes.map((value) => ({
        value,
        label: exposureTypeLabels[value],
      })),
      selected: typeFilters,
      onToggle: (value) => onToggleType(value as ExposureType),
    },
    {
      id: "severity",
      label: "Severity",
      icon: ShieldAlert,
      options: exposureSeverities.map((value) => ({
        value,
        label: exposureSeverityLabels[value],
      })),
      selected: severityFilters,
      onToggle: (value) => onToggleSeverity(value as ExposureSeverity),
    },
    {
      id: "status",
      label: "Status",
      icon: ListFilter,
      options: exposureStatuses.map((value) => ({
        value,
        label: exposureStatusLabels[value],
      })),
      selected: statusFilters,
      onToggle: (value) => onToggleStatus(value as ExposureStatus),
    },
    {
      id: "source",
      label: "Source",
      icon: EyeOff,
      options: darkWebSources.map((value) => ({ value, label: value })),
      selected: sourceFilters,
      onToggle: onToggleSource,
    },
    {
      id: "domain",
      label: "Domain",
      icon: Globe,
      options: domainOptions.map((value) => ({ value, label: value })),
      selected: domainFilters,
      onToggle: onToggleDomain,
    },
    {
      id: "sort",
      label: "Sort",
      single: true,
      hideCount: true,
      options: (Object.keys(exposureSortLabels) as ExposureSort[]).map(
        (value) => ({ value, label: exposureSortLabels[value] }),
      ),
      selected: [sort],
      onToggle: (value) => onSetSort(value as ExposureSort),
    },
  ];

  return (
    <FilterMenu
      facets={facets}
      activeCount={activeFilterCount}
      onClear={onClearFilters}
    />
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
    <div
      role="group"
      aria-label="Exposure type"
      className="-mx-gutter px-gutter no-scrollbar flex gap-2 overflow-x-auto sm:mx-0 sm:flex-wrap sm:px-0"
    >
      {exposureTypes.map((type) => (
        <FilterChip
          key={type}
          pressed={types.includes(type)}
          onClick={() => onToggle(type)}
        >
          {exposureTypeLabels[type]}
        </FilterChip>
      ))}
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
    <ModuleShell
      toolbar={
        tab === "exposures" ? (
          <>
            <ModuleToolbarSearch>
              <InputGroup className="h-9 w-full">
                <InputGroupAddon>
                  <Search />
                </InputGroupAddon>
                <InputGroupInput
                  value={searchQuery}
                  placeholder="Search principals, domains, sources…"
                  aria-label="Search exposures"
                  onChange={(event) => setSearchQuery(event.target.value)}
                />
              </InputGroup>
            </ModuleToolbarSearch>

            <ModuleToolbarActions>
              <ToolbarToggle
                id="open-only"
                checked={openOnly}
                onCheckedChange={setOpenOnly}
                label="Open only"
              />
              <ToolbarToggle
                id="privileged-only"
                checked={privilegedOnly}
                onCheckedChange={setPrivilegedOnly}
                label="Privileged"
              />

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
                aria-label="Export exposures as CSV"
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
            </ModuleToolbarActions>
          </>
        ) : undefined
      }
    >
      {tab === "overview" ? (
        <DarkWebStatsStrip exposures={exposures} watchlist={watchlist} />
      ) : null}

      <Tabs
        value={tab}
        onValueChange={(value) => setTab(value as DarkWebTab)}
        className="flex flex-col gap-4"
      >
        <ModuleTabsList>
          <ModuleTabsTrigger value="overview">Overview</ModuleTabsTrigger>
          <ModuleTabsTrigger value="exposures">
            Exposures
            <TabCount>{queryResult.openCount.toLocaleString("en-US")}</TabCount>
          </ModuleTabsTrigger>
          <ModuleTabsTrigger value="breaches">
            Breaches
            <TabCount>{breaches.length}</TabCount>
          </ModuleTabsTrigger>
          <ModuleTabsTrigger value="watchlist">
            Watchlist
            <TabCount>{watchlist.length}</TabCount>
          </ModuleTabsTrigger>
        </ModuleTabsList>

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
    </ModuleShell>
  );
}
