"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Background,
  BackgroundVariant,
  Controls,
  Handle,
  MarkerType,
  Panel,
  Position,
  ReactFlow,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type Edge,
  type Node,
  type NodeProps,
  type ReactFlowInstance,
} from "@xyflow/react";
import { useTheme } from "next-themes";

import { SiteIcon } from "@/components/site/site-icons";
import {
  navItems,
  siteRecords,
  type AccentKey,
  type SiteRecord,
  type SiteNodeId,
} from "@/lib/site-data";
import { cn } from "@/lib/utils";

type SiteNodeData = Omit<SiteRecord, "id" | "canvas"> & {
  isFocused?: boolean;
  isRelated?: boolean;
};

type SiteNode = Node<SiteNodeData, "site">;
type SiteEdge = Edge;

const nodeSize = {
  width: 260,
  height: 172,
};

const accentClasses: Record<AccentKey, string> = {
  ink: "border-foreground/45 text-foreground",
  signal: "border-[var(--workbench-accent)]/70 text-[var(--workbench-accent)]",
  green: "border-[var(--workbench-green)]/70 text-[var(--workbench-green)]",
  red: "border-[var(--workbench-red)]/70 text-[var(--workbench-red)]",
};

const actionTargets = new Set(["work", "apps", "design", "writing", "links"]);

const initialNodes: SiteNode[] = siteRecords.map((record) => ({
  id: record.id,
  type: "site",
  position: record.canvas,
  width: nodeSize.width,
  height: nodeSize.height,
  draggable: false,
  selectable: false,
  ariaLabel: `${record.label}: ${record.status}`,
  data: {
    label: record.label,
    kind: record.kind,
    status: record.status,
    primaryAction: record.primaryAction,
    secondaryAction: record.secondaryAction,
    iconKey: record.iconKey,
    accent: record.accent,
    sectionAnchor: record.sectionAnchor,
    externalUrl: record.externalUrl,
  },
}));

const initialEdges: SiteEdge[] = siteRecords
  .filter((record) => record.id !== "home")
  .map((record) => ({
    id: `home-${record.id}`,
    source: "home",
    target: record.id,
    type: "smoothstep",
    animated: Boolean(record.canvas.animated),
    selectable: false,
    focusable: false,
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: "var(--border)",
    },
    style: {
      stroke: "var(--foreground)",
      strokeOpacity: 0.22,
      strokeWidth: 1.25,
    },
  }));

function useReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);

    update();
    media.addEventListener("change", update);

    return () => media.removeEventListener("change", update);
  }, []);

  return reducedMotion;
}

function isRelatedNode(focusId: string | null, nodeId: string) {
  if (!focusId || focusId === "home") {
    return true;
  }

  if (focusId === nodeId || nodeId === "home") {
    return true;
  }

  return initialEdges.some(
    (edge) =>
      (edge.source === focusId && edge.target === nodeId) ||
      (edge.target === focusId && edge.source === nodeId),
  );
}

function isActiveEdge(focusId: string | null, edge: SiteEdge) {
  if (!focusId) {
    return false;
  }

  if (focusId === "home") {
    return true;
  }

  return edge.source === focusId || edge.target === focusId;
}

function getNodeCenter(record: SiteRecord, node?: SiteNode) {
  const width = node?.measured?.width ?? node?.width ?? nodeSize.width;
  const height = node?.measured?.height ?? node?.height ?? nodeSize.height;

  return {
    x: record.canvas.x + width / 2,
    y: record.canvas.y + height / 2,
  };
}

function actionTargetProps(action: SiteRecord["primaryAction"]) {
  return action.external
    ? {
        target: "_blank",
        rel: "noreferrer",
      }
    : {};
}

function SiteCanvasNode({ data }: NodeProps<SiteNode>) {
  const kindLabel = data.kind === "shelf" ? "area" : data.kind;

  return (
    <article
      className={cn(
        "group/site-node grid w-[260px] gap-4 rounded-[1.1rem] border bg-background/96 p-4 text-left shadow-[0_1px_0_oklch(0.145_0_0_/_0.05)] backdrop-blur transition duration-300",
        "hover:-translate-y-1 hover:shadow-[0_24px_70px_oklch(0.145_0_0_/_0.12)]",
        data.isFocused
          ? "border-foreground shadow-[0_24px_70px_oklch(0.145_0_0_/_0.16)]"
          : "border-border",
        data.isRelated === false && "opacity-55",
      )}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!size-2 !border-background !bg-foreground"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!size-2 !border-background !bg-foreground"
      />

      <div className="flex items-start justify-between gap-3">
        <span
          className={cn(
            "grid size-10 place-items-center rounded-md border bg-background",
            accentClasses[data.accent],
          )}
        >
          <SiteIcon iconKey={data.iconKey} aria-hidden />
        </span>
        <span className="font-mono text-[11px] uppercase text-muted-foreground">
          {kindLabel}
        </span>
      </div>

      <div className="grid gap-2">
        <h2 className="text-xl font-medium tracking-normal">{data.label}</h2>
        <p className="text-sm leading-6 text-muted-foreground">{data.status}</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <a
          href={data.primaryAction.href}
          {...actionTargetProps(data.primaryAction)}
          className="nodrag inline-flex h-8 items-center gap-1.5 rounded-md bg-foreground px-2.5 font-mono text-[11px] uppercase text-background outline-none transition hover:-translate-y-px focus-visible:ring-3 focus-visible:ring-ring/45"
        >
          {data.primaryAction.label}
          <SiteIcon iconKey="arrowUpRight" aria-hidden />
        </a>
        {data.secondaryAction ? (
          <a
            href={data.secondaryAction.href}
            {...actionTargetProps(data.secondaryAction)}
            className="nodrag inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 font-mono text-[11px] uppercase text-muted-foreground outline-none transition hover:bg-muted hover:text-foreground focus-visible:bg-muted focus-visible:text-foreground focus-visible:ring-3 focus-visible:ring-ring/35"
          >
            {data.secondaryAction.label}
          </a>
        ) : null}
      </div>
    </article>
  );
}

