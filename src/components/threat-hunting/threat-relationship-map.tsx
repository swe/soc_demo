"use client";

import "@xyflow/react/dist/style.css";

import {
  Background,
  Controls,
  type Edge,
  Handle,
  MarkerType,
  type Node,
  type NodeProps,
  Position,
  ReactFlow,
  type ReactFlowInstance,
  useEdgesState,
  useNodesState,
} from "@xyflow/react";
import {
  AlertTriangle,
  Bug,
  Crosshair,
  Maximize2,
  Minimize2,
  Shield,
  UserRound,
} from "lucide-react";
import { useTheme } from "next-themes";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import {
  getConnectedNodeIds,
  type ThreatGraphEdge,
  threatGraphEdges,
  type ThreatGraphNode,
  threatGraphNodes,
  type ThreatNodeKind,
  threatNodeKindLabels,
  threatRelationLabels,
} from "./threat-analytics-data";

const defaultEdgeColor = "rgb(113 113 122)";
const criticalEdgeColor = "rgb(239 68 68)";

const kindStyles: Record<
  ThreatNodeKind,
  { accent: string; icon: typeof Shield; wash: string }
> = {
  actor: {
    accent: "border-l-violet-500",
    icon: Crosshair,
    wash: "bg-violet-500/5",
  },
  technique: {
    accent: "border-l-sky-500",
    icon: Shield,
    wash: "bg-sky-500/5",
  },
  identity: {
    accent: "border-l-emerald-500",
    icon: UserRound,
    wash: "bg-emerald-500/5",
  },
  alert: {
    accent: "border-l-orange-500",
    icon: AlertTriangle,
    wash: "bg-orange-500/5",
  },
  vulnerability: {
    accent: "border-l-rose-500",
    icon: Bug,
    wash: "bg-rose-500/5",
  },
};

const severityDot: Record<string, string> = {
  critical: "bg-red-500",
  high: "bg-orange-500",
  medium: "bg-amber-500",
  low: "bg-blue-500",
};

type ThreatFlowNodeData = Record<string, unknown> & {
  threat: ThreatGraphNode;
  dimmed?: boolean;
};

type ThreatFlowNode = Node<ThreatFlowNodeData, ThreatNodeKind>;

function ThreatFlowNodeCard({ data, selected }: NodeProps<ThreatFlowNode>) {
  const { threat, dimmed } = data;
  const style = kindStyles[threat.kind];
  const Icon = style.icon;

  return (
    <div
      className={cn(
        "bg-card/95 group relative rounded-[7px] border border-l-[3px] p-2.5 shadow-sm backdrop-blur transition-all dark:bg-[#161616]/95",
        style.accent,
        style.wash,
        selected && "ring-primary/40 ring-2",
        dimmed && "opacity-25",
      )}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-muted-foreground !size-2 !border-0 !opacity-0 transition-opacity group-hover:!opacity-100"
      />
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-muted-foreground !size-2 !border-0 !opacity-0 transition-opacity group-hover:!opacity-100"
      />
      <div className="flex items-start gap-2">
        <span className="bg-background/80 text-muted-foreground mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md border">
          <Icon className="size-3.5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium">{threat.label}</p>
          <p className="text-muted-foreground mt-0.5 truncate text-xs">
            {threat.subtitle ?? threatNodeKindLabels[threat.kind]}
          </p>
        </div>
      </div>
      <div className="mt-2 flex items-center gap-2">
        <span className="text-muted-foreground text-xs tracking-wide uppercase">
          {threatNodeKindLabels[threat.kind]}
        </span>
        {threat.severity ? (
          <span className="ml-auto flex items-center gap-1.5">
            <span
              className={cn(
                "size-1.5 rounded-full",
                severityDot[threat.severity] ?? "bg-muted-foreground",
              )}
            />
            <span className="text-muted-foreground text-xs capitalize">
              {threat.severity}
            </span>
          </span>
        ) : null}
      </div>
      <Handle
        type="source"
        position={Position.Right}
        className="!bg-muted-foreground !size-2 !border-0 !opacity-0 transition-opacity group-hover:!opacity-100"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-muted-foreground !size-2 !border-0 !opacity-0 transition-opacity group-hover:!opacity-100"
      />
    </div>
  );
}

