"use client";

import { useMemo } from "react";
import {
  Background,
  BackgroundVariant,
  Controls,
  Handle,
  MarkerType,
  Position,
  ReactFlow,
  useEdgesState,
  useNodesState,
  type Edge,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import { ArrowUpRight, Home, type LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { portfolioAreas } from "@/lib/site-data";
import { cn } from "@/lib/utils";

type SiteNodeData = {
  label: string;
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  accent: "blue" | "red" | "ink";
};

type SiteNode = Node<SiteNodeData, "site">;

const accentClasses: Record<SiteNodeData["accent"], string> = {
  blue: "border-[var(--accent-blue)]/60 text-[var(--accent-blue)]",
  red: "border-[var(--accent-red)]/60 text-[var(--accent-red)]",
  ink: "border-foreground/40 text-foreground",
};

const initialNodes: SiteNode[] = [
  {
    id: "home",
    type: "site",
    position: { x: 238, y: 156 },
    data: {
      label: "Home",
      title: "Joe Simo",
      description: "The center of the site: work, apps, design, writing.",
      href: "#",
      icon: Home,
      accent: "ink",
    },
  },
  ...portfolioAreas.map((area, index): SiteNode => {
    const positions = [
      { x: 8, y: 48 },
      { x: 8, y: 286 },
      { x: 472, y: 48 },
      { x: 472, y: 286 },
    ];

    return {
      id: area.value,
      type: "site",
      position: positions[index],
      data: {
        label: area.label,
        title: area.title,
        description: area.description,
        href: area.href,
        icon: area.icon,
        accent: index % 2 === 0 ? "blue" : "red",
      },
    };
  }),
];

const initialEdges: Edge[] = portfolioAreas.map((area, index) => ({
  id: `home-${area.value}`,
  source: "home",
  target: area.value,
  type: "smoothstep",
  animated: index === 1,
  markerEnd: {
    type: MarkerType.ArrowClosed,
    color: "var(--foreground)",
  },
  style: {
    stroke: "var(--foreground)",
    strokeOpacity: 0.28,
    strokeWidth: 1.4,
  },
}));

function SiteCanvasNode({ data, selected }: NodeProps<SiteNode>) {
  const Icon = data.icon;

  return (
    <div
      className={cn(
        "group w-56 rounded-lg border bg-background p-4 shadow-sm transition duration-300",
        "hover:-translate-y-0.5 hover:shadow-md",
        selected ? "border-foreground shadow-md" : "border-border",
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
            "grid size-9 place-items-center rounded-lg border",
            accentClasses[data.accent],
          )}
        >
          <Icon className="size-4" aria-hidden="true" />
        </span>
        <span className="font-mono text-xs text-muted-foreground">
          {data.label}
        </span>
      </div>

      <div className="mt-5 flex flex-col gap-2">
        <h2 className="text-xl font-semibold tracking-normal">{data.title}</h2>
        <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">
          {data.description}
        </p>
      </div>

      <Button
        variant="ghost"
        size="sm"
        render={<a href={data.href} className="nodrag mt-4 w-fit" />}
        nativeButton={false}
      >
        Open
        <ArrowUpRight data-icon="inline-end" />
      </Button>
    </div>
  );
}

export function SiteCanvas() {
  const nodeTypes = useMemo(() => ({ site: SiteCanvasNode }), []);
  const [nodes, , onNodesChange] = useNodesState<SiteNode>(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState<Edge>(initialEdges);

  return (
    <div className="site-flow relative h-[500px] overflow-hidden rounded-lg border border-border bg-muted/20">
      <div className="pointer-events-none absolute left-4 top-4 z-10 rounded-lg border border-border bg-background/90 px-3 py-2 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur">
        HTML-on-canvas workbench
      </div>
      <ReactFlow<SiteNode, Edge>
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        fitViewOptions={{ padding: 0.18 }}
        minZoom={0.32}
        maxZoom={1.4}
        nodesConnectable={false}
        edgesFocusable={false}
        panOnScroll
        zoomOnScroll={false}
        zoomOnDoubleClick={false}
        proOptions={{ hideAttribution: true }}
        colorMode="light"
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={22}
          size={1}
          color="oklch(0.145 0 0 / 0.22)"
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
