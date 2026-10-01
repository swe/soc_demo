"use client";

import "@xyflow/react/dist/style.css";

import {
  Background,
  Controls,
  type Edge,
  Handle,
  MarkerType,
  type NodeProps,
  Position,
  ReactFlow,
  ReactFlowProvider,
} from "@xyflow/react";
import {
  Bell,
  CircleDot,
  GitBranch,
  Play,
  Plus,
  Search,
  Sparkles,
  Workflow,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useDeferredValue, useMemo, useState } from "react";

import {
  type KbProcedureSeverity,
  kbProcedureSeverityLabels,
  type KbProcedureStatus,
  kbProcedureStatusLabels,
} from "@/components/knowledge-base/knowledge-base-data";
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
import { type SocStat, StatsStrip } from "@/components/soc/stats-strip";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { actionCatalog } from "@/lib/mock-api/action-catalog";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

import { useAutomationSession } from "./automation-session";
import {
  filterPlaybookDefinitions,
  type PlaybookDefinition,
  type PlaybookFlowNode,
  type PlaybookNodeType,
  playbookNodeTypeLabels,
} from "./playbooks-data";

const severityTones: Record<KbProcedureSeverity, string> = {
  critical:
    "border-severity-critical/30 bg-severity-critical/10 text-severity-critical-text",
  high: "border-severity-high/30 bg-severity-high/10 text-severity-high-text",
  medium:
    "border-severity-medium/30 bg-severity-medium/10 text-severity-medium-text",
  low: "border-border bg-muted text-muted-foreground",
};

const statusTones: Record<KbProcedureStatus, string> = {
  approved: "border-success/30 bg-success/10 text-success-text",
  draft: "border-border bg-muted text-muted-foreground",
  "in-review": "border-info/30 bg-info/10 text-info-text",
  deprecated: "border-border bg-muted text-muted-foreground line-through",
};

const nodeStyles: Record<
  PlaybookNodeType,
  { accent: string; icon: typeof Zap; wash: string }
> = {
  trigger: {
    accent: "border-l-violet-500",
    icon: Zap,
    wash: "bg-violet-500/5",
  },
  enrich: {
    accent: "border-l-sky-500",
    icon: Sparkles,
    wash: "bg-sky-500/5",
  },
  condition: {
    accent: "border-l-amber-500",
    icon: GitBranch,
    wash: "bg-amber-500/5",
  },
  action: {
    accent: "border-l-rose-500",
    icon: CircleDot,
    wash: "bg-rose-500/5",
  },
  notify: {
    accent: "border-l-cyan-500",
    icon: Bell,
    wash: "bg-cyan-500/5",
  },
  end: {
    accent: "border-l-emerald-500",
    icon: Workflow,
    wash: "bg-emerald-500/5",
  },
};

function PlaybookFlowNodeCard({ data, selected }: NodeProps<PlaybookFlowNode>) {
  const style = nodeStyles[data.nodeType];
  const Icon = style.icon;

  return (
    <div
      className={cn(
        "bg-card/95 group relative w-[180px] rounded-[7px] border border-l-[3px] p-2.5 shadow-sm backdrop-blur",
        style.accent,
        style.wash,
        selected && "ring-primary/40 ring-2",
      )}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-muted-foreground !size-2 !border-0"
      />
      <div className="flex items-start gap-2">
        <span className="bg-background/80 text-muted-foreground mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md border">
          <Icon className="size-3.5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium">{data.label}</p>
          <p className="text-muted-foreground mt-0.5 truncate text-xs">
            {data.description ?? playbookNodeTypeLabels[data.nodeType]}
          </p>
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Right}
        className="!bg-muted-foreground !size-2 !border-0"
      />
    </div>
  );
}

const nodeTypes = {
  trigger: PlaybookFlowNodeCard,
  enrich: PlaybookFlowNodeCard,
  condition: PlaybookFlowNodeCard,
  action: PlaybookFlowNodeCard,
  notify: PlaybookFlowNodeCard,
  end: PlaybookFlowNodeCard,
};

