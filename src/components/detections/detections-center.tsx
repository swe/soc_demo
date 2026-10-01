"use client";

import {
  Copy,
  Crosshair,
  FlaskConical,
  Plus,
  Radar,
  Rocket,
  Search,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDeferredValue, useMemo, useState } from "react";

import { DetectionMarketplace } from "@/components/detections/detection-marketplace";
import {
  buildInvestigateQueryForRule,
  detectionDeployStateLabels,
  type DetectionRule,
  type DetectionStatus,
  detectionStatusLabels,
  type DetectionTestHit,
  lineageSourceLabels,
} from "@/components/detections/detections-data";
import { useDetectionsSession } from "@/components/detections/detections-session";
import { buildInvestigateHref } from "@/components/investigate/investigate-data";
import {
  DEFAULT_PAGE_SIZE,
  ListPagination,
  paginateItems,
} from "@/components/list-pagination";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
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
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { detectionsApi } from "@/lib/mock-api/detections";
import { getTelemetrySource } from "@/lib/source-registry";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

function SeverityBadge({ severity }: { severity: DetectionRule["severity"] }) {
  const tones: Record<DetectionRule["severity"], string> = {
    critical:
      "border-severity-critical/40 bg-severity-critical/10 text-severity-critical-text",
    high: "border-severity-high/40 bg-severity-high/10 text-severity-high-text",
    medium:
      "border-severity-medium/40 bg-severity-medium/10 text-severity-medium-text",
    low: "border-severity-low/40 bg-severity-low/10 text-severity-low-text",
  };
  return (
    <Badge variant="outline" className={cn("capitalize", tones[severity])}>
      {severity}
    </Badge>
  );
}