function CanvasController({
  flow,
  focusedNodeId,
  reducedMotion,
  onFocus,
  onReset,
}: {
  flow: ReactFlowInstance<SiteNode, SiteEdge> | null;
  focusedNodeId: SiteNodeId | null;
  reducedMotion: boolean;
  onFocus: (nodeId: SiteNodeId) => void;
  onReset: () => void;
}) {
  const { getNode } = useReactFlow<SiteNode, SiteEdge>();

  const focusRecord = useCallback(
    (nodeId: SiteNodeId) => {
      const record = siteRecords.find((candidate) => candidate.id === nodeId);

      if (!record || !flow) {
        return;
      }

      const center = getNodeCenter(record, getNode(nodeId));

      onFocus(nodeId);
      void flow.setCenter(center.x, center.y, {
        duration: reducedMotion ? 0 : 420,
        zoom: nodeId === "home" ? 0.82 : 0.98,
      });
    },
    [flow, getNode, onFocus, reducedMotion],
  );

  return (
    <Panel position="top-left" className="site-flow-panel">
      <button type="button" onClick={onReset}>
        Reset
      </button>
      {navItems.map((item) => {
        const nodeId = item.href.slice(1) as SiteNodeId;

        if (!actionTargets.has(nodeId)) {
          return null;
        }

        return (
          <button
            key={item.href}
            type="button"
            aria-pressed={focusedNodeId === nodeId}
            onClick={() => focusRecord(nodeId)}
          >
            {item.label}
          </button>
        );
      })}
    </Panel>
  );
}

export function SiteCanvasDesktop() {
  const nodeTypes = useMemo(() => ({ site: SiteCanvasNode }), []);
  const { resolvedTheme } = useTheme();
  const reducedMotion = useReducedMotion();
  const [nodes, , onNodesChange] = useNodesState<SiteNode>(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState<SiteEdge>(initialEdges);
  const [flow, setFlow] =
    useState<ReactFlowInstance<SiteNode, SiteEdge> | null>(null);
  const [focusedNodeId, setFocusedNodeId] = useState<SiteNodeId | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<SiteNodeId | null>(null);

  const focusId = hoveredNodeId ?? focusedNodeId;

  const renderedNodes = useMemo(
    () =>
      nodes.map((node) => ({
        ...node,
        data: {
          ...node.data,
          isFocused: node.id === focusId,
          isRelated: isRelatedNode(focusId, node.id),
        },
      })),
    [focusId, nodes],
  );

  const renderedEdges = useMemo(
    () =>
      edges.map((edge) => {
        const active = isActiveEdge(focusId, edge);

        return {
          ...edge,
          animated: !reducedMotion && edge.animated && (!focusId || active),
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: active ? "var(--workbench-accent)" : "var(--border)",
          },
          style: {
            stroke: active ? "var(--workbench-accent)" : "var(--foreground)",
            strokeOpacity: focusId ? (active ? 0.78 : 0.09) : 0.22,
            strokeWidth: active ? 2 : 1.25,
          },
        };
      }),
    [edges, focusId, reducedMotion],
  );

  const resetMap = useCallback(() => {
    setFocusedNodeId(null);
    void flow?.fitView({
      padding: 0.08,
      duration: reducedMotion ? 0 : 420,
    });
  }, [flow, reducedMotion]);

  const focusNode = useCallback((nodeId: SiteNodeId) => {
    setFocusedNodeId(nodeId);
  }, []);

  return (
    <div className="site-flow relative hidden h-[min(72svh,680px)] min-h-[560px] overflow-hidden rounded-[1.5rem] border border-border bg-background shadow-[0_24px_90px_oklch(0.145_0_0_/_0.08)] md:block">
      <div className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(90deg,var(--border)_1px,transparent_1px),linear-gradient(0deg,var(--border)_1px,transparent_1px)] bg-[size:64px_64px] opacity-[0.18]" />
      <ReactFlow<SiteNode, SiteEdge>
        aria-label="Joe Simo operating map"
        nodes={renderedNodes}
        edges={renderedEdges}
        nodeTypes={nodeTypes}
        onInit={setFlow}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={(_, node) => focusNode(node.id as SiteNodeId)}
        onNodeMouseEnter={(_, node) => setHoveredNodeId(node.id as SiteNodeId)}
        onNodeMouseLeave={() => setHoveredNodeId(null)}
        onPaneClick={resetMap}
        fitView
        fitViewOptions={{ padding: 0.08 }}
        minZoom={0.34}
        maxZoom={1.18}
        nodesConnectable={false}
        nodesDraggable={false}
        elementsSelectable={false}
        edgesFocusable={false}
        panOnDrag
        panOnScroll={false}
        zoomOnScroll={false}
        zoomOnDoubleClick={false}
        preventScrolling={false}
        proOptions={{ hideAttribution: false }}
        colorMode={resolvedTheme === "dark" ? "dark" : "light"}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={28}
          size={1}
          color="var(--border)"
        />
        <CanvasController
          flow={flow}
          focusedNodeId={focusedNodeId}
          reducedMotion={reducedMotion}
          onFocus={focusNode}
          onReset={resetMap}
        />
        <Controls
          position="bottom-right"
          showInteractive={false}
          orientation="horizontal"
        />
      </ReactFlow>
    </div>
  );
}
