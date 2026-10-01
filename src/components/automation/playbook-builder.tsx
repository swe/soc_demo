"use client";

import "@xyflow/react/dist/style.css";

import {
  addEdge,
  Background,
  type Connection,
  Controls,
  type Edge,
  Handle,
  MarkerType,
  type NodeProps,
  Position,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from "@xyflow/react";
import {
  Bell,
  CircleDot,
  GitBranch,
  Play,
  Plus,
  Save,
  Sparkles,
  Trash2,
  Workflow,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useMemo, useState } from "react";

import { useSocRole } from "@/components/auth/soc-role-provider";
import {
  kbProcedureSeverityLabels,
  kbProcedureStatusLabels,
} from "@/components/knowledge-base/knowledge-base-data";
import { EmptyState } from "@/components/soc/state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

import { useAutomationSession } from "./automation-session";
import {
  type PlaybookActionKind,
  playbookActionKindLabels,
  type PlaybookDefinition,
  type PlaybookFlowEdge,
  type PlaybookFlowNode,
  type PlaybookNodeType,
  playbookNodeTypeLabels,
} from "./playbooks-data";

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

function BuilderNodeCard({ data, selected }: NodeProps<PlaybookFlowNode>) {
  const style = nodeStyles[data.nodeType];
  const Icon = style.icon;

  return (
    <div
      className={cn(
        "bg-card/95 group relative w-[200px] rounded-[7px] border border-l-[3px] p-2.5 shadow-sm backdrop-blur",
        style.accent,
        style.wash,
        selected && "ring-primary/40 ring-2",
      )}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-muted-foreground !size-2.5 !border-0"
      />
      <div className="flex items-start gap-2">
        <span className="bg-background/80 text-muted-foreground mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md border">
          <Icon className="size-3.5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium">{data.label}</p>
          <p className="text-muted-foreground mt-0.5 truncate text-xs">
            {playbookNodeTypeLabels[data.nodeType]}
            {data.actionKind
              ? ` · ${playbookActionKindLabels[data.actionKind]}`
              : ""}
          </p>
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Right}
        className="!bg-muted-foreground !size-2.5 !border-0"
      />
    </div>
  );
}

const nodeTypes = {
  trigger: BuilderNodeCard,
  enrich: BuilderNodeCard,
  condition: BuilderNodeCard,
  action: BuilderNodeCard,
  notify: BuilderNodeCard,
  end: BuilderNodeCard,
};

const actionKinds = Object.keys(
  playbookActionKindLabels,
) as PlaybookActionKind[];

