"use client";

import {
  Bookmark,
  BookmarkPlus,
  Crosshair,
  ExternalLink,
  History,
  MonitorSmartphone,
  MoreHorizontal,
  Play,
  Search,
  Siren,
  Trash2,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { AssistChat } from "@/components/assist/assist-chat";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { investigateApi } from "@/lib/mock-api/investigate";
import { getTelemetrySource } from "@/lib/source-registry";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

import {
  eventEntity,
  formatEventTime,
  type InvestigateEvent,
  type InvestigateSeverity,
  investigateSeverityLabels,
  investigateSourceOptions,
  queryTemplates,
  timeRangeOptions,
  type TimeRangeValue,
  translateQuery,
} from "./investigate-data";
import { useInvestigateSession } from "./investigate-session";

const severityTones: Record<InvestigateSeverity, string> = {
  critical:
    "border-destructive/30 bg-destructive/10 text-destructive dark:text-red-400",
  high: "border-orange-500/30 bg-orange-500/10 text-orange-700 dark:text-orange-400",
  medium:
    "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  low: "border-border bg-muted text-muted-foreground",
};

function SeverityBadge({ severity }: { severity: InvestigateSeverity }) {
  return (
    <Badge
      variant="outline"
      className={cn("rounded-full font-medium", severityTones[severity])}
    >
      {investigateSeverityLabels[severity]}
    </Badge>
  );
}

type InvestigateCenterProps = {
  /** When true, open with saved searches panel emphasized. */
  savedFocus?: boolean;
  initialQuery?: string | null;
};

export function InvestigateCenter({
  savedFocus = false,
  initialQuery = null,
}: InvestigateCenterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    savedSearches,
    recentQueries,
    queryHistory,
    lastResults,
    lastQuery,
    lastSourceIds,
    saveSearch,
    deleteSavedSearch,
  } = useInvestigateSession();

  const urlQuery = searchParams.get("q") ?? initialQuery ?? "";
  const urlSources = searchParams.get("sources");

  const [query, setQuery] = useState(urlQuery || lastQuery || "");
  const [sourceIds, setSourceIds] = useState<string[]>(() => {
    if (urlSources) {
      const parsed = urlSources
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      if (parsed.length > 0) return parsed;
    }
    return lastSourceIds.length > 0
      ? lastSourceIds
      : investigateSourceOptions.slice(0, 5).map((s) => s.id);
  });
  const [timeRange, setTimeRange] = useState<TimeRangeValue>("24h");
  const [previewTab, setPreviewTab] = useState<"ql" | "spl" | "kql">("ql");
  const [results, setResults] = useState<InvestigateEvent[]>(lastResults);
  const [hasRun, setHasRun] = useState(lastResults.length > 0);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showSaved, setShowSaved] = useState(savedFocus);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    const q = searchParams.get("q");
    if (q != null) setQuery(q);
    const sources = searchParams.get("sources");
    if (sources) {
      const parsed = sources
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      if (parsed.length > 0) setSourceIds(parsed);
    }
  }, [searchParams]);

  const translation = useMemo(() => translateQuery(query), [query]);

  const toggleSource = (id: string) => {
    setSourceIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  };

  const runQuery = async (
    overrideQuery?: string,
    overrideSources?: string[],
  ) => {
    const q = (overrideQuery ?? query).trim();
    if (!q) {
      toast({
        title: "Enter a query",
        description: "Heimdall QL cannot be empty.",
        variant: "destructive",
      });
      return;
    }
    const sources = overrideSources ?? sourceIds;
    setRunning(true);
    try {
      const { events, receipt } = await investigateApi.run({
        query: q,
        sourceIds: sources,
        timeRange,
      });
      setQuery(q);
      setResults(events);
      setHasRun(true);
      setSelectedIds([]);
      toast({
        title: "Query complete",
        description: `${events.length} events · ${sources.length || "all"} sources · ${timeRange} · ${receipt.outcome}`,
      });
    } catch (error) {
      toast({
        title: "Query failed",
        description:
          error instanceof Error ? error.message : "Unable to run query",
        variant: "destructive",
      });
    } finally {
      setRunning(false);
    }
  };

  const pivotEntity = (event: InvestigateEvent) => {
    const value = event.hostname ?? event.identity;
    if (!value) return;
    const field = event.hostname ? "hostname" : "identity";
    const refined = `events | where ${field} == "${value}" | take 50`;
    setQuery(refined);
    void runQuery(refined, sourceIds);
    toast({
      title: "Entity pivot",
      description: `Refined query on ${field} = ${value}`,
    });
  };

  const openInSource = (event: InvestigateEvent) => {
    const source = getTelemetrySource(event.sourceId);
    const hint = source?.nativeQueryHint ?? "native console";
    const deepLink = `heimdall://source/${event.sourceId}/event/${encodeURIComponent(event.id)}?lang=${hint}`;
    toast({
      title: "Open in source",
      description: `${source?.name ?? event.sourceName} · ${String(hint).toUpperCase()} deep-link — ${deepLink}`,
    });
  };

  const applyTemplate = (templateId: string) => {
    const template = queryTemplates.find((t) => t.id === templateId);
    if (!template) return;
    setQuery(template.heimdallQl);
    setSourceIds(template.sourceIds);
    setPreviewTab("ql");
    router.replace(
      `/investigate?q=${encodeURIComponent(template.heimdallQl)}`,
      { scroll: false },
    );
  };

  const loadSaved = (id: string) => {
    const saved = savedSearches.find((s) => s.id === id);
    if (!saved) return;
    setQuery(saved.query);
    setSourceIds(saved.sourceIds);
    void runQuery(saved.query, saved.sourceIds);
  };

  const handleSaveSearch = () => {
    const trimmed = query.trim();
    if (!trimmed) {
      toast({ title: "Nothing to save", variant: "destructive" });
      return;
    }
    const name =
      translation.template?.name ??
      `Search ${new Date().toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    const saved = saveSearch({
      name,
      query: trimmed,
      sourceIds,
    });
    setShowSaved(true);
    toast({
      title: "Search saved",
      description: saved.name,
    });
  };

  const openAsAlert = (events: InvestigateEvent[]) => {
    if (events.length === 0) return;
    const primary = events[0]!;
    const alertId = `ALT-INV-${primary.id.replace(/\W/g, "").slice(-6)}`;
    toast({
      title: "Opened as alert",
      description: (
        <span className="inline-flex flex-col gap-1">
          <span>
            {events.length === 1
              ? primary.message
              : `${events.length} events correlated into ${alertId}`}
          </span>
          <Link
            href={`/alerts/${alertId}`}
            className="text-primary underline-offset-2 hover:underline"
          >
            View {alertId}
          </Link>
        </span>
      ),
    });
  };

  const addToIncident = (events: InvestigateEvent[]) => {
    if (events.length === 0) return;
    toast({
      title: "Added to incident",
      description: `${events.length} event${events.length === 1 ? "" : "s"} queued for INC-draft.`,
    });
  };

  const toggleSelected = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === results.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(results.map((r) => r.id));
    }
  };

  const selectedEvents = results.filter((r) => selectedIds.includes(r.id));

  const previewBody =
    previewTab === "ql"
      ? query || "// Enter Heimdall QL…"
      : previewTab === "spl"
        ? translation.spl
        : translation.kql;

  return (
    <main
      id="main-content"
      className="bg-background flex min-h-0 flex-1 flex-col overflow-hidden"
    >
      <div className="bg-background shrink-0 border-b px-4 py-3 sm:px-6">
        <div className="flex flex-wrap items-center justify-end gap-2">
            <AssistChat investigateQuery={query} />
            <Button
              variant={showSaved ? "secondary" : "outline"}
              size="sm"
              className="h-9 gap-1.5"
              onClick={() => setShowSaved((v) => !v)}
            >
              <Bookmark className="size-3.5" />
              Saved
              <Badge variant="secondary" className="ml-0.5 rounded-full px-1.5">
                {savedSearches.length}
                {queryHistory.length > 0 ? ` · ${queryHistory.length}` : ""}
              </Badge>
              {queryHistory.length > 0 ? (
                <Badge variant="outline" className="ml-0.5 rounded-full px-1.5">
                  <History className="mr-0.5 size-2.5" />
                  {queryHistory.length}
                </Badge>
              ) : null}
            </Button>
            <Select
              value={timeRange}
              onValueChange={(value) => setTimeRange(value as TimeRangeValue)}
            >
              <SelectTrigger className="h-9 w-[160px]">
                <SelectValue placeholder="Time range" />
              </SelectTrigger>
              <SelectContent>
                {timeRangeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              size="sm"
              className="h-9 gap-1.5"
              disabled={running}
              onClick={() => void runQuery()}
            >
              <Play className="size-3.5" />
              {running ? "Running…" : "Run"}
            </Button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1">
        {showSaved ? (
          <aside className="border-border/70 bg-muted/20 hidden w-64 shrink-0 flex-col border-r md:flex lg:w-72">
            <div className="flex items-center justify-between border-b px-3 py-2.5">
              <p className="text-sm font-medium">Saved searches</p>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={handleSaveSearch}
              >
                <BookmarkPlus className="size-3.5" />
              </Button>
            </div>
            <ScrollArea className="flex-1">
              <div className="space-y-1 p-2">
                {savedSearches.length === 0 ? (
                  <p className="text-muted-foreground px-2 py-4 text-xs">
                    No saved searches yet.
                  </p>
                ) : (
                  savedSearches.map((saved) => (
                    <div
                      key={saved.id}
                      className="hover:bg-muted/60 group flex items-start gap-1 rounded-md border border-transparent px-2 py-2 transition-colors hover:border-border"
                    >
                      <button
                        type="button"
                        className="min-w-0 flex-1 text-left"
                        onClick={() => loadSaved(saved.id)}
                      >
                        <p className="truncate text-sm font-medium">
                          {saved.name}
                        </p>
                        <p className="text-muted-foreground mt-0.5 line-clamp-2 font-mono text-[10px]">
                          {saved.query}
                        </p>
                      </button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground size-7 shrink-0 opacity-0 group-hover:opacity-100"
                        onClick={() => {
                          deleteSavedSearch(saved.id);
                          toast({ title: "Saved search deleted" });
                        }}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  ))
                )}

                {recentQueries.length > 0 ? (
                  <div className="pt-3">
                    <p className="text-muted-foreground px-2 pb-1 text-[10px] font-medium tracking-wide uppercase">
                      Recent
                    </p>
                    {recentQueries.slice(0, 5).map((recent) => (
                      <button
                        key={recent}
                        type="button"
                        className="hover:bg-muted/60 text-muted-foreground w-full truncate rounded-md px-2 py-1.5 text-left font-mono text-[10px]"
                        onClick={() => {
                          setQuery(recent);
                          void runQuery(recent);
                        }}
                      >
                        {recent}
                      </button>
                    ))}
                  </div>
                ) : null}

                {queryHistory.length > 0 ? (
                  <div className="pt-3">
                    <p className="text-muted-foreground flex items-center gap-1 px-2 pb-1 text-[10px] font-medium tracking-wide uppercase">
                      <History className="size-3" />
                      Query history
                    </p>
                    {queryHistory.slice(0, 8).map((entry) => (
                      <button
                        key={entry.id}
                        type="button"
                        className="hover:bg-muted/60 w-full rounded-md px-2 py-1.5 text-left transition-colors"
                        onClick={() => {
                          setQuery(entry.query);
                          setSourceIds(entry.sourceIds);
                          void runQuery(entry.query, entry.sourceIds);
                        }}
                      >
                        <p className="text-muted-foreground truncate font-mono text-[10px]">
                          {entry.query}
                        </p>
                        <p className="text-muted-foreground mt-0.5 text-[10px] tabular-nums">
                          {entry.hitCount} hits · {entry.timeRange} ·{" "}
                          {new Date(entry.at).toLocaleTimeString(undefined, {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            </ScrollArea>
          </aside>
        ) : null}

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <section className="space-y-3 border-b px-4 py-3 sm:px-6">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-muted-foreground mr-1 text-[10px] font-medium tracking-wide uppercase">
                  NDR / network
                </span>
                {queryTemplates
                  .filter((t) =>
                    ["ndr-beacon", "fw-deny-spike", "dns-tunnel", "beaconing"].includes(
                      t.id,
                    ),
                  )
                  .map((template) => (
                    <button
                      key={`ndr-${template.id}`}
                      type="button"
                      onClick={() => applyTemplate(template.id)}
                      className={cn(
                        "border-border bg-background hover:bg-accent inline-flex h-7 items-center rounded-md border px-2 text-xs transition-colors",
                        translation.template?.id === template.id &&
                          "border-foreground/40 bg-muted",
                      )}
                      title={template.description}
                    >
                      {template.name}
                    </button>
                  ))}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {queryTemplates.map((template) => (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => applyTemplate(template.id)}
                    className={cn(
                      "border-border bg-background hover:bg-accent inline-flex h-7 items-center rounded-md border px-2 text-xs transition-colors",
                      translation.template?.id === template.id &&
                        "border-foreground/40 bg-muted",
                    )}
                    title={template.description}
                  >
                    {template.name}
                  </button>
                ))}
              </div>
            </div>

            <Tabs
              value={previewTab}
              onValueChange={(value) =>
                setPreviewTab(value as "ql" | "spl" | "kql")
              }
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <TabsList className="h-8">
                  <TabsTrigger value="ql" className="text-xs">
                    Heimdall QL
                  </TabsTrigger>
                  <TabsTrigger value="spl" className="text-xs">
                    SPL preview
                  </TabsTrigger>
                  <TabsTrigger value="kql" className="text-xs">
                    KQL preview
                  </TabsTrigger>
                </TabsList>
                {translation.template ? (
                  <span className="text-muted-foreground text-xs">
                    Matched template: {translation.template.name}
                  </span>
                ) : (
                  <span className="text-muted-foreground text-xs">
                    Generic translation
                  </span>
                )}
              </div>

              <TabsContent value="ql" className="mt-2">
                <Textarea
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  onKeyDown={(event) => {
                    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
                      event.preventDefault();
                      void runQuery();
                    }
                  }}
                  placeholder='identity.login | where …  (⌘/Ctrl+Enter to run)'
                  className="min-h-[96px] font-mono text-xs leading-relaxed md:text-xs"
                  spellCheck={false}
                />
              </TabsContent>
              <TabsContent value="spl" className="mt-2">
                <pre className="bg-muted/40 border-border max-h-36 overflow-auto rounded-md border p-3 font-mono text-xs leading-relaxed whitespace-pre-wrap">
                  {previewBody}
                </pre>
              </TabsContent>
              <TabsContent value="kql" className="mt-2">
                <pre className="bg-muted/40 border-border max-h-36 overflow-auto rounded-md border p-3 font-mono text-xs leading-relaxed whitespace-pre-wrap">
                  {previewBody}
                </pre>
              </TabsContent>
            </Tabs>

            <div className="space-y-1.5">
              <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                Sources
              </p>
              <div className="flex flex-wrap gap-1.5">
                {investigateSourceOptions.map((source) => {
                  const active = sourceIds.includes(source.id);
                  return (
                    <button
                      key={source.id}
                      type="button"
                      onClick={() => toggleSource(source.id)}
                      className={cn(
                        "inline-flex h-7 items-center gap-1.5 rounded-md border px-2 text-xs transition-colors",
                        active
                          ? "border-foreground/40 bg-foreground text-background"
                          : "border-border bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                      )}
                    >
                      <span
                        className={cn(
                          "size-1.5 rounded-full",
                          source.health === "healthy" && "bg-emerald-500",
                          source.health === "degraded" && "bg-amber-500",
                          source.health === "failed" && "bg-red-500",
                          source.health === "paused" && "bg-zinc-400",
                        )}
                      />
                      {source.shortName}
                    </button>
                  );
                })}
                <button
                  type="button"
                  className="text-muted-foreground hover:text-foreground h-7 px-1 text-xs underline-offset-2 hover:underline"
                  onClick={() =>
                    setSourceIds(investigateSourceOptions.map((s) => s.id))
                  }
                >
                  All
                </button>
                <button
                  type="button"
                  className="text-muted-foreground hover:text-foreground h-7 px-1 text-xs underline-offset-2 hover:underline"
                  onClick={() => setSourceIds([])}
                >
                  Clear
                </button>
              </div>
            </div>
          </section>

          <div className="flex flex-wrap items-center gap-2 border-b px-4 py-2 sm:px-6">
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <Search className="size-3.5" />
              {hasRun ? (
                <span>
                  <span className="text-foreground font-semibold tabular-nums">
                    {results.length}
                  </span>{" "}
                  events
                </span>
              ) : (
                <span>Run a query to see events</span>
              )}
            </div>
            <div className="ml-auto flex flex-wrap items-center gap-1.5">
              {selectedIds.length > 0 ? (
                <>
                  <span className="text-muted-foreground mr-1 text-xs tabular-nums">
                    {selectedIds.length} selected
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1.5 text-xs"
                    onClick={() => openAsAlert(selectedEvents)}
                  >
                    <Siren className="size-3.5" />
                    Open as alert
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1.5 text-xs"
                    onClick={() => addToIncident(selectedEvents)}
                  >
                    Add to incident
                  </Button>
                  {selectedEvents.length === 1 ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 gap-1.5 text-xs"
                      onClick={() => openInSource(selectedEvents[0]!)}
                    >
                      <ExternalLink className="size-3.5" />
                      Open in source
                    </Button>
                  ) : null}
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1.5 text-xs"
                    asChild
                  >
                    <Link href="/threat-hunting/hunts">
                      <Crosshair className="size-3.5" />
                      Start hunt
                    </Link>
                  </Button>
                </>
              ) : null}
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 text-xs"
                onClick={handleSaveSearch}
              >
                <BookmarkPlus className="size-3.5" />
                Save search
              </Button>
            </div>
          </div>

          <ScrollArea className="min-h-0 flex-1">
            <div className="px-2 sm:px-4">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-10">
                      <Checkbox
                        checked={
                          results.length > 0 &&
                          selectedIds.length === results.length
                        }
                        onCheckedChange={toggleSelectAll}
                        aria-label="Select all"
                        disabled={results.length === 0}
                      />
                    </TableHead>
                    <TableHead className="w-[140px]">Timestamp</TableHead>
                    <TableHead className="w-[100px]">Source</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead className="w-[160px]">Entity</TableHead>
                    <TableHead className="w-[100px]">Severity</TableHead>
                    <TableHead className="w-12" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!hasRun ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-muted-foreground h-32 text-center text-sm"
                      >
                        Pick a template or write Heimdall QL, then Run.
                      </TableCell>
                    </TableRow>
                  ) : results.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-muted-foreground h-32 text-center text-sm"
                      >
                        No events matched.
                      </TableCell>
                    </TableRow>
                  ) : (
                    results.map((event) => (
                      <TableRow
                        key={event.id}
                        data-state={
                          selectedIds.includes(event.id) ? "selected" : undefined
                        }
                        className="text-sm"
                      >
                        <TableCell>
                          <Checkbox
                            checked={selectedIds.includes(event.id)}
                            onCheckedChange={() => toggleSelected(event.id)}
                            aria-label={`Select ${event.id}`}
                          />
                        </TableCell>
                        <TableCell className="text-muted-foreground font-mono text-xs tabular-nums">
                          {formatEventTime(event.timestamp)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="font-normal"
                            title={event.sourceId}
                          >
                            {event.sourceName}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-[420px]">
                          <p className="truncate" title={event.message}>
                            {event.message}
                          </p>
                          <p className="text-muted-foreground font-mono text-[10px]">
                            {event.id}
                          </p>
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {event.hostname || event.identity ? (
                            <button
                              type="button"
                              className="text-primary hover:underline"
                              title="Pivot query to this entity"
                              onClick={() => pivotEntity(event)}
                            >
                              {eventEntity(event)}
                            </button>
                          ) : (
                            eventEntity(event)
                          )}
                        </TableCell>
                        <TableCell>
                          <SeverityBadge severity={event.severity} />
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-8"
                              >
                                <MoreHorizontal className="size-4" />
                                <span className="sr-only">Actions</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onSelect={() => openAsAlert([event])}
                              >
                                <Siren className="size-3.5" />
                                Open as alert
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onSelect={() => addToIncident([event])}
                              >
                                Add to incident
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {event.hostname ? (
                                <DropdownMenuItem
                                  onSelect={() => pivotEntity(event)}
                                >
                                  <MonitorSmartphone className="size-3.5" />
                                  Pivot query · hostname
                                </DropdownMenuItem>
                              ) : null}
                              {event.identity ? (
                                <DropdownMenuItem
                                  onSelect={() => pivotEntity(event)}
                                >
                                  <UserRound className="size-3.5" />
                                  Pivot query · identity
                                </DropdownMenuItem>
                              ) : null}
                              {event.hostname ? (
                                <DropdownMenuItem asChild>
                                  <Link
                                    href={`/assets/devices?q=${encodeURIComponent(event.hostname)}`}
                                  >
                                    <MonitorSmartphone className="size-3.5" />
                                    Open asset
                                  </Link>
                                </DropdownMenuItem>
                              ) : null}
                              {event.identity ? (
                                <DropdownMenuItem asChild>
                                  <Link
                                    href={`/assets/identities?q=${encodeURIComponent(event.identity)}`}
                                  >
                                    <UserRound className="size-3.5" />
                                    Open identity
                                  </Link>
                                </DropdownMenuItem>
                              ) : null}
                              <DropdownMenuItem
                                onSelect={() => openInSource(event)}
                              >
                                <ExternalLink className="size-3.5" />
                                Open in source
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href="/threat-hunting/hunts">
                                  <Crosshair className="size-3.5" />
                                  Start hunt
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onSelect={handleSaveSearch}>
                                <BookmarkPlus className="size-3.5" />
                                Save search
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </ScrollArea>
        </div>
      </div>
    </main>
  );
}