const nodeTypes = {
  actor: ThreatFlowNodeCard,
  technique: ThreatFlowNodeCard,
  identity: ThreatFlowNodeCard,
  alert: ThreatFlowNodeCard,
  vulnerability: ThreatFlowNodeCard,
};

function toFlowNodes(
  nodes: ThreatGraphNode[],
  selectedId: string | null,
): ThreatFlowNode[] {
  const neighborhood =
    selectedId !== null ? getConnectedNodeIds(selectedId) : null;

  return nodes.map((threat) => ({
    id: threat.id,
    type: threat.kind,
    position: { x: threat.x, y: threat.y },
    data: {
      threat,
      dimmed: neighborhood !== null && !neighborhood.has(threat.id),
    },
    style: { width: threat.w },
    selected: threat.id === selectedId,
  }));
}

function toFlowEdges(
  edges: ThreatGraphEdge[],
  selectedId: string | null,
): Edge[] {
  const neighborhood =
    selectedId !== null ? getConnectedNodeIds(selectedId) : null;

  return edges.map((edge) => {
    const critical = edge.tone === "critical";
    const color = critical ? criticalEdgeColor : defaultEdgeColor;
    const inNeighborhood =
      neighborhood === null ||
      (neighborhood.has(edge.from) && neighborhood.has(edge.to));

    return {
      id: edge.id,
      source: edge.from,
      target: edge.to,
      type: "smoothstep",
      label: threatRelationLabels[edge.relation],
      labelStyle: {
        fill: "var(--muted-foreground)",
        fontSize: 10,
        opacity: inNeighborhood ? 1 : 0.2,
      },
      labelBgStyle: {
        fill: "var(--card)",
        fillOpacity: inNeighborhood ? 0.9 : 0.3,
      },
      labelBgPadding: [4, 2] as [number, number],
      labelBgBorderRadius: 4,
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color,
      },
      style: {
        stroke: color,
        strokeDasharray: "6 6",
        strokeWidth: critical ? 1.75 : 1.35,
        opacity: inNeighborhood ? 1 : 0.15,
      },
    };
  });
}