function formatHitTime(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function DetectionsCenter() {
  const router = useRouter();
  const { rules, stats, create } = useDetectionsSession();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<DetectionStatus | "all">(
    "all",
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [testHits, setTestHits] = useState<DetectionTestHit[] | null>(null);
  const [testing, setTesting] = useState(false);
  const [busy, setBusy] = useState(false);
  const [draftBody, setDraftBody] = useState<string | null>(null);
  const [view, setView] = useState<"library" | "marketplace">("library");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const deferredSearch = useDeferredValue(search);

  const filtered = useMemo(() => {
    const q = deferredSearch.trim().toLowerCase();
    return rules.filter((rule) => {
      if (statusFilter !== "all" && rule.status !== statusFilter) return false;
      if (!q) return true;
      return [
        rule.id,
        rule.name,
        rule.mitreTactic,
        rule.mitreTechnique,
        rule.ownerName,
        rule.lineageSource ?? "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [deferredSearch, statusFilter, rules]);

  const paged = useMemo(
    () => paginateItems(filtered, page, pageSize),
    [filtered, page, pageSize],
  );

  const selected = selectedId
    ? (rules.find((rule) => rule.id === selectedId) ?? null)
    : null;

  const bodyValue = draftBody ?? selected?.ruleBody ?? "";

  const investigateHref = selected
    ? buildInvestigateHref(
        buildInvestigateQueryForRule({
          ...selected,
          ruleBody: bodyValue || selected.ruleBody,
        }),
        selected.enabledSourceIds,
      )
    : "/investigate";

  const selectRule = (id: string) => {
    setSelectedId(id);
    setTestHits(null);
    setDraftBody(null);
  };

  const toggleStatus = async (status: DetectionStatus) => {
    if (!selected) return;
    setBusy(true);
    try {
      const { rule, receipt } = await detectionsApi.setStatus(
        selected.id,
        status,
      );
      if (!rule) {
        toast({
          title: "Status update failed",
          description: receipt.message,
          variant: "destructive",
        });
        return;
      }
      toast({
        title:
          status === "enabled"
            ? "Detection enabled"
            : status === "disabled"
              ? "Detection disabled"
              : "Detection updated",
        description: `${receipt.message} · ${receipt.id}`,
      });
    } finally {
      setBusy(false);
    }
  };

  const handleCreate = () => {
    const rule = create({
      name: "New Heimdall detection",
      status: "experimental",
      severity: "medium",
    });
    selectRule(rule.id);
    toast({
      title: "Detection created",
      description: `${rule.id} drafted as experimental.`,
    });
  };

  const handleClone = async () => {
    if (!selected) return;
    setBusy(true);
    try {
      const { rule, receipt } = await detectionsApi.clone(selected.id);
      if (!rule) {
        toast({
          title: "Clone failed",
          description: receipt.message,
          variant: "destructive",
        });
        return;
      }
      selectRule(rule.id);
      toast({
        title: "Detection cloned",
        description: `${receipt.message} · ${receipt.id}`,
      });
    } finally {
      setBusy(false);
    }
  };

  const handleTestRule = async () => {
    if (!selected) return;
    setTesting(true);
    try {
      const { hits, receipt } = await detectionsApi.testAgainstCorpus(
        selected.id,
      );
      setTestHits(hits);
      toast({
        title: "Test rule complete",
        description: `${hits.length} corpus hit${hits.length === 1 ? "" : "s"} · ${receipt.id}`,
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSaveBody = async () => {
    if (!selected || draftBody === null) return;
    setBusy(true);
    try {
      const { rule, receipt } = await detectionsApi.updateRuleBody(
        selected.id,
        draftBody,
      );
      if (!rule) {
        toast({
          title: "Save failed",
          description: receipt.message,
          variant: "destructive",
        });
        return;
      }
      setDraftBody(null);
      toast({
        title: "Rule body saved",
        description: `${receipt.message} · ${receipt.id}`,
      });
    } finally {
      setBusy(false);
    }
  };

  const handlePromoteToHunt = async () => {
    if (!selected) return;
    setBusy(true);
    try {
      const { hunt, receipt } = await detectionsApi.promoteToHunt(selected.id);
      if (!hunt) {
        toast({
          title: "Promote failed",
          description: receipt.message,
          variant: "destructive",
        });
        return;
      }
      toast({
        title: "Promoted to hunt",
        description: `${hunt.id} drafted · ${receipt.id}`,
      });
      router.push(`/threat-hunting/hunts?hunt=${hunt.id}`);
    } finally {
      setBusy(false);
    }
  };

  const deploySourceId = selected?.enabledSourceIds[0] ?? "int-splunk-core";

  const handleStageDeploy = async () => {
    if (!selected) return;
    setBusy(true);
    try {
      const { receipt } = await detectionsApi.stageDeploy(
        selected.id,
        deploySourceId,
      );
      toast({
        title:
          receipt.outcome === "failed" ? "Stage failed" : "Staged for SIEM",
        description: `${receipt.message} · ${receipt.id}`,
        variant: receipt.outcome === "failed" ? "destructive" : "default",
      });
    } finally {
      setBusy(false);
    }
  };

  const handleValidateDeploy = async () => {
    if (!selected) return;
    setBusy(true);
    try {
      const { hits, receipt } = await detectionsApi.validateDeploy(selected.id);
      if (hits.length) setTestHits(hits);
      toast({
        title: receipt.outcome === "failed" ? "Validate failed" : "Validated",
        description: `${receipt.message} · ${receipt.id}`,
        variant: receipt.outcome === "failed" ? "destructive" : "default",
      });
    } finally {
      setBusy(false);
    }
  };

  const handlePushDeploy = async () => {
    if (!selected) return;
    setBusy(true);
    try {
      const { receipt } = await detectionsApi.pushDeploy(
        selected.id,
        deploySourceId,
      );
      toast({
        title:
          receipt.outcome === "failed"
            ? "Push failed"
            : receipt.outcome === "simulated"
              ? "Pushed to SIEM"
              : "Pushed to SIEM",
        description: `${receipt.message} · ${receipt.id}${
          receipt.externalRef ? ` · ${receipt.externalRef}` : ""
        }`,
        variant: receipt.outcome === "failed" ? "destructive" : "default",
      });
    } finally {
      setBusy(false);
    }
  };

  const handleRollbackDeploy = async () => {
    if (!selected) return;
    setBusy(true);
    try {
      const { receipt } = await detectionsApi.rollbackDeploy(selected.id);
      toast({
        title: receipt.outcome === "failed" ? "Rollback failed" : "Rolled back",
        description: `${receipt.message} · ${receipt.id}`,
        variant: receipt.outcome === "failed" ? "destructive" : "default",
      });
    } finally {
      setBusy(false);
    }
  };

  const handleDeployPipeline = async () => {
    if (!selected) return;
    setBusy(true);
    try {
      const { receipt } = await detectionsApi.deployToSource(
        selected.id,
        deploySourceId,
      );
      toast({
        title:
          receipt.outcome === "simulated"
            ? "Pipeline complete"
            : receipt.outcome === "failed"
              ? "Pipeline failed"
              : "Pipeline complete",
        description: `${receipt.message} · ${receipt.id}`,
        variant: receipt.outcome === "failed" ? "destructive" : "default",
      });
    } finally {
      setBusy(false);
    }
  };

  const stripStats: SocStat[] = [
    {
      key: "rules",
      title: "Rules",
      value: String(stats.total),
      context: "In the detection library",
    },
    {
      key: "enabled",
      title: "Enabled",
      value: String(stats.enabled),
      context: "Actively evaluating",
    },
    {
      key: "experimental",
      title: "Experimental",
      value: String(stats.experimental),
      context: "Pending promotion",
    },
    {
      key: "critical",
      title: "Critical covered",
      value: String(stats.criticalCoverage),
      context: "High-severity techniques",
    },
    {
      key: "mitre",
      title: "MITRE coverage",
      value: String(stats.mitreTechniquesCovered),
      context: "Techniques mapped",
    },
  ];

  return (
    <>
      <ModuleShell
        toolbar={
          view === "library" ? (
            <>
              <ModuleToolbarSearch>
                <InputGroup className="h-9 w-full lg:max-w-sm">
                  <InputGroupAddon>
                    <Search className="size-3.5" />
                  </InputGroupAddon>
                  <InputGroupInput
                    value={search}
                    onChange={(event) => {
                      setPage(1);
                      setSearch(event.target.value);
                    }}
                    placeholder="Search detections…"
                  />
                </InputGroup>
              </ModuleToolbarSearch>
              <ModuleToolbarActions>
                <Select
                  value={statusFilter}
                  onValueChange={(value) => {
                    setPage(1);
                    setStatusFilter(value as DetectionStatus | "all");
                  }}
                >
                  <SelectTrigger className="h-9 w-[160px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="enabled">Enabled</SelectItem>
                    <SelectItem value="experimental">Experimental</SelectItem>
                    <SelectItem value="disabled">Disabled</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  size="sm"
                  className="h-9 gap-1.5"
                  onClick={handleCreate}
                >
                  <Plus className="size-3.5" />
                  Create
                </Button>
              </ModuleToolbarActions>
            </>
          ) : undefined
        }
      >
        <StatsStrip stats={stripStats} />

        <Tabs
          value={view}
          onValueChange={(value) => {
            setPage(1);
            setView(value as "library" | "marketplace");
          }}
        >
          <ModuleTabsList>
            <ModuleTabsTrigger value="library">
              Library
              <TabCount>{stats.total}</TabCount>
            </ModuleTabsTrigger>
            <ModuleTabsTrigger value="marketplace">
              Marketplace
            </ModuleTabsTrigger>
          </ModuleTabsList>

          <TabsContent value="library" className="mt-4">
            <div className="bg-card shadow-card overflow-hidden rounded-xl border">
              <Table className="max-md:table-fixed">
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-44">Detection</TableHead>
                    <TableHead className="hidden lg:table-cell">
                      MITRE
                    </TableHead>
                    <TableHead className="w-24">Severity</TableHead>
                    <TableHead className="hidden sm:table-cell">
                      Status
                    </TableHead>
                    <TableHead className="hidden xl:table-cell">
                      Lineage
                    </TableHead>
                    <TableHead className="hidden md:table-cell text-right">
                      Alerts
                    </TableHead>
                    <TableHead className="hidden xl:table-cell">
                      Owner
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paged.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-muted-foreground py-10 text-center"
                      >
                        No detections match the current filters.
                      </TableCell>
                    </TableRow>
                  ) : (
                    paged.map((rule) => (
                      <TableRow
                        key={rule.id}
                        className="cursor-pointer"
                        onClick={() => selectRule(rule.id)}
                      >
                        <TableCell>
                          <div className="space-y-0.5">
                            <p className="text-muted-foreground font-mono text-xs">
                              {rule.id}
                            </p>
                            <p className="line-clamp-2 max-w-md text-sm font-medium whitespace-normal md:line-clamp-1">
                              {rule.name}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div className="space-y-1">
                            <div className="flex flex-wrap gap-1">
                              {Array.from(new Set(rule.mitreTechniques)).map(
                                (tech) => (
                                  <Badge
                                    key={tech}
                                    variant="outline"
                                    className="font-mono text-xs"
                                  >
                                    {tech}
                                  </Badge>
                                ),
                              )}
                            </div>
                            <p className="text-muted-foreground text-xs">
                              {rule.mitreTactic}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <SeverityBadge severity={rule.severity} />
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <Badge variant="secondary">
                            {detectionStatusLabels[rule.status]}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden xl:table-cell">
                          {rule.lineageSource ? (
                            <Badge
                              variant="outline"
                              className="rounded-full text-xs font-normal capitalize"
                            >
                              {rule.lineageSource}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-xs">
                              —
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-right tabular-nums">
                          {rule.alertCount}
                        </TableCell>
                        <TableCell className="hidden xl:table-cell text-sm">
                          {rule.ownerName}
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
                  setPage(1);
                  setPageSize(size);
                }}
              />
            </div>
          </TabsContent>

          <TabsContent value="marketplace" className="mt-4">
            <DetectionMarketplace />
          </TabsContent>
        </Tabs>
      </ModuleShell>

      <Sheet
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedId(null);
            setTestHits(null);
            setDraftBody(null);
          }
        }}
      >
        <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
          {selected ? (
            <>
              <SheetHeader>
                <SheetTitle className="pr-8">{selected.name}</SheetTitle>
                <SheetDescription className="font-mono">
                  {selected.id}
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-5 px-1">
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5"
                    onClick={() => void handleClone()}
                    disabled={busy}
                  >
                    <Copy className="size-3.5" />
                    Clone
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5"
                    onClick={() => void handleTestRule()}
                    disabled={testing || busy}
                  >
                    <FlaskConical className="size-3.5" />
                    {testing ? "Testing…" : "Test rule"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5"
                    onClick={() => void handlePromoteToHunt()}
                    disabled={busy}
                  >
                    <Radar className="size-3.5" />
                    Promote to hunt
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5"
                    onClick={() => void handleDeployPipeline()}
                    disabled={busy}
                  >
                    <Rocket className="size-3.5" />
                    Run SIEM pipeline
                  </Button>
                  <Button size="sm" asChild>
                    <Link href={investigateHref}>
                      <Crosshair className="size-3.5" />
                      Open in Investigate
                    </Link>
                  </Button>
                </div>

                <div className="border-border/70 space-y-3 rounded-lg border border-dashed p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium">
                        SIEM deploy pipeline
                      </p>
                      <p className="text-muted-foreground text-xs">
                        Stage → validate (corpus) → push to{" "}
                        {getTelemetrySource(deploySourceId)?.shortName ??
                          deploySourceId}
                      </p>
                    </div>
                    <Badge
                      variant="secondary"
                      className="rounded-full font-normal"
                    >
                      {detectionDeployStateLabels[selected.deployState]}
                      {selected.deployVersion > 0
                        ? ` · v${selected.deployVersion}`
                        : ""}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8"
                      disabled={busy}
                      onClick={() => void handleStageDeploy()}
                    >
                      Stage
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8"
                      disabled={busy || selected.deployState === "draft"}
                      onClick={() => void handleValidateDeploy()}
                    >
                      Validate
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8"
                      disabled={
                        busy ||
                        (selected.deployState !== "validated" &&
                          selected.deployState !== "staged" &&
                          selected.deployState !== "deployed")
                      }
                      onClick={() => void handlePushDeploy()}
                    >
                      Push
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8"
                      disabled={
                        busy ||
                        (selected.deployState !== "deployed" &&
                          selected.deployState !== "validated")
                      }
                      onClick={() => void handleRollbackDeploy()}
                    >
                      Rollback
                    </Button>
                  </div>
                  {selected.deployHistory.length > 0 ? (
                    <ul className="text-muted-foreground space-y-1 text-xs">
                      {selected.deployHistory.slice(0, 4).map((entry) => (
                        <li key={entry.id} className="flex flex-wrap gap-x-2">
                          <span className="text-foreground font-medium">
                            {detectionDeployStateLabels[entry.stage]}
                          </span>
                          <span>{entry.sourceName}</span>
                          <span className="tabular-nums">v{entry.version}</span>
                          {entry.detail ? (
                            <span className="truncate">{entry.detail}</span>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>

                <p className="text-muted-foreground text-sm leading-relaxed">
                  {selected.summary}
                </p>

                {selected.lineageSource ? (
                  <Badge
                    variant="secondary"
                    className="rounded-full font-normal"
                  >
                    {lineageSourceLabels[selected.lineageSource]}
                  </Badge>
                ) : null}

                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium">
                      Rule body · Heimdall QL
                    </p>
                    {draftBody !== null ? (
                      <Button
                        size="sm"
                        className="h-7"
                        onClick={() => void handleSaveBody()}
                        disabled={busy}
                      >
                        Save
                      </Button>
                    ) : null}
                  </div>
                  <Textarea
                    value={bodyValue}
                    onChange={(event) => setDraftBody(event.target.value)}
                    className="min-h-40 font-mono text-xs leading-relaxed"
                    spellCheck={false}
                  />
                </div>

                {(selected.splLineage || selected.kqlLineage) && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Lineage</p>
                    {selected.splLineage ? (
                      <div className="space-y-1">
                        <p className="text-muted-foreground text-xs uppercase">
                          SPL
                        </p>
                        <pre className="bg-muted/30 max-h-28 overflow-auto rounded-md border p-2.5 font-mono text-xs leading-relaxed whitespace-pre-wrap">
                          {selected.splLineage}
                        </pre>
                      </div>
                    ) : null}
                    {selected.kqlLineage ? (
                      <div className="space-y-1">
                        <p className="text-muted-foreground text-xs uppercase">
                          KQL
                        </p>
                        <pre className="bg-muted/30 max-h-28 overflow-auto rounded-md border p-2.5 font-mono text-xs leading-relaxed whitespace-pre-wrap">
                          {selected.kqlLineage}
                        </pre>
                      </div>
                    ) : null}
                  </div>
                )}

                <div className="space-y-2">
                  <p className="text-sm font-medium">Enabled sources</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selected.enabledSourceIds.map((id) => {
                      const source = getTelemetrySource(id);
                      return (
                        <Badge
                          key={id}
                          variant="outline"
                          className="rounded-full font-normal"
                        >
                          {source?.shortName ?? id}
                        </Badge>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs">Techniques</p>
                    <p className="font-mono text-xs">
                      {selected.mitreTechniques.join(", ")}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Tactic</p>
                    <p>{selected.mitreTactic}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Owner</p>
                    <p>{selected.ownerName}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Playbook</p>
                    <p>{selected.playbookCode ?? "None linked"}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">Status</p>
                  <div className="flex flex-wrap gap-2">
                    {(["enabled", "experimental", "disabled"] as const).map(
                      (status) => (
                        <Button
                          key={status}
                          size="sm"
                          variant={
                            selected.status === status ? "default" : "outline"
                          }
                          disabled={busy}
                          onClick={() => void toggleStatus(status)}
                        >
                          {detectionStatusLabels[status]}
                        </Button>
                      ),
                    )}
                  </div>
                </div>

                {testHits ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium">
                        Corpus hits ({testHits.length})
                      </p>
                      <Button
                        size="sm"
                        variant="link"
                        className="h-auto p-0"
                        asChild
                      >
                        <Link href={investigateHref}>Open in Investigate</Link>
                      </Button>
                    </div>
                    <div className="overflow-hidden rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-xs">Time</TableHead>
                            <TableHead className="text-xs">Entity</TableHead>
                            <TableHead className="text-xs">Sev</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {testHits.map((hit) => (
                            <TableRow key={hit.id}>
                              <TableCell className="text-muted-foreground font-mono text-xs">
                                {formatHitTime(hit.timestamp)}
                              </TableCell>
                              <TableCell className="max-w-[140px] truncate font-mono text-xs">
                                {hit.entity}
                              </TableCell>
                              <TableCell>
                                <SeverityBadge severity={hit.severity} />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                ) : null}

                <div className="space-y-2">
                  <p className="text-sm font-medium">Recent linked alerts</p>
                  <ul className="space-y-1">
                    {selected.linkedAlertIds.length === 0 ? (
                      <li className="text-muted-foreground text-xs">
                        No linked alerts yet.
                      </li>
                    ) : (
                      selected.linkedAlertIds.map((id) => (
                        <li key={id}>
                          <Link
                            href={`/alerts/${id}`}
                            className="text-primary font-mono text-xs hover:underline"
                          >
                            {id}
                          </Link>
                        </li>
                      ))
                    )}
                  </ul>
                </div>

                {selected.playbookCode ? (
                  <Button size="sm" variant="outline" asChild>
                    <Link href="/knowledge-base/procedures">View playbook</Link>
                  </Button>
                ) : null}
              </div>
            </>
          ) : null}
        </SheetContent>
      </Sheet>
    </>
  );
}
