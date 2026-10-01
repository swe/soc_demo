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
  AppWindow,
  Cloud,
  HardDrive,
  Maximize2,
  Minimize2,
  Network,
  Shield,
  UserRound,
} from "lucide-react";
import { useTheme } from "next-themes";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import {
  type AttackStory,
  type AttackStoryNode,
  type AttackStoryNodeKind,
  attackStoryNodeKindLabels,
  attackStoryRelationLabels,
  getConnectedStoryNodeIds,
} from "./attack-story";

const defaultEdgeColor = "rgb(113 113 122)";
const criticalEdgeColor = "rgb(239 68 68)";

const kindStyles: Record<
  AttackStoryNodeKind,
  { accent: string; icon: typeof Shield; wash: string }
> = {
  user: {
    accent: "border-l-emerald-500",
    icon: UserRound,
    wash: "bg-emerald-500/5",
  },
  host: {
    accent: "border-l-sky-500",
    icon: HardDrive,
    wash: "bg-sky-500/5",
  },
  ip: {
    accent: "border-l-amber-500",
    icon: Network,
    wash: "bg-amber-500/5",
  },
  cloud: {
    accent: "border-l-violet-500",
    icon: Cloud,
    wash: "bg-violet-500/5",
  },
  app: {
    accent: "border-l-cyan-500",
    icon: AppWindow,
    wash: "bg-cyan-500/5",
  },
  technique: {
    accent: "border-l-orange-500",
    icon: Shield,
    wash: "bg-orange-500/5",
  },
  alert: {
    accent: "border-l-rose-500",
    icon: AlertTriangle,
    wash: "bg-rose-500/5",
  },
};

type StoryFlowNodeData = Record<string, unknown> & {
  entity: AttackStoryNode;
  dimmed?: boolean;
};

type StoryFlowNode = Node<StoryFlowNodeData, AttackStoryNodeKind>;

function StoryFlowNodeCard({ data, selected }: NodeProps<StoryFlowNode>) {
  const { entity, dimmed } = data;
  const style = kindStyles[entity.kind];
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
          <p className="truncate text-xs font-medium">{entity.label}</p>
          <p className="text-muted-foreground mt-0.5 truncate text-xs">
            {entity.subtitle ?? attackStoryNodeKindLabels[entity.kind]}
          </p>
        </div>
      </div>
      <div className="mt-2">
        <span className="text-muted-foreground text-xs tracking-wide uppercase">
          {attackStoryNodeKindLabels[entity.kind]}
        </span>
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
  user: StoryFlowNodeCard,
  host: StoryFlowNodeCard,
  ip: StoryFlowNodeCard,
  cloud: StoryFlowNodeCard,
  app: StoryFlowNodeCard,
  technique: StoryFlowNodeCard,
  alert: StoryFlowNodeCard,
};

function toFlowNodes(
  story: AttackStory,
  selectedId: string | null,
): StoryFlowNode[] {
  const neighborhood =
    selectedId !== null ? getConnectedStoryNodeIds(story, selectedId) : null;

  return story.entities.map((entity) => ({
    id: entity.id,
    type: entity.kind,
    position: { x: entity.x, y: entity.y },
    data: {
      entity,
      dimmed: neighborhood !== null && !neighborhood.has(entity.id),
    },
    style: { width: entity.w },
    selected: entity.id === selectedId,
  }));
}

function toFlowEdges(story: AttackStory, selectedId: string | null): Edge[] {
  const neighborhood =
    selectedId !== null ? getConnectedStoryNodeIds(story, selectedId) : null;

  return story.edges.map((edge) => {
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
      label: attackStoryRelationLabels[edge.relation],
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

export function AttackStoryGraph({ story }: { story: AttackStory }) {
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(
    toFlowNodes(story, selectedId),
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    toFlowEdges(story, selectedId),
  );
  const [isMounted, setIsMounted] = React.useState(false);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const flowRef = React.useRef<ReactFlowInstance<StoryFlowNode, Edge> | null>(
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
    setNodes(toFlowNodes(story, selectedId));
    setEdges(toFlowEdges(story, selectedId));
  }, [story, selectedId, setNodes, setEdges]);

  React.useEffect(() => {
    if (!isMounted) return;
    const frame = requestAnimationFrame(() => {
      flowRef.current?.fitView({ padding: 0.18, duration: 200 });
    });
    return () => cancelAnimationFrame(frame);
  }, [isMounted, story.incidentId, isFullscreen]);

  React.useEffect(() => {
    if (!isFullscreen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [isFullscreen]);

  if (!isMounted) {
    return (
      <div className="bg-muted/30 flex h-[420px] items-center justify-center rounded-lg border border-dashed sm:h-[480px]">
        <p className="text-muted-foreground text-sm">Loading attack graph…</p>
      </div>
    );
  }

  return (
    <>
      {isFullscreen ? (
        <div
          className="hidden h-[420px] sm:block sm:h-[480px]"
          aria-hidden
        />
      ) : null}
      <div
        className={cn(
          "bg-card relative overflow-hidden rounded-lg border",
          isFullscreen
            ? "fixed inset-3 z-50"
            : "h-[420px] w-full sm:h-[480px]",
        )}
      >
        <div className="absolute top-2 right-2 z-10 flex gap-1">
          <Button
            type="button"
            size="icon"
            variant="outline"
            className="bg-background/90 size-8 backdrop-blur"
            onClick={() => setIsFullscreen((value) => !value)}
            aria-label={isFullscreen ? "Exit fullscreen" : "Fullscreen graph"}
          >
            {isFullscreen ? (
              <Minimize2 className="size-3.5" />
            ) : (
              <Maximize2 className="size-3.5" />
            )}
          </Button>
        </div>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          colorMode={flowColorMode}
          fitView
          fitViewOptions={{ padding: 0.18 }}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable
          panOnScroll
          onInit={(instance) => {
            flowRef.current = instance;
          }}
          onNodeClick={(_, node) => {
            setSelectedId((current) => (current === node.id ? null : node.id));
          }}
          onPaneClick={() => setSelectedId(null)}
          proOptions={{ hideAttribution: true }}
          className="h-full w-full"
        >
          <Background gap={18} size={1} color={backgroundDotColor} />
          <Controls showInteractive={false} className="!bg-card !shadow-sm" />
        </ReactFlow>
      </div>
    </>
  );
}