export function ThreatRelationshipMap({
  selectedId,
  onSelect,
  visibleNodeIds,
}: {
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  visibleNodeIds?: Set<string> | null;
}) {
  const nodesSource = React.useMemo(() => {
    if (!visibleNodeIds) return threatGraphNodes;
    return threatGraphNodes.filter((node) => visibleNodeIds.has(node.id));
  }, [visibleNodeIds]);

  const edgesSource = React.useMemo(() => {
    if (!visibleNodeIds) return threatGraphEdges;
    return threatGraphEdges.filter(
      (edge) =>
        visibleNodeIds.has(edge.from) && visibleNodeIds.has(edge.to),
    );
  }, [visibleNodeIds]);

  const [nodes, setNodes, onNodesChange] = useNodesState(
    toFlowNodes(nodesSource, selectedId),
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    toFlowEdges(edgesSource, selectedId),
  );
  const [isMounted, setIsMounted] = React.useState(false);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const flowRef = React.useRef<ReactFlowInstance<ThreatFlowNode, Edge> | null>(
    null,
  );
  const { resolvedTheme } = useTheme();
  const flowColorMode = resolvedTheme === "dark" ? "dark" : "light";
  const backgroundDotColor =
    resolvedTheme === "dark"
      ? "color-mix(in oklab, var(--muted-foreground) 42%, transparent)"
      : "hsl(var(--border))";

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  React.useEffect(() => {
    setNodes(toFlowNodes(nodesSource, selectedId));
    setEdges(toFlowEdges(edgesSource, selectedId));
  }, [nodesSource, edgesSource, selectedId, setNodes, setEdges]);

  React.useEffect(() => {
    if (!isFullscreen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [isFullscreen]);

  React.useEffect(() => {
    if (!isMounted) return;
    const frame = window.requestAnimationFrame(() => {
      flowRef.current?.fitView({ padding: 0.18, duration: 200 });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [isFullscreen, isMounted]);

  const flowLegend = (
    <div className="text-muted-foreground flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs">
      {(
        [
          { kind: "actor" as const, swatch: "bg-violet-500" },
          { kind: "technique" as const, swatch: "bg-sky-500" },
          {
            kinds: [
              { kind: "identity" as const, swatch: "bg-emerald-500" },
              { kind: "vulnerability" as const, swatch: "bg-rose-500" },
            ],
          },
          { kind: "alert" as const, swatch: "bg-orange-500" },
        ] as const
      ).map((item, index) => (
        <span key={index} className="contents">
          {index > 0 ? (
            <span className="text-muted-foreground/70 px-0.5" aria-hidden>
              →
            </span>
          ) : null}
          {"kinds" in item ? (
            <span className="flex items-center gap-2">
              {item.kinds.map((entry, entryIndex) => (
                <span key={entry.kind} className="contents">
                  {entryIndex > 0 ? (
                    <span className="text-muted-foreground/50" aria-hidden>
                      /
                    </span>
                  ) : null}
                  <span className="flex items-center gap-1.5">
                    <span className={cn("size-2 rounded-sm", entry.swatch)} />
                    {threatNodeKindLabels[entry.kind]}
                  </span>
                </span>
              ))}
            </span>
          ) : (
            <span className="flex items-center gap-1.5">
              <span className={cn("size-2 rounded-sm", item.swatch)} />
              {threatNodeKindLabels[item.kind]}
            </span>
          )}
        </span>
      ))}
    </div>
  );

  return (
    <>
      {isFullscreen ? (
        <div
          className="bg-muted/20 hidden h-full min-h-[360px] rounded-lg border border-dashed sm:min-h-[480px] lg:block lg:min-h-[520px]"
          aria-hidden
        />
      ) : null}
      <section
      className={cn(
        "bg-card flex min-h-0 flex-col border",
        isFullscreen
          ? "fixed inset-0 z-40 rounded-none"
          : "h-full rounded-lg",
      )}
    >
      <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold">Threat relationship map</h2>
        </div>
        <div className="hidden min-w-0 lg:block">{flowLegend}</div>
      </div>

      <div className="border-b px-4 py-2 lg:hidden">{flowLegend}</div>

      <div
        className={cn(
          "bg-background relative flex-1 overflow-hidden",
          isFullscreen
            ? "min-h-0"
            : "min-h-[360px] sm:min-h-[480px] lg:min-h-[520px]",
        )}
      >
        {isMounted ? (
          <ReactFlow
            colorMode={flowColorMode}
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onInit={(instance) => {
              flowRef.current = instance;
            }}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={(_event, node) => onSelect(node.id)}
            onPaneClick={() => onSelect(null)}
            fitView
            fitViewOptions={{ padding: 0.18 }}
            minZoom={0.35}
            maxZoom={1.6}
            nodesConnectable={false}
            nodesDraggable={false}
            elementsSelectable
            panOnDrag
            proOptions={{ hideAttribution: true }}
            className="!bg-background [&_.react-flow__controls-button]:!border-border [&_.react-flow__controls-button]:!bg-card [&_.react-flow__controls-button]:!text-foreground [&_.react-flow__attribution]:hidden [&_.react-flow__panel]:!m-3"
          >
            <Background color={backgroundDotColor} gap={24} size={1} />
            <Controls
              className="overflow-hidden rounded-[6px] border shadow-sm"
              position="top-left"
              showInteractive={false}
            />
          </ReactFlow>
        ) : (
          <div className="text-muted-foreground grid size-full place-items-center text-xs">
            Loading relationship map…
          </div>
        )}
      </div>

      <div className="text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t px-4 py-2.5 text-xs">
        <span className="flex items-center gap-2">
          <span className="inline-block h-px w-6 border-t border-dashed border-zinc-500" />
          Relation
        </span>
        <span className="flex items-center gap-2">
          <span className="inline-block h-px w-6 border-t border-dashed border-red-500" />
          Critical chain
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="ml-auto h-7 shrink-0 gap-1.5 rounded-md text-xs"
          onClick={() => setIsFullscreen((value) => !value)}
          aria-pressed={isFullscreen}
        >
          {isFullscreen ? (
            <>
              <Minimize2 className="size-3.5" />
              Exit
            </>
          ) : (
            <>
              <Maximize2 className="size-3.5" />
              Full screen
            </>
          )}
        </Button>
      </div>
    </section>
    </>
  );
}
