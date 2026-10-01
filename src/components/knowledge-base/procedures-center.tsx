"use client";

import {
  ClipboardList,
  Copy,
  Download,
  Ellipsis,
  Play,
  Plus,
  Search,
  Siren,
} from "lucide-react";
import Link from "next/link";
import {
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";

import { useIncidentsSession } from "@/components/incidents/incidents-session";
import { ListPagination, paginateItems } from "@/components/list-pagination";
import {
  getPlaybookSnapshot,
  runPlaybookAgainstIncident,
  subscribePlaybooks,
  upsertPlaybook,
} from "@/components/playbooks/playbooks-session";
import { type FilterFacet, FilterMenu } from "@/components/soc/filter-menu";
import {
  ModuleShell,
  ModuleToolbarActions,
  ModuleToolbarSearch,
} from "@/components/soc/module-shell";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

import { downloadTextFile } from "./download-text-file";
import {
  getProcedureStats,
  type KbProcedure,
  type KbProcedureSeverity,
  kbProcedureSeverityLabels,
  type KbProcedureStatus,
  kbProcedureStatusLabels,
} from "./knowledge-base-data";
import {
  EmptyState,
  KbStatsStrip,
  OwnerCell,
  ProcedureSeverityBadge,
  ProcedureStatusBadge,
  RelatedLinks,
} from "./knowledge-base-primitives";

type ProcedureSort = "severity" | "runs-desc" | "updated-desc" | "title-asc";

const sortLabels: Record<ProcedureSort, string> = {
  severity: "Severity · highest first",
  "runs-desc": "Most executed",
  "updated-desc": "Recently updated",
  "title-asc": "Title A–Z",
};

const severityWeight: Record<KbProcedureSeverity, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

const DEFAULT_RUN_INCIDENTS = ["INC-2400", "INC-2401", "INC-2402", "INC-2403"];

const chipLinkClassName =
  "border-border/70 bg-background hover:text-foreground text-muted-foreground cursor-pointer rounded-md border px-1.5 py-0.5 font-mono text-xs transition-colors";

const sheetChipLinkClassName =
  "border-border/70 bg-background hover:text-foreground text-muted-foreground cursor-pointer rounded-md border px-2 py-1 font-mono text-xs transition-colors";

function procedureMarkdown(procedure: KbProcedure) {
  return [
    `# ${procedure.title}`,
    "",
    `**Code:** ${procedure.code}`,
    `**Severity:** ${kbProcedureSeverityLabels[procedure.severity]}`,
    `**Status:** ${kbProcedureStatusLabels[procedure.status]}`,
    `**Steps:** ${procedure.steps}`,
    procedure.mitreTactic ? `**MITRE:** ${procedure.mitreTactic}` : null,
    "",
    "## Summary",
    "",
    procedure.summary,
    "",
    "## Linked incidents",
    "",
    procedure.linkedIncidentIds.length > 0
      ? procedure.linkedIncidentIds.map((id) => `- ${id}`).join("\n")
      : "- None",
    "",
    "## Linked alerts",
    "",
    procedure.linkedAlertIds.length > 0
      ? procedure.linkedAlertIds.map((id) => `- ${id}`).join("\n")
      : "- None",
    "",
  ]
    .filter((line) => line !== null)
    .join("\n");
}

function ProcedureFilterControl({
  severityFilters,
  statusFilters,
  sort,
  activeFilterCount,
  onToggleSeverity,
  onToggleStatus,
  onSetSort,
  onClearFilters,
}: {
  severityFilters: KbProcedureSeverity[];
  statusFilters: KbProcedureStatus[];
  sort: ProcedureSort;
  activeFilterCount: number;
  onToggleSeverity: (severity: KbProcedureSeverity) => void;
  onToggleStatus: (status: KbProcedureStatus) => void;
  onSetSort: (sort: ProcedureSort) => void;
  onClearFilters: () => void;
}) {
  const facets: FilterFacet[] = [
    {
      id: "severity",
      label: "Severity",
      options: (
        Object.keys(kbProcedureSeverityLabels) as KbProcedureSeverity[]
      ).map((severity) => ({
        value: severity,
        label: kbProcedureSeverityLabels[severity],
      })),
      selected: severityFilters,
      onToggle: (value) => onToggleSeverity(value as KbProcedureSeverity),
    },
    {
      id: "status",
      label: "Status",
      options: (
        Object.keys(kbProcedureStatusLabels) as KbProcedureStatus[]
      ).map((status) => ({
        value: status,
        label: kbProcedureStatusLabels[status],
      })),
      selected: statusFilters,
      onToggle: (value) => onToggleStatus(value as KbProcedureStatus),
    },
    {
      id: "sort",
      label: "Sort by",
      single: true,
      hideCount: true,
      options: (Object.keys(sortLabels) as ProcedureSort[]).map((option) => ({
        value: option,
        label: sortLabels[option],
      })),
      selected: [sort],
      onToggle: (value) => onSetSort(value as ProcedureSort),
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

export function ProceduresCenter() {
  const store = useSyncExternalStore(
    subscribePlaybooks,
    getPlaybookSnapshot,
    getPlaybookSnapshot,
  );
  const procedures = useMemo(() => Array.from(store.values()), [store]);
  const { getIncident, patchIncidents } = useIncidentsSession();
  const [searchQuery, setSearchQuery] = useState("");
  const [severityFilters, setSeverityFilters] = useState<KbProcedureSeverity[]>(
    [],
  );
  const [statusFilters, setStatusFilters] = useState<KbProcedureStatus[]>([]);
  const [sort, setSort] = useState<ProcedureSort>("severity");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [selected, setSelected] = useState<KbProcedure | null>(null);
  const [newOpen, setNewOpen] = useState(false);
  const [runOpen, setRunOpen] = useState(false);
  const [runTarget, setRunTarget] = useState<KbProcedure | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newSeverity, setNewSeverity] = useState<KbProcedureSeverity>("medium");
  const deferredSearchQuery = useDeferredValue(searchQuery);

  const activeFilterCount =
    severityFilters.length +
    statusFilters.length +
    (sort !== "severity" ? 1 : 0);

  const toggleSeverity = (severity: KbProcedureSeverity) => {
    setSeverityFilters((current) =>
      current.includes(severity)
        ? current.filter((value) => value !== severity)
        : [...current, severity],
    );
  };

  const toggleStatus = (status: KbProcedureStatus) => {
    setStatusFilters((current) =>
      current.includes(status)
        ? current.filter((value) => value !== status)
        : [...current, status],
    );
  };

  const resetFilters = () => {
    setSearchQuery("");
    setSeverityFilters([]);
    setStatusFilters([]);
    setSort("severity");
  };

  const openRunDialog = (procedure: KbProcedure) => {
    setRunTarget(procedure);
    setRunOpen(true);
  };

  const exportProcedure = (procedure: KbProcedure) => {
    downloadTextFile({
      filename: `${procedure.code}.md`,
      content: procedureMarkdown(procedure),
      mimeType: "text/markdown;charset=utf-8",
    });
    toast({
      title: "Exported",
      description: `${procedure.code}.md`,
    });
  };

  const duplicateProcedure = (procedure: KbProcedure) => {
    const stamp = Date.now();
    const copy: KbProcedure = {
      ...procedure,
      id: `proc-${stamp}`,
      code: `${procedure.code}-COPY`,
      title: `${procedure.title} (copy)`,
      status: "draft",
      runCount: 0,
      lastRunLabel: "Never",
      updatedAt: new Date().toISOString().slice(0, 10),
    };
    upsertPlaybook(copy);
    setSelected(copy);
    toast({
      title: "Procedure duplicated",
      description: `${copy.code} draft copy created.`,
    });
  };

  const submitNewProcedure = () => {
    const title = newTitle.trim();
    if (!title) {
      toast({
        title: "Title required",
        description: "Enter a procedure title to create a draft.",
      });
      return;
    }
    const stamp = Date.now();
    const seq = String(procedures.length + 1).padStart(2, "0");
    const draft: KbProcedure = {
      id: `proc-${stamp}`,
      code: `PB-NEW-${seq}`,
      title,
      summary: `Draft playbook for ${title}. Add steps and link cases before approval.`,
      severity: newSeverity,
      status: "draft",
      ownerId: "riya-sharma",
      steps: 5,
      lastRunLabel: "Never",
      runCount: 0,
      linkedIncidentIds: [],
      linkedAlertIds: [],
      related: [
        { label: "Open incidents", href: "/incidents/list" },
        { label: "Procedures", href: "/knowledge-base/procedures" },
      ],
      updatedAt: new Date().toISOString().slice(0, 10),
    };
    upsertPlaybook(draft);
    setSelected(draft);
    setNewOpen(false);
    setNewTitle("");
    setNewSeverity("medium");
    toast({
      title: "Draft created",
      description: `${draft.code} is open in the procedure sheet.`,
    });
  };

  const confirmAttach = (incidentId: string) => {
    if (!runTarget) return;
    const incident = getIncident(incidentId);
    if (!incident) {
      toast({
        title: "Incident not in session",
        description: `${incidentId} is not loaded — open it from Incidents first.`,
      });
      return;
    }
    const result = runPlaybookAgainstIncident(
      runTarget.id,
      incident,
      patchIncidents,
    );
    setSelected(result.procedure);
    toast({
      title: "Playbook running",
      description: `${result.procedure.code} attached to ${incidentId}.`,
    });
    setRunOpen(false);
    setRunTarget(null);
  };

  const visibleProcedures = useMemo(() => {
    const normalized = deferredSearchQuery.trim().toLowerCase();

    return procedures
      .filter((procedure) => {
        if (
          severityFilters.length > 0 &&
          !severityFilters.includes(procedure.severity)
        ) {
          return false;
        }
        if (
          statusFilters.length > 0 &&
          !statusFilters.includes(procedure.status)
        ) {
          return false;
        }
        if (!normalized) return true;

        return [
          procedure.code,
          procedure.title,
          procedure.summary,
          procedure.mitreTactic ?? "",
          ...procedure.linkedIncidentIds,
          ...procedure.linkedAlertIds,
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalized);
      })
      .sort((a, b) => {
        if (sort === "title-asc") return a.title.localeCompare(b.title);
        if (sort === "runs-desc") return b.runCount - a.runCount;
        if (sort === "updated-desc")
          return b.updatedAt.localeCompare(a.updatedAt);
        return severityWeight[a.severity] - severityWeight[b.severity];
      });
  }, [deferredSearchQuery, procedures, severityFilters, sort, statusFilters]);

  useEffect(() => {
    setPage(1);
  }, [deferredSearchQuery, severityFilters, statusFilters, sort, pageSize]);

  const pageCount = Math.max(1, Math.ceil(visibleProcedures.length / pageSize));
  const safePage = Math.min(page, pageCount);
  const pagedProcedures = paginateItems(visibleProcedures, safePage, pageSize);
  const stats = getProcedureStats();

  const runIncidentOptions =
    runTarget && runTarget.linkedIncidentIds.length > 0
      ? runTarget.linkedIncidentIds
      : DEFAULT_RUN_INCIDENTS;

  return (
    <ModuleShell
      toolbar={
        <>
          <ModuleToolbarSearch>
            <InputGroup className="h-9 w-full">
              <InputGroupAddon>
                <Search />
              </InputGroupAddon>
              <InputGroupInput
                value={searchQuery}
                placeholder="Search playbooks, MITRE, case IDs..."
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </InputGroup>
          </ModuleToolbarSearch>

          <ModuleToolbarActions>
            <ProcedureFilterControl
              severityFilters={severityFilters}
              statusFilters={statusFilters}
              sort={sort}
              activeFilterCount={activeFilterCount}
              onToggleSeverity={toggleSeverity}
              onToggleStatus={toggleStatus}
              onSetSort={setSort}
              onClearFilters={resetFilters}
            />
            <Button variant="outline" size="sm" className="h-9 gap-1.5" asChild>
              <Link href="/incidents/list">
                <Siren className="size-3.5" />
                <span className="hidden sm:inline">Open incidents</span>
                <span className="sm:hidden">Incidents</span>
              </Link>
            </Button>
            <Button
              size="sm"
              className="h-9 gap-1.5"
              onClick={() => setNewOpen(true)}
            >
              <Plus className="size-3.5" />
              <span className="hidden sm:inline">New procedure</span>
              <span className="sm:hidden">New</span>
            </Button>
          </ModuleToolbarActions>
        </>
      }
    >
      <KbStatsStrip stats={stats} />

      {pagedProcedures.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No procedures match"
          description="Adjust severity or status filters, or clear search to see the full catalog."
          action={
            <Button variant="outline" size="sm" onClick={resetFilters}>
              Reset filters
            </Button>
          }
        />
      ) : (
        <div className="bg-card shadow-card overflow-hidden rounded-xl border">
          <Table className="max-md:table-fixed">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="md:w-[38%]">Procedure</TableHead>
                <TableHead className="hidden sm:table-cell">Severity</TableHead>
                <TableHead className="hidden md:table-cell">Status</TableHead>
                <TableHead className="hidden lg:table-cell">Owner</TableHead>
                <TableHead className="hidden lg:table-cell">
                  Linked cases
                </TableHead>
                <TableHead className="hidden xl:table-cell text-right">
                  Runs
                </TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagedProcedures.map((procedure) => (
                <TableRow
                  key={procedure.id}
                  className="cursor-pointer"
                  onClick={() => setSelected(procedure)}
                >
                  <TableCell>
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-muted-foreground font-mono text-xs">
                          {procedure.code}
                        </span>
                        {procedure.mitreTactic ? (
                          <span className="border-border/70 bg-background rounded-md border px-1.5 py-0.5 text-xs font-medium">
                            {procedure.mitreTactic}
                          </span>
                        ) : null}
                        <span className="sm:hidden">
                          <ProcedureSeverityBadge
                            severity={procedure.severity}
                          />
                        </span>
                      </div>
                      <p className="text-sm font-medium whitespace-normal">
                        {procedure.title}
                      </p>
                      <p className="text-muted-foreground line-clamp-1 text-xs">
                        {procedure.summary}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <ProcedureSeverityBadge severity={procedure.severity} />
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <ProcedureStatusBadge status={procedure.status} />
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <OwnerCell
                      userId={procedure.ownerId}
                      href={`/administration/users/${procedure.ownerId}`}
                    />
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {procedure.linkedIncidentIds.slice(0, 2).map((id) => (
                        <Link
                          key={id}
                          href={`/incidents/${id}`}
                          onClick={(event) => event.stopPropagation()}
                          className={chipLinkClassName}
                        >
                          {id}
                        </Link>
                      ))}
                      {procedure.linkedAlertIds.slice(0, 1).map((id) => (
                        <Link
                          key={id}
                          href={`/alerts/${id}`}
                          onClick={(event) => event.stopPropagation()}
                          className={chipLinkClassName}
                        >
                          {id}
                        </Link>
                      ))}
                      {procedure.linkedIncidentIds.length +
                        procedure.linkedAlertIds.length ===
                      0 ? (
                        <span className="text-muted-foreground text-xs">—</span>
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell className="hidden xl:table-cell text-right tabular-nums">
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium">
                        {procedure.runCount}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {procedure.lastRunLabel}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8"
                          onClick={(event) => event.stopPropagation()}
                          aria-label="Procedure actions"
                        >
                          <Ellipsis className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-52">
                        <DropdownMenuItem
                          onClick={(event) => {
                            event.stopPropagation();
                            openRunDialog(procedure);
                          }}
                        >
                          <Play className="size-3.5" />
                          Run against incident
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(event) => {
                            event.stopPropagation();
                            duplicateProcedure(procedure);
                          }}
                        >
                          <Copy className="size-3.5" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link
                            href="/incidents/list"
                            onClick={(e) => e.stopPropagation()}
                          >
                            View linked cases
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={(event) => {
                            event.stopPropagation();
                            exportProcedure(procedure);
                          }}
                        >
                          <Download className="size-3.5" />
                          Export
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <ListPagination
            page={safePage}
            pageSize={pageSize}
            total={visibleProcedures.length}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        </div>
      )}

      <Dialog
        open={newOpen}
        onOpenChange={(open) => {
          setNewOpen(open);
          if (!open) {
            setNewTitle("");
            setNewSeverity("medium");
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New procedure</DialogTitle>
            <DialogDescription>
              Create a draft playbook from the IR template and open it in the
              detail sheet.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="proc-title">Title</Label>
              <Input
                id="proc-title"
                value={newTitle}
                placeholder="e.g. Vendor compromise containment"
                onChange={(event) => setNewTitle(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    submitNewProcedure();
                  }
                }}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="proc-severity">Severity</Label>
              <Select
                value={newSeverity}
                onValueChange={(value) =>
                  setNewSeverity(value as KbProcedureSeverity)
                }
              >
                <SelectTrigger id="proc-severity" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(
                    Object.keys(
                      kbProcedureSeverityLabels,
                    ) as KbProcedureSeverity[]
                  ).map((severity) => (
                    <SelectItem key={severity} value={severity}>
                      {kbProcedureSeverityLabels[severity]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitNewProcedure}>Create draft</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={runOpen}
        onOpenChange={(open) => {
          setRunOpen(open);
          if (!open) setRunTarget(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Run against incident</DialogTitle>
            <DialogDescription>
              {runTarget
                ? `Attach ${runTarget.code} to a live case, or open the incidents list.`
                : "Choose an incident to attach this playbook."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2 py-2">
            {runIncidentOptions.map((id) => (
              <Button
                key={id}
                variant="outline"
                className={cn(
                  "h-auto justify-start gap-2 px-3 py-2 font-mono text-sm",
                )}
                asChild
              >
                <Link
                  href={`/incidents/${id}`}
                  onClick={() => confirmAttach(id)}
                >
                  <Play className="size-3.5 shrink-0" />
                  {id}
                </Link>
              </Button>
            ))}
            <Button variant="ghost" className="justify-start" asChild>
              <Link
                href="/incidents/list"
                onClick={() => {
                  setRunOpen(false);
                  setRunTarget(null);
                }}
              >
                Open incidents list
              </Link>
            </Button>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRunOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Sheet
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      >
        <SheetContent className="w-full sm:max-w-md">
          {selected ? (
            <>
              <SheetHeader>
                <SheetTitle className="pr-8">{selected.title}</SheetTitle>
                <SheetDescription className="font-mono text-xs">
                  {selected.code}
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-5">
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {selected.summary}
                </p>
                <div className="flex flex-wrap gap-2">
                  <ProcedureSeverityBadge severity={selected.severity} />
                  <ProcedureStatusBadge status={selected.status} />
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs">Steps</p>
                    <p className="font-medium tabular-nums">{selected.steps}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Runs</p>
                    <p className="font-medium tabular-nums">
                      {selected.runCount}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Last run</p>
                    <p className="font-medium">{selected.lastRunLabel}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">MITRE</p>
                    <p className="font-medium">{selected.mitreTactic ?? "—"}</p>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <p className="text-muted-foreground text-caption font-medium">
                    Owner
                  </p>
                  <OwnerCell
                    userId={selected.ownerId}
                    href={`/administration/users/${selected.ownerId}`}
                  />
                </div>
                <div className="space-y-1.5">
                  <p className="text-muted-foreground text-caption font-medium">
                    Linked incidents
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {selected.linkedIncidentIds.length === 0 ? (
                      <span className="text-muted-foreground text-sm">
                        None
                      </span>
                    ) : (
                      selected.linkedIncidentIds.map((id) => (
                        <Link
                          key={id}
                          href={`/incidents/${id}`}
                          className={sheetChipLinkClassName}
                        >
                          {id}
                        </Link>
                      ))
                    )}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <p className="text-muted-foreground text-caption font-medium">
                    Linked alerts
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {selected.linkedAlertIds.length === 0 ? (
                      <span className="text-muted-foreground text-sm">
                        None
                      </span>
                    ) : (
                      selected.linkedAlertIds.map((id) => (
                        <Link
                          key={id}
                          href={`/alerts/${id}`}
                          className={sheetChipLinkClassName}
                        >
                          {id}
                        </Link>
                      ))
                    )}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <p className="text-muted-foreground text-caption font-medium">
                    Related
                  </p>
                  <RelatedLinks links={selected.related} />
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  <Button
                    size="sm"
                    className="gap-1.5"
                    disabled={selected.status === "deprecated"}
                    onClick={() => openRunDialog(selected)}
                  >
                    <Play className="size-3.5" />
                    Run against incident
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/incidents/list">View cases</Link>
                  </Button>
                </div>
              </div>
            </>
          ) : null}
        </SheetContent>
      </Sheet>
    </ModuleShell>
  );
}
