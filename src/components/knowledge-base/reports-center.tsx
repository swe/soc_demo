"use client";

import {
  CalendarClock,
  CheckIcon,
  ChevronRight,
  Download,
  Ellipsis,
  FileBarChart,
  ListFilter,
  Plus,
  RefreshCw,
  Scale,
  Search,
} from "lucide-react";
import Link from "next/link";
import { useDeferredValue, useEffect, useMemo, useState } from "react";

import { ListPagination, paginateItems } from "@/components/list-pagination";
import { downloadExecutiveBoardPack } from "@/components/overview/executive-board-pack";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
  getReportStats,
  type KbReport,
  type KbReportKind,
  kbReportKindLabels,
  kbReports,
  type KbReportStatus,
  kbReportStatusLabels,
} from "./knowledge-base-data";
import {
  EmptyState,
  KbStatsStrip,
  mutedControlClassName,
  OwnerCell,
  RelatedLinks,
  ReportStatusBadge,
} from "./knowledge-base-primitives";

type FilterPanel = "kind" | "status" | "sort";

type ReportSort = "updated-desc" | "title-asc" | "kind";

const sortLabels: Record<ReportSort, string> = {
  "updated-desc": "Recently updated",
  "title-asc": "Title A–Z",
  kind: "Report type",
};

const kindCodePrefix: Record<KbReportKind, string> = {
  incident: "INC",
  audit: "AUD",
  compliance: "CMP",
  threat: "THR",
  sla: "SLA",
  executive: "EXE",
};