function ReadOnlyFlow({ playbook }: { playbook: PlaybookDefinition }) {
  const { resolvedTheme } = useTheme();
  const flowColorMode = resolvedTheme === "dark" ? "dark" : "light";
  const backgroundDotColor =
    resolvedTheme === "dark"
      ? "color-mix(in oklab, var(--muted-foreground) 42%, transparent)"
      : "hsl(var(--border))";

  const edges: Edge[] = playbook.graph.edges.map((e) => ({
    ...e,
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: "rgb(113 113 122)",
    },
    style: { stroke: "rgb(113 113 122)", strokeWidth: 1.35 },
    labelStyle: { fill: "var(--muted-foreground)", fontSize: 10 },
    labelBgStyle: { fill: "var(--card)", fillOpacity: 0.9 },
  }));

  return (
    <div className="h-[360px] w-full overflow-hidden rounded-lg border">
      <ReactFlowProvider>
        <ReactFlow
          nodes={playbook.graph.nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          panOnDrag
          zoomOnScroll
          proOptions={{ hideAttribution: true }}
          colorMode={flowColorMode}
        >
          <Background gap={18} size={1} color={backgroundDotColor} />
          <Controls showInteractive={false} />
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  );
}

function PlaybookDetailSheet({
  playbook,
  onOpenChange,
  onRun,
}: {
  playbook: PlaybookDefinition | null;
  onOpenChange: (open: boolean) => void;
  onRun: (id: string) => void;
}) {
  return (
    <Sheet open={playbook !== null} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 overflow-y-auto sm:max-w-xl">
        {playbook ? (
          <>
            <SheetHeader className="space-y-3 pb-4">
              <div className="min-w-0">
                <SheetTitle className="text-base">{playbook.title}</SheetTitle>
                <SheetDescription className="font-mono text-xs">
                  {playbook.code} · {playbook.steps} steps · last{" "}
                  {playbook.lastRunLabel}
                </SheetDescription>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant="outline"
                  className={cn(
                    "rounded-full font-medium",
                    severityTones[playbook.severity],
                  )}
                >
                  {kbProcedureSeverityLabels[playbook.severity]}
                </Badge>
                <Badge
                  variant="outline"
                  className={cn(
                    "rounded-full font-medium",
                    statusTones[playbook.status],
                  )}
                >
                  {kbProcedureStatusLabels[playbook.status]}
                </Badge>
                {playbook.mitreTactic ? (
                  <Badge variant="outline" className="rounded-full font-medium">
                    {playbook.mitreTactic}
                  </Badge>
                ) : null}
              </div>
            </SheetHeader>

            <div className="space-y-4 border-t py-4">
              <p className="text-muted-foreground text-sm leading-relaxed">
                {playbook.summary}
              </p>

              <ReadOnlyFlow playbook={playbook} />

              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  className="gap-1.5"
                  onClick={() => onRun(playbook.id)}
                  disabled={playbook.status === "deprecated"}
                >
                  <Play className="size-3.5" />
                  Run
                </Button>
                <Button asChild variant="outline" size="sm" className="gap-1.5">
                  <Link href={`/automation/builder?id=${playbook.id}`}>
                    <Workflow className="size-3.5" />
                    Open in builder
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm" className="gap-1.5">
                  <Link
                    href={`/knowledge-base/procedures?id=${encodeURIComponent(playbook.id)}`}
                  >
                    <Sparkles className="size-3.5" />
                    Linked KB procedure
                  </Link>
                </Button>
              </div>
            </div>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

export function PlaybooksCenter() {
  const router = useRouter();
  const { playbooks, runPlaybookMock, createPlaybook } = useAutomationSession();
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const filtered = useMemo(
    () => filterPlaybookDefinitions(playbooks, { q: deferredQuery }),
    [playbooks, deferredQuery],
  );

  const paged = useMemo(
    () => paginateItems(filtered, page, pageSize),
    [filtered, page, pageSize],
  );

  const active = activeId
    ? (playbooks.find((p) => p.id === activeId) ?? null)
    : null;

  const handleRun = (id: string) => {
    const result = runPlaybookMock(id);
    if (!result) {
      toast({ title: "Playbook not found", variant: "destructive" });
      return;
    }
    toast({
      title: "Playbook running",
      description: `${result.code} · run #${result.runCount}`,
    });
  };

  const handleCreate = () => {
    const created = createPlaybook({ title: "Untitled playbook" });
    toast({
      title: "Playbook created",
      description: `${created.code} · open the builder to edit the graph`,
    });
    router.push(`/automation/builder?id=${created.id}`);
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
                  placeholder="Search playbooks…"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setPage(1);
                  }}
                />
              </InputGroup>
            </ModuleToolbarSearch>
            <ModuleToolbarActions>
              <Button size="sm" className="h-9 gap-1.5" onClick={handleCreate}>
                <Plus className="size-3.5" />
                Create playbook
              </Button>
              <Button asChild size="sm" variant="outline" className="h-9">
                <Link href="/automation/builder">
                  <Workflow className="size-3.5" />
                  Open builder
                </Link>
              </Button>
            </ModuleToolbarActions>
          </>
        }
      >
        <StatsStrip
          stats={
            [
              {
                key: "playbooks",
                title: "Playbooks",
                value: String(playbooks.length),
                context: "In the automation catalog",
              },
              {
                key: "approved",
                title: "Approved",
                value: String(
                  playbooks.filter((p) => p.status === "approved").length,
                ),
                context: "Ready to run",
              },
              {
                key: "runs",
                title: "Total runs",
                value: String(playbooks.reduce((s, p) => s + p.runCount, 0)),
                context: "Across all playbooks",
              },
              {
                key: "actions",
                title: "SOAR actions",
                value: String(actionCatalog.length),
                context: "Via upstream connectors",
              },
            ] satisfies SocStat[]
          }
        />

        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Playbook</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden sm:table-cell">Severity</TableHead>
                <TableHead className="hidden md:table-cell">Steps</TableHead>
                <TableHead className="hidden lg:table-cell">Last run</TableHead>
                <TableHead className="hidden lg:table-cell">Runs</TableHead>
                <TableHead className="w-[1%] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paged.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-muted-foreground h-24 text-center text-sm"
                  >
                    No playbooks match.
                  </TableCell>
                </TableRow>
              ) : (
                paged.map((pb) => (
                  <TableRow
                    key={pb.id}
                    className="cursor-pointer"
                    onClick={() => setActiveId(pb.id)}
                  >
                    <TableCell>
                      <div className="min-w-0">
                        <p className="truncate font-medium">{pb.title}</p>
                        <p className="text-muted-foreground font-mono text-xs">
                          {pb.code}
                          {pb.mitreTactic ? ` · ${pb.mitreTactic}` : ""}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          "rounded-full font-medium",
                          statusTones[pb.status],
                        )}
                      >
                        {kbProcedureStatusLabels[pb.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge
                        variant="outline"
                        className={cn(
                          "rounded-full font-medium",
                          severityTones[pb.severity],
                        )}
                      >
                        {kbProcedureSeverityLabels[pb.severity]}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden tabular-nums md:table-cell">
                      {pb.steps}
                    </TableCell>
                    <TableCell className="text-muted-foreground hidden text-sm lg:table-cell">
                      {pb.lastRunLabel}
                    </TableCell>
                    <TableCell className="hidden tabular-nums lg:table-cell">
                      {pb.runCount}
                    </TableCell>
                    <TableCell
                      className="text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex justify-end gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 gap-1 px-2"
                          onClick={() => handleRun(pb.id)}
                          disabled={pb.status === "deprecated"}
                        >
                          <Play className="size-3.5" />
                          Run
                        </Button>
                        <Button
                          asChild
                          size="sm"
                          variant="ghost"
                          className="h-8 px-2"
                        >
                          <Link href={`/automation/builder?id=${pb.id}`}>
                            Builder
                          </Link>
                        </Button>
                      </div>
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

      <PlaybookDetailSheet
        playbook={active}
        onOpenChange={(open) => {
          if (!open) setActiveId(null);
        }}
        onRun={handleRun}
      />
    </>
  );
}