function NodeInspector({
  node,
  onChange,
}: {
  node: PlaybookFlowNode | null;
  onChange: (patch: Partial<PlaybookFlowNode["data"]>) => void;
}) {
  if (!node) {
    return (
      <div className="text-muted-foreground flex h-full items-center justify-center p-6 text-center text-sm">
        Select a node to inspect configuration.
      </div>
    );
  }

  const config = node.data.config ?? {};
  const configEntries = Object.entries(config);

  return (
    <div className="space-y-4 p-4">
      <div>
        <p className="text-muted-foreground text-xs tracking-wide uppercase">
          {playbookNodeTypeLabels[node.data.nodeType]}
        </p>
        <p className="mt-1 font-mono text-xs">{node.id}</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="node-label">Label</Label>
        <Input
          id="node-label"
          value={node.data.label}
          onChange={(e) => onChange({ label: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="node-desc">Description</Label>
        <Textarea
          id="node-desc"
          rows={3}
          value={node.data.description ?? ""}
          onChange={(e) => onChange({ description: e.target.value })}
        />
      </div>

      {node.data.nodeType === "action" ||
      node.data.nodeType === "notify" ||
      node.data.nodeType === "enrich" ? (
        <div className="space-y-2">
          <Label>Action kind</Label>
          <Select
            value={node.data.actionKind ?? undefined}
            onValueChange={(value) =>
              onChange({ actionKind: value as PlaybookActionKind })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select action" />
            </SelectTrigger>
            <SelectContent>
              {actionKinds.map((kind) => (
                <SelectItem key={kind} value={kind}>
                  {playbookActionKindLabels[kind]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : null}

      {configEntries.length > 0 ? (
        <div className="space-y-3">
          <p className="text-xs font-medium tracking-wide uppercase">Config</p>
          {configEntries.map(([key, value]) => (
            <div key={key} className="space-y-1.5">
              <Label htmlFor={`cfg-${key}`} className="font-mono text-xs">
                {key}
              </Label>
              <Input
                id={`cfg-${key}`}
                value={value}
                onChange={(e) =>
                  onChange({
                    config: { ...config, [key]: e.target.value },
                  })
                }
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-muted-foreground text-xs">
            No config keys yet. Add a key to parameterize this step.
          </p>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-8 gap-1.5 text-xs"
            onClick={() =>
              onChange({
                config: { ...(config ?? {}), param: "" },
              })
            }
          >
            <Plus className="size-3" />
            Add config key
          </Button>
        </div>
      )}
    </div>
  );
}

const ADDABLE_NODE_TYPES: PlaybookNodeType[] = [
  "trigger",
  "enrich",
  "condition",
  "action",
  "notify",
  "end",
];

function BuilderCanvas({
  playbook,
  onDirty,
}: {
  playbook: PlaybookDefinition;
  onDirty: (nodes: PlaybookFlowNode[], edges: PlaybookFlowEdge[]) => void;
}) {
  const { resolvedTheme } = useTheme();
  const flowColorMode = resolvedTheme === "dark" ? "dark" : "light";
  const backgroundDotColor =
    resolvedTheme === "dark"
      ? "color-mix(in oklab, var(--muted-foreground) 42%, transparent)"
      : "hsl(var(--border))";

  const initialEdges: Edge[] = useMemo(
    () =>
      playbook.graph.edges.map((e) => ({
        ...e,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "rgb(113 113 122)",
        },
        style: { stroke: "rgb(113 113 122)", strokeWidth: 1.35 },
        labelStyle: { fill: "var(--muted-foreground)", fontSize: 10 },
        labelBgStyle: { fill: "var(--card)", fillOpacity: 0.9 },
      })),
    [playbook.graph.edges],
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(playbook.graph.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { fitView } = useReactFlow();

  useEffect(() => {
    setNodes(playbook.graph.nodes);
    setEdges(initialEdges);
    setSelectedId(null);
    const t = window.setTimeout(() => fitView({ padding: 0.2 }), 50);
    return () => window.clearTimeout(t);
  }, [
    playbook.id,
    playbook.graph.nodes,
    initialEdges,
    setNodes,
    setEdges,
    fitView,
  ]);

  useEffect(() => {
    onDirty(nodes as PlaybookFlowNode[], edges as PlaybookFlowEdge[]);
  }, [nodes, edges, onDirty]);

  const selectedNode =
    (nodes.find((n) => n.id === selectedId) as PlaybookFlowNode | undefined) ??
    null;

  const patchSelected = (patch: Partial<PlaybookFlowNode["data"]>) => {
    if (!selectedId) return;
    setNodes((prev) =>
      prev.map((n) =>
        n.id === selectedId
          ? {
              ...n,
              data: {
                ...n.data,
                ...patch,
                config: patch.config
                  ? { ...(n.data.config ?? {}), ...patch.config }
                  : n.data.config,
              },
            }
          : n,
      ),
    );
  };

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) =>
        addEdge(
          {
            ...connection,
            type: "smoothstep",
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: "rgb(113 113 122)",
            },
            style: { stroke: "rgb(113 113 122)", strokeWidth: 1.35 },
          },
          eds,
        ),
      );
    },
    [setEdges],
  );

  const addNode = (nodeType: PlaybookNodeType) => {
    const id = `n-${Date.now().toString(36)}`;
    const offset = nodes.length * 24;
    const next: PlaybookFlowNode = {
      id,
      type: nodeType,
      position: { x: 120 + offset, y: 80 + offset },
      data: {
        label: playbookNodeTypeLabels[nodeType],
        nodeType,
        description: `New ${playbookNodeTypeLabels[nodeType].toLowerCase()} step`,
        ...(nodeType === "action"
          ? {
              actionKind: "isolate_host" as PlaybookActionKind,
              config: { connector: "int-defender-endpoint" },
            }
          : nodeType === "notify"
            ? {
                actionKind: "slack" as PlaybookActionKind,
                config: { channel: "#soc-ops" },
              }
            : nodeType === "enrich"
              ? {
                  actionKind: "enrich_ti" as PlaybookActionKind,
                  config: { depth: "standard" },
                }
              : { config: {} }),
      },
    };
    setNodes((prev) => [...prev, next]);
    setSelectedId(id);
  };

  const deleteSelected = () => {
    if (!selectedId) return;
    setNodes((prev) => prev.filter((n) => n.id !== selectedId));
    setEdges((prev) =>
      prev.filter((e) => e.source !== selectedId && e.target !== selectedId),
    );
    setSelectedId(null);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
      <div className="relative min-h-[420px] flex-1 overflow-hidden border-b lg:border-r lg:border-b-0">
        <div className="bg-background/90 absolute top-3 left-3 z-10 flex flex-wrap gap-1 rounded-md border p-1 shadow-sm backdrop-blur-sm">
          {ADDABLE_NODE_TYPES.map((type) => (
            <Button
              key={type}
              type="button"
              size="sm"
              variant="ghost"
              className="h-7 gap-1 px-2 text-xs"
              onClick={() => addNode(type)}
            >
              <Plus className="size-3" />
              {playbookNodeTypeLabels[type]}
            </Button>
          ))}
        </div>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          onNodeClick={(_, node) => setSelectedId(node.id)}
          onPaneClick={() => setSelectedId(null)}
          fitView
          nodesConnectable
          edgesReconnectable
          deleteKeyCode={["Backspace", "Delete"]}
          proOptions={{ hideAttribution: true }}
          colorMode={flowColorMode}
        >
          <Background gap={18} size={1} color={backgroundDotColor} />
          <Controls />
        </ReactFlow>
      </div>
      <aside className="bg-card w-full shrink-0 overflow-y-auto border-t lg:w-80 lg:border-t-0">
        <div className="flex items-start justify-between gap-2 border-b px-4 py-3">
          <div>
            <p className="text-sm font-medium">Node inspector</p>
            <p className="text-muted-foreground text-xs">
              Drag to connect · Backspace deletes · Save persists
            </p>
          </div>
          {selectedId ? (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-8 gap-1 px-2 text-xs"
              onClick={deleteSelected}
            >
              <Trash2 className="size-3.5" />
              Delete
            </Button>
          ) : null}
        </div>
        <NodeInspector node={selectedNode} onChange={patchSelected} />
      </aside>
    </div>
  );
}

export function PlaybookBuilder() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const requestedId = searchParams.get("id");
  const { effectiveRole } = useSocRole();
  const {
    playbooks,
    getPlaybook,
    savePlaybookGraph,
    runPlaybookMock,
    createPlaybook,
  } = useAutomationSession();

  const selectedId = requestedId ?? playbooks[0]?.id ?? null;
  const playbook = selectedId ? getPlaybook(selectedId) : null;

  const [draftNodes, setDraftNodes] = useState<PlaybookFlowNode[]>([]);
  const [draftEdges, setDraftEdges] = useState<PlaybookFlowEdge[]>([]);

  const onDirty = useCallback(
    (nodes: PlaybookFlowNode[], edges: PlaybookFlowEdge[]) => {
      setDraftNodes(nodes);
      setDraftEdges(edges);
    },
    [],
  );

  const isT1 = effectiveRole === "analyst_t1";
  // Demo: editing allowed for all roles including T1; note shown in UI.
  const canEdit = true;

  const handleSave = () => {
    if (!playbook || !canEdit) return;
    const saved = savePlaybookGraph(playbook.id, draftNodes, draftEdges);
    if (!saved) {
      toast({ title: "Save failed", variant: "destructive" });
      return;
    }
    toast({
      title: "Playbook saved",
      description: `${saved.code} graph updated in session`,
    });
  };

  const handleRun = () => {
    if (!playbook) return;
    const result = runPlaybookMock(playbook.id);
    if (!result) {
      toast({ title: "Run failed", variant: "destructive" });
      return;
    }
    toast({
      title: "Playbook running",
      description: `${result.code} · run #${result.runCount}`,
    });
  };

  if (!playbook) {
    return (
      <main
        id="main-content"
        className="bg-canvas flex flex-1 flex-col items-center justify-center"
      >
        <EmptyState
          icon={Workflow}
          title="No playbook selected"
          description="Create one or choose from the list."
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <Button
                size="sm"
                className="gap-1.5"
                onClick={() => {
                  const created = createPlaybook({
                    title: "Untitled playbook",
                  });
                  router.push(`/automation/builder?id=${created.id}`);
                }}
              >
                <Plus className="size-3.5" />
                Create playbook
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href="/automation/playbooks">Back to playbooks</Link>
              </Button>
            </div>
          }
        />
      </main>
    );
  }

  return (
    <main id="main-content" className="flex min-h-0 flex-1 flex-col">
      <div className="bg-background border-separator px-gutter flex shrink-0 flex-col gap-3 border-b py-3 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-title-3 truncate font-semibold">
              {playbook.title}
            </h1>
            <Badge variant="muted" className="font-mono">
              {playbook.code}
            </Badge>
            <Badge variant="outline">
              {kbProcedureStatusLabels[playbook.status]}
            </Badge>
            <Badge variant={playbook.severity}>
              {kbProcedureSeverityLabels[playbook.severity]}
            </Badge>
          </div>
          <p className="text-muted-foreground text-xs">
            Builder · {playbook.steps} steps · last run {playbook.lastRunLabel}
            {isT1 ? " · T1 can view and edit" : " · session save"}
          </p>
        </div>

        <div className="grid grid-cols-[1fr_auto_auto] items-center gap-2 sm:flex sm:flex-wrap">
          <Select
            value={playbook.id}
            onValueChange={(id) => {
              router.push(`/automation/builder?id=${id}`);
            }}
          >
            <SelectTrigger
              className="h-9 w-full sm:w-[220px]"
              aria-label="Playbook"
            >
              <SelectValue placeholder="Select playbook" />
            </SelectTrigger>
            <SelectContent>
              {playbooks.map((pb) => (
                <SelectItem key={pb.id} value={pb.id}>
                  {pb.code} — {pb.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            className="h-9 gap-1.5"
            onClick={handleSave}
          >
            <Save className="size-3.5" />
            Save
          </Button>
          <Button
            size="sm"
            className="h-9 gap-1.5"
            onClick={handleRun}
            disabled={playbook.status === "deprecated"}
          >
            <Play className="size-3.5" />
            Run
          </Button>
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="hidden h-9 sm:inline-flex"
          >
            <Link href="/automation/playbooks">Playbooks</Link>
          </Button>
        </div>
      </div>

      <ReactFlowProvider>
        <BuilderCanvas
          key={playbook.id}
          playbook={playbook}
          onDirty={onDirty}
        />
      </ReactFlowProvider>
    </main>
  );
}