function reportMarkdown(report: KbReport) {
  return [
    `# ${report.title}`,
    "",
    `**Code:** ${report.code}`,
    `**Type:** ${kbReportKindLabels[report.kind]}`,
    `**Status:** ${kbReportStatusLabels[report.status]}`,
    `**Period:** ${report.periodLabel}`,
    `**Generated:** ${report.generatedLabel}`,
    `**Size:** ${report.sizeLabel}`,
    "",
    "## Summary",
    "",
    report.summary,
    "",
    "## Scope",
    "",
    `This ${kbReportKindLabels[report.kind].toLowerCase()} export covers ${report.periodLabel}.`,
    "",
  ].join("\n");
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

function ReportFilterControl({
  kindFilters,
  statusFilters,
  sort,
  activeFilterCount,
  onToggleKind,
  onToggleStatus,
  onSetSort,
  onClearFilters,
}: {
  kindFilters: KbReportKind[];
  statusFilters: KbReportStatus[];
  sort: ReportSort;
  activeFilterCount: number;
  onToggleKind: (kind: KbReportKind) => void;
  onToggleStatus: (status: KbReportStatus) => void;
  onSetSort: (sort: ReportSort) => void;
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
      <PopoverContent className="w-60 p-0" align="end">
        {panel === null ? (
          <Command>
            <CommandList>
              <CommandGroup>
                <CommandItem
                  onSelect={() => setPanel("kind")}
                  className="flex items-center justify-between"
                >
                  <span>Type</span>
                  <div className="flex items-center">
                    {kindFilters.length > 0 ? (
                      <span className="mr-1 text-xs text-zinc-500">
                        {kindFilters.length}
                      </span>
                    ) : null}
                    <ChevronRight className="size-4" />
                  </div>
                </CommandItem>
                <CommandItem
                  onSelect={() => setPanel("status")}
                  className="flex items-center justify-between"
                >
                  <span>Status</span>
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
                  onSelect={() => setPanel("sort")}
                  className="flex items-center justify-between"
                >
                  <span>Sort by</span>
                  <ChevronRight className="size-4" />
                </CommandItem>
              </CommandGroup>
              {activeFilterCount > 0 ? (
                <>
                  <CommandSeparator />
                  <CommandGroup>
                    <CommandItem onSelect={onClearFilters}>
                      Clear all filters
                    </CommandItem>
                  </CommandGroup>
                </>
              ) : null}
            </CommandList>
          </Command>
        ) : panel === "kind" ? (
          <Command>
            <FilterPanelHeader title="Type" onBack={closePanel} />
            <CommandList>
              <CommandGroup>
                {(Object.keys(kbReportKindLabels) as KbReportKind[]).map(
                  (kind) => (
                    <CommandItem
                      key={kind}
                      onSelect={() => onToggleKind(kind)}
                      className="flex items-center justify-between"
                    >
                      {kbReportKindLabels[kind]}
                      {kindFilters.includes(kind) ? (
                        <CheckIcon className="size-4" />
                      ) : null}
                    </CommandItem>
                  ),
                )}
              </CommandGroup>
            </CommandList>
          </Command>
        ) : panel === "status" ? (
          <Command>
            <FilterPanelHeader title="Status" onBack={closePanel} />
            <CommandList>
              <CommandGroup>
                {(Object.keys(kbReportStatusLabels) as KbReportStatus[]).map(
                  (status) => (
                    <CommandItem
                      key={status}
                      onSelect={() => onToggleStatus(status)}
                      className="flex items-center justify-between"
                    >
                      {kbReportStatusLabels[status]}
                      {statusFilters.includes(status) ? (
                        <CheckIcon className="size-4" />
                      ) : null}
                    </CommandItem>
                  ),
                )}
              </CommandGroup>
            </CommandList>
          </Command>
        ) : (
          <Command>
            <FilterPanelHeader title="Sort by" onBack={closePanel} />
            <CommandList>
              <CommandGroup>
                {(Object.keys(sortLabels) as ReportSort[]).map((option) => (
                  <CommandItem
                    key={option}
                    onSelect={() => {
                      onSetSort(option);
                      closePanel();
                    }}
                    className="flex items-center justify-between"
                  >
                    {sortLabels[option]}
                    {sort === option ? <CheckIcon className="size-4" /> : null}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        )}
      </PopoverContent>
    </Popover>
  );
}

export function ReportsCenter() {
  const [reports, setReports] = useState<KbReport[]>(() => [...kbReports]);
  const [searchQuery, setSearchQuery] = useState("");
  const [kindFilters, setKindFilters] = useState<KbReportKind[]>([]);
  const [statusFilters, setStatusFilters] = useState<KbReportStatus[]>([]);
  const [sort, setSort] = useState<ReportSort>("updated-desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [selected, setSelected] = useState<KbReport | null>(null);
  const [generateOpen, setGenerateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newKind, setNewKind] = useState<KbReportKind>("incident");
  const deferredSearchQuery = useDeferredValue(searchQuery);

  const activeFilterCount =
    kindFilters.length + statusFilters.length + (sort !== "updated-desc" ? 1 : 0);

  const toggleKind = (kind: KbReportKind) => {
    setKindFilters((current) =>
      current.includes(kind)
        ? current.filter((value) => value !== kind)
        : [...current, kind],
    );
  };

  const toggleStatus = (status: KbReportStatus) => {
    setStatusFilters((current) =>
      current.includes(status)
        ? current.filter((value) => value !== status)
        : [...current, status],
    );
  };

  const resetFilters = () => {
    setSearchQuery("");
    setKindFilters([]);
    setStatusFilters([]);
    setSort("updated-desc");
  };

  const patchReport = (id: string, patch: Partial<KbReport>) => {
    setReports((current) =>
      current.map((report) =>
        report.id === id ? { ...report, ...patch } : report,
      ),
    );
    setSelected((current) =>
      current && current.id === id ? { ...current, ...patch } : current,
    );
  };

  const downloadReport = (report: KbReport) => {
    if (report.status === "generating") {
      toast({
        title: "Still generating",
        description: `${report.code} will be ready shortly.`,
      });
      return;
    }
    if (report.kind === "executive") {
      const filename = downloadExecutiveBoardPack();
      toast({
        title: "Board pack downloaded",
        description: filename,
      });
      return;
    }
    if (report.status === "scheduled") {
      toast({
        title: "Scheduled report",
        description: `${report.code} · ${report.generatedLabel}`,
      });
      return;
    }
    downloadTextFile({
      filename: `${report.code}.md`,
      content: reportMarkdown(report),
      mimeType: "text/markdown;charset=utf-8",
    });
    toast({
      title: "Downloaded",
      description: `${report.code} · ${report.sizeLabel}`,
    });
  };

  const regenerateReport = (report: KbReport) => {
    patchReport(report.id, {
      status: "generating",
      generatedLabel: "Generating…",
      updatedAt: new Date().toISOString().slice(0, 10),
    });
    toast({
      title: "Regeneration started",
      description: report.code,
    });
    window.setTimeout(() => {
      patchReport(report.id, {
        status: "ready",
        generatedLabel: "Generated just now",
        sizeLabel: "1.2 MB",
        updatedAt: new Date().toISOString().slice(0, 10),
      });
      toast({
        title: "Report ready",
        description: `${report.code} regenerated.`,
      });
    }, 800);
  };

  const scheduleReport = (report: KbReport) => {
    const patch: Partial<KbReport> = {
      status: "scheduled",
      generatedLabel: "Next run in 7 days",
      updatedAt: new Date().toISOString().slice(0, 10),
    };
    patchReport(report.id, patch);
    if (!selected || selected.id !== report.id) {
      setSelected({ ...report, ...patch });
    }
    toast({
      title: "Schedule updated",
      description: `${report.code} · next run in 7 days.`,
    });
  };

  const submitGenerate = () => {
    const title = newTitle.trim();
    if (!title) {
      toast({
        title: "Title required",
        description: "Enter a report title to generate an export.",
      });
      return;
    }
    const stamp = Date.now();
    const seq = String(reports.length + 1).padStart(2, "0");
    const created: KbReport = {
      id: `rpt-${stamp}`,
      code: `RPT-${kindCodePrefix[newKind]}-${seq}`,
      title,
      summary: `Fresh ${kbReportKindLabels[newKind].toLowerCase()} export covering the current SOC window.`,
      kind: newKind,
      status: "ready",
      ownerId: "riya-sharma",
      periodLabel: "Last 7 days",
      generatedLabel: "Generated just now",
      sizeLabel: "840 KB",
      related: [
        { label: "Compliance", href: "/compliance" },
        { label: "Incidents", href: "/incidents/list" },
      ],
      updatedAt: new Date().toISOString().slice(0, 10),
    };
    setReports((current) => [created, ...current]);
    setSelected(created);
    setGenerateOpen(false);
    setNewTitle("");
    setNewKind("incident");
    toast({
      title: "Report ready",
      description: `${created.code} is open in the report sheet.`,
    });
  };

  const visibleReports = useMemo(() => {
    const normalized = deferredSearchQuery.trim().toLowerCase();

    return reports
      .filter((report) => {
        if (kindFilters.length > 0 && !kindFilters.includes(report.kind)) {
          return false;
        }
        if (
          statusFilters.length > 0 &&
          !statusFilters.includes(report.status)
        ) {
          return false;
        }
        if (!normalized) return true;

        return [
          report.code,
          report.title,
          report.summary,
          kbReportKindLabels[report.kind],
          report.periodLabel,
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalized);
      })
      .sort((a, b) => {
        if (sort === "title-asc") return a.title.localeCompare(b.title);
        if (sort === "kind")
          return kbReportKindLabels[a.kind].localeCompare(
            kbReportKindLabels[b.kind],
          );
        return b.updatedAt.localeCompare(a.updatedAt);
      });
  }, [deferredSearchQuery, kindFilters, reports, sort, statusFilters]);

  useEffect(() => {
    setPage(1);
  }, [deferredSearchQuery, kindFilters, statusFilters, sort, pageSize]);

  const pageCount = Math.max(1, Math.ceil(visibleReports.length / pageSize));
  const safePage = Math.min(page, pageCount);
  const pagedReports = paginateItems(visibleReports, safePage, pageSize);
  const stats = getReportStats();

  return (
    <main
      id="main-content"
      className="bg-background flex min-h-0 flex-1 flex-col overflow-hidden"
    >
      <div className="bg-background shrink-0 border-b">
        <div className="flex flex-col gap-2 px-4 py-3 sm:px-6 lg:min-h-14 lg:flex-row lg:items-center lg:justify-between lg:gap-4 lg:py-2">
          <div className="min-w-0 flex-1">
            <InputGroup className="h-9 w-full lg:max-w-sm">
              <InputGroupAddon>
                <Search />
              </InputGroupAddon>
              <InputGroupInput
                value={searchQuery}
                placeholder="Search reports, audit logs, packs..."
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </InputGroup>
          </div>

          <div className="flex min-w-0 flex-wrap items-center gap-2 lg:justify-end">
            <ReportFilterControl
              kindFilters={kindFilters}
              statusFilters={statusFilters}
              sort={sort}
              activeFilterCount={activeFilterCount}
              onToggleKind={toggleKind}
              onToggleStatus={toggleStatus}
              onSetSort={setSort}
              onClearFilters={resetFilters}
            />
            <Button
              variant="outline"
              size="sm"
              className={cn("h-9 gap-1.5", mutedControlClassName)}
              asChild
            >
              <Link href="/compliance">
                <Scale className="size-3.5" />
                <span className="hidden sm:inline">Compliance</span>
              </Link>
            </Button>
            <Button
              size="sm"
              className="h-9 gap-1.5"
              onClick={() => setGenerateOpen(true)}
            >
              <Plus className="size-3.5" />
              <span className="hidden sm:inline">Generate report</span>
              <span className="sm:hidden">Generate</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6">
        <div className="mx-auto flex w-full flex-col gap-4">
          <KbStatsStrip stats={stats} />

          <div className="border-border/70 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-dashed px-3 py-2.5">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <FileBarChart className="text-muted-foreground size-3.5 shrink-0" />
              <p className="text-muted-foreground text-xs">
                Executive board pack is available as a one-click Markdown export.
                Compliance activity also links{" "}
                <Link
                  href="/compliance"
                  className="text-foreground font-medium underline-offset-2 hover:underline"
                >
                  Compliance
                </Link>
                .
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              className={cn("h-8 gap-1.5", mutedControlClassName)}
              onClick={() => {
                const filename = downloadExecutiveBoardPack();
                toast({
                  title: "Board pack downloaded",
                  description: filename,
                });
              }}
            >
              <Download className="size-3.5" />
              Download board pack
            </Button>
          </div>

          {pagedReports.length === 0 ? (
            <EmptyState
              icon={FileBarChart}
              title="No reports match"
              description="Try a different type or status, or clear filters to see scheduled deliveries."
              action={
                <Button variant="outline" size="sm" onClick={resetFilters}>
                  Reset filters
                </Button>
              }
            />
          ) : (
            <div className="bg-card overflow-hidden rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-[36%]">Report</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden md:table-cell">
                      Period
                    </TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead className="hidden lg:table-cell text-right">
                      Size
                    </TableHead>
                    <TableHead className="w-12" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pagedReports.map((report) => (
                    <TableRow
                      key={report.id}
                      className="cursor-pointer"
                      onClick={() => setSelected(report)}
                    >
                      <TableCell>
                        <div className="min-w-0 space-y-1">
                          <span className="text-muted-foreground font-mono text-[11px]">
                            {report.code}
                          </span>
                          <p className="text-sm font-medium">{report.title}</p>
                          <p className="text-muted-foreground line-clamp-1 text-xs">
                            {report.summary}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className="rounded-full font-medium"
                        >
                          {kbReportKindLabels[report.kind]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <ReportStatusBadge status={report.status} />
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="space-y-0.5">
                          <p className="text-sm">{report.periodLabel}</p>
                          <p className="text-muted-foreground text-[11px]">
                            {report.generatedLabel}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <OwnerCell
                          userId={report.ownerId}
                          href={`/administration/users/${report.ownerId}`}
                        />
                      </TableCell>
                      <TableCell className="hidden text-right text-sm tabular-nums lg:table-cell">
                        {report.sizeLabel}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8"
                              onClick={(event) => event.stopPropagation()}
                              aria-label="Report actions"
                            >
                              <Ellipsis className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem
                              onClick={(event) => {
                                event.stopPropagation();
                                downloadReport(report);
                              }}
                            >
                              <Download className="size-3.5" />
                              Download
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(event) => {
                                event.stopPropagation();
                                regenerateReport(report);
                              }}
                            >
                              <RefreshCw className="size-3.5" />
                              Regenerate
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(event) => {
                                event.stopPropagation();
                                scheduleReport(report);
                              }}
                            >
                              <CalendarClock className="size-3.5" />
                              Schedule
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {report.related.slice(0, 2).map((link) => (
                              <DropdownMenuItem key={link.href} asChild>
                                <Link
                                  href={link.href}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {link.label}
                                </Link>
                              </DropdownMenuItem>
                            ))}
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
                total={visibleReports.length}
                onPageChange={setPage}
                onPageSizeChange={setPageSize}
              />
            </div>
          )}
        </div>
      </div>

      <Dialog
        open={generateOpen}
        onOpenChange={(open) => {
          setGenerateOpen(open);
          if (!open) {
            setNewTitle("");
            setNewKind("incident");
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Generate report</DialogTitle>
            <DialogDescription>
              Build a fresh export from incidents, alerts, and audit activity.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="report-title">Title</Label>
              <Input
                id="report-title"
                value={newTitle}
                placeholder="e.g. Weekly IR summary"
                onChange={(event) => setNewTitle(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    submitGenerate();
                  }
                }}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="report-kind">Type</Label>
              <Select
                value={newKind}
                onValueChange={(value) => setNewKind(value as KbReportKind)}
              >
                <SelectTrigger id="report-kind" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(kbReportKindLabels) as KbReportKind[]).map(
                    (kind) => (
                      <SelectItem key={kind} value={kind}>
                        {kbReportKindLabels[kind]}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGenerateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitGenerate}>Generate</Button>
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
                  <Badge variant="secondary" className="rounded-full">
                    {kbReportKindLabels[selected.kind]}
                  </Badge>
                  <ReportStatusBadge status={selected.status} />
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs">Period</p>
                    <p className="font-medium">{selected.periodLabel}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Size</p>
                    <p className="font-medium tabular-nums">
                      {selected.sizeLabel}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-muted-foreground text-xs">Generated</p>
                    <p className="font-medium">{selected.generatedLabel}</p>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                    Owner
                  </p>
                  <OwnerCell
                    userId={selected.ownerId}
                    href={`/administration/users/${selected.ownerId}`}
                  />
                </div>
                <div className="space-y-1.5">
                  <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                    Scope links
                  </p>
                  <RelatedLinks links={selected.related} />
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  <Button
                    size="sm"
                    className="gap-1.5"
                    onClick={() => downloadReport(selected)}
                  >
                    <Download className="size-3.5" />
                    Download
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn("gap-1.5", mutedControlClassName)}
                    onClick={() => regenerateReport(selected)}
                  >
                    <RefreshCw className="size-3.5" />
                    Regenerate
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
