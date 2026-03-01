import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { api, type Node } from "@/lib/api";

const SELF_NODE = { id: "DEV-X1F9", name: "You", x: 300, y: 250 };

function getNodePositions(nodes: Node[]) {
  const cx = 300, cy = 250, r = 160;
  return nodes.map((node, i) => {
    const angle = (2 * Math.PI * i) / nodes.length - Math.PI / 2;
    return {
      ...node,
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
    };
  });
}

export default function NetworkMap() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [animatingPath, setAnimatingPath] = useState<number | null>(null);

  useEffect(() => {
    api.getNodes().then(setNodes);
  }, []);

  // only include nodes explicitly marked active
  const activeNodes = nodes.filter(n => n.isActive === true);
  const positioned = getNodePositions(activeNodes);

  const simulateHop = useCallback((index: number) => {
    setAnimatingPath(index);
    setTimeout(() => setAnimatingPath(null), 1500);
  }, []);

  return (
    <div className="md:pl-16 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Network Topology</h2>
        <span className="text-xs font-mono text-muted-foreground">{activeNodes.length} nodes discovered</span>
      </div>

      <div className="rounded-xl border border-border bg-card p-4 overflow-hidden">
        <svg viewBox="0 0 600 500" className="w-full h-auto max-h-[60vh]">
          {/* Grid */}
          <defs>
            <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
              <path d="M 30 0 L 0 0 0 30" fill="none" stroke="hsl(222, 30%, 15%)" strokeWidth="0.5" />
            </pattern>
            <radialGradient id="centerGlow">
              <stop offset="0%" stopColor="hsl(213, 94%, 52%)" stopOpacity="0.15" />
              <stop offset="100%" stopColor="hsl(213, 94%, 52%)" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="600" height="500" fill="url(#grid)" />
          <circle cx={SELF_NODE.x} cy={SELF_NODE.y} r="100" fill="url(#centerGlow)" />

          {/* Connections */}
          {positioned.map((node, i) => (
            <g key={`line-${node.id}`}>
              <line
                x1={SELF_NODE.x}
                y1={SELF_NODE.y}
                x2={node.x}
                y2={node.y}
                stroke={animatingPath === i ? "hsl(213, 94%, 52%)" : "hsl(222, 30%, 20%)"}
                strokeWidth={animatingPath === i ? 2 : 1}
                strokeDasharray={animatingPath === i ? "none" : "4 4"}
              />
              {animatingPath === i && (
                <motion.circle
                  cx={SELF_NODE.x}
                  cy={SELF_NODE.y}
                  r="4"
                  fill="hsl(213, 94%, 52%)"
                  initial={{ cx: SELF_NODE.x, cy: SELF_NODE.y }}
                  animate={{ cx: node.x, cy: node.y }}
                  transition={{ duration: 1, ease: "easeInOut" }}
                />
              )}
            </g>
          ))}

          {/* Self node */}
          <circle cx={SELF_NODE.x} cy={SELF_NODE.y} r="18" fill="hsl(213, 94%, 52%)" opacity="0.2" className="node-pulse" />
          <circle cx={SELF_NODE.x} cy={SELF_NODE.y} r="10" fill="hsl(213, 94%, 52%)" />
          <text x={SELF_NODE.x} y={SELF_NODE.y + 28} textAnchor="middle" className="fill-foreground text-[11px] font-semibold">
            You
          </text>
          <text x={SELF_NODE.x} y={SELF_NODE.y + 40} textAnchor="middle" className="fill-muted-foreground text-[9px] font-mono">
            {SELF_NODE.id}
          </text>

          {/* Remote nodes */}
          {positioned.map((node, i) => {
            const sigColor =
              node.signalStrength > 70 ? "hsl(142, 71%, 45%)" :
              node.signalStrength > 40 ? "hsl(38, 92%, 50%)" :
              "hsl(0, 72%, 51%)";
            return (
              <g key={node.id} onClick={() => simulateHop(i)} className="cursor-pointer">
                <circle cx={node.x} cy={node.y} r="14" fill={sigColor} opacity="0.15" className="node-pulse" />
                <circle cx={node.x} cy={node.y} r="7" fill={sigColor} />
                <text x={node.x} y={node.y + 22} textAnchor="middle" className="fill-foreground text-[10px] font-medium">
                  {node.name}
                </text>
                <text x={node.x} y={node.y + 33} textAnchor="middle" className="fill-muted-foreground text-[8px] font-mono">
                  {node.id}
                </text>
                {/* Hop badge */}
                <rect x={node.x + 10} y={node.y - 20} width="20" height="14" rx="4" fill="hsl(222, 41%, 10%)" stroke="hsl(222, 30%, 20%)" strokeWidth="1" />
                <text x={node.x + 20} y={node.y - 10} textAnchor="middle" className="fill-muted-foreground text-[8px] font-mono">
                  {i + 1}h
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <p className="text-xs text-muted-foreground text-center">Click a node to simulate message hop animation</p>
    </div>
  );
}
