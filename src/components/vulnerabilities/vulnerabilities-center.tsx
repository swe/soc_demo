"use client";

import { Download, Search, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";

import { appendAuditLog } from "@/components/audit/audit-log-data";
import { ListPagination } from "@/components/list-pagination";
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
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs } from "@/components/ui/tabs";
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
  PriorityBadge,
  SeverityBadge,
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
  const facets: FilterFacet[] = [
    {
      id: "severity",
      label: "Severity",
      icon: ShieldAlert,
      options: vulnSeverities.map((value) => ({
        value,
        label: vulnSeverityLabels[value],
      })),
      selected: severityFilters,
      onToggle: (value) => onToggleSeverity(value as VulnSeverity),
    },
    {
      id: "scope",
      label: "Scope",
      single: true,
      hideCount: true,
      options: [
        { value: "all", label: "All scopes" },
        { value: "endpoint", label: "Endpoint" },
        { value: "cloud", label: "Cloud" },
      ],
      selected: [scope],
      onToggle: (value) => onSetScope(value as "endpoint" | "cloud" | "all"),
    },
    {
      id: "sort",
      label: "Sort",
      single: true,
      hideCount: true,
      options: (Object.keys(findingSortLabels) as FindingSort[]).map(
        (value) => ({ value, label: findingSortLabels[value] }),
      ),
      selected: [sort],
      onToggle: (value) => onSetSort(value as FindingSort),
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
      <TableCell className="max-md:w-full">
        <span className="text-primary font-mono text-sm font-medium whitespace-nowrap group-hover/row:underline">
          {v.cve}
        </span>
        <div className="mt-1 space-y-1 md:hidden">
          <p className="line-clamp-2 text-sm">{v.title}</p>
          <div className="flex flex-wrap items-center gap-1.5 sm:hidden">
            <SeverityBadge severity={v.severity} />
          </div>
        </div>
      </TableCell>
      <TableCell className="hidden sm:table-cell">
        <SeverityBadge severity={v.severity} />
      </TableCell>
      <TableCell className="hidden max-w-[240px] md:table-cell">
        <span className="line-clamp-2 text-sm">{v.title}</span>
      </TableCell>
      <TableCell
        className="hidden lg:table-cell"
        onClick={(e) => e.stopPropagation()}
      >
        {v.linkedAlertIds.length === 0 ? (
          <span className="text-muted-foreground text-xs">—</span>
        ) : (
          <div className="flex flex-wrap gap-1">
            {v.linkedAlertIds.map((id) => (
              <Link
                key={id}
                href={`/alerts/${id}`}
                className="text-primary font-mono text-xs whitespace-nowrap hover:underline"
              >
                {id}
              </Link>
            ))}
          </div>
        )}
      </TableCell>
      <TableCell
        className="hidden lg:table-cell"
        onClick={(e) => e.stopPropagation()}
      >
        {v.linkedIncidentIds.length === 0 ? (
          <span className="text-muted-foreground text-xs">—</span>
        ) : (
          <div className="flex flex-wrap gap-1">
            {v.linkedIncidentIds.map((id) => (
              <Link
                key={id}
                href={`/incidents/${id}`}
                className="text-primary font-mono text-xs whitespace-nowrap hover:underline"
              >
                {id}
              </Link>
            ))}
          </div>
        )}
      </TableCell>
      <TableCell className="hidden tabular-nums md:table-cell">
        {formatCompact(v.exposedDeviceCount)}
      </TableCell>
      <TableCell className="hidden xl:table-cell">
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
    <ModuleShell
      toolbar={
        view === "findings" ? (
          <>
            <ModuleToolbarSearch>
              <InputGroup className="h-9 w-full">
                <InputGroupAddon>
                  <Search />
                </InputGroupAddon>
                <InputGroupInput
                  value={searchQuery}
                  placeholder="Search CVEs, titles, CWE…"
                  onChange={(event) => setSearchQuery(event.target.value)}
                />
              </InputGroup>
            </ModuleToolbarSearch>

            <ModuleToolbarActions>
              <div
                role="group"
                aria-label="Persona presets"
                className="flex flex-wrap items-center gap-1.5"
              >
                {vulnPersonas
                  .filter((p) => p !== "ciso")
                  .map((p) => {
                    const active = personaPresetChipActive(p, currentFilters);
                    return (
                      <FilterChip
                        key={p}
                        pressed={active}
                        className={cn(
                          p === persona && !active && "border-foreground/25",
                        )}
                        onClick={() => applyPersonaPreset(p)}
                      >
                        {vulnPersonaLabels[p].replace(" Analyst", "")}
                      </FilterChip>
                    );
                  })}
              </div>

              <div
                role="group"
                aria-label="Quick filters"
                className="flex flex-wrap items-center gap-1.5"
              >
                <FilterChip
                  pressed={exploitableOnly}
                  onClick={() => setExploitableOnly(!exploitableOnly)}
                  title="Exploitable only"
                >
                  Exploitable
                </FilterChip>

                <FilterChip
                  pressed={withAlertsOnly}
                  onClick={() => setWithAlertsOnly(!withAlertsOnly)}
                  title="Linked alerts only"
                >
                  Linked alerts
                </FilterChip>

                <FilterChip
                  pressed={zeroDayOnly}
                  onClick={() => setZeroDayOnly(!zeroDayOnly)}
                  title="Zero-day only"
                >
                  Zero-day
                </FilterChip>

                <FilterChip
                  pressed={withIncidentsOnly}
                  onClick={() => setWithIncidentsOnly(!withIncidentsOnly)}
                  title="Linked incidents only"
                >
                  Incidents
                </FilterChip>
              </div>

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
            </ModuleToolbarActions>
          </>
        ) : undefined
      }
    >
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
        <ModuleTabsList>
          <ModuleTabsTrigger value="overview">Overview</ModuleTabsTrigger>
          <ModuleTabsTrigger value="findings">
            Findings
            <TabCount>{queryResult.total.toLocaleString("en-US")}</TabCount>
          </ModuleTabsTrigger>
        </ModuleTabsList>

        {view === "overview" ? (
          <VulnerabilitiesOverview />
        ) : (
          <div className="bg-card shadow-card overflow-hidden rounded-xl border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Priority</TableHead>
                  <TableHead>CVE</TableHead>
                  <TableHead className="hidden sm:table-cell">
                    Severity
                  </TableHead>
                  <TableHead className="hidden md:table-cell">Title</TableHead>
                  <TableHead className="hidden lg:table-cell">
                    Linked alerts
                  </TableHead>
                  <TableHead className="hidden lg:table-cell">
                    Incidents
                  </TableHead>
                  <TableHead className="hidden md:table-cell">
                    Exposed devices
                  </TableHead>
                  <TableHead className="hidden xl:table-cell">
                    Threats
                  </TableHead>
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

      <VulnerabilityDetailSheet
        vulnerability={selected}
        siblings={queryResult.items}
        onOpenChange={(open) => {
          if (!open) setSelectedId(null);
        }}
        onNavigate={(id) => setSelectedId(id)}
      />
    </ModuleShell>
  );
}
