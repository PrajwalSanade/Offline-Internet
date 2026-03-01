import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AlertTriangle, MessageSquare, Store, Network, Wifi, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api, type Node } from "@/lib/api";
import EmergencyBroadcastModal from "@/components/EmergencyBroadcastModal";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [nodes, setNodes] = useState<Node[]>([]);
  const [broadcastOpen, setBroadcastOpen] = useState(false);

  useEffect(() => {
    api.getNodes().then(setNodes);
  }, []);

  // derive active nodes (use strict boolean check)
  const activeNodes = nodes.filter(n => n.isActive === true);

  return (
    <div className="md:pl-16">
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-5">
        {/* Status bar */}
        <motion.div variants={item} className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg bg-secondary px-3 py-2">
            <Wifi className="h-4 w-4 text-success" />
            <span className="text-xs font-mono">Mesh Active</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-secondary px-3 py-2">
            <Radio className="h-4 w-4 text-primary" />
            <span className="text-xs font-mono">{activeNodes.length} Nodes Nearby</span>
          </div>
        </motion.div>

        {/* Emergency Broadcast */}
        <motion.div variants={item}>
          <button
            onClick={() => setBroadcastOpen(true)}
            className="w-full rounded-xl border border-destructive/30 bg-destructive/10 p-5 text-left transition-all hover:bg-destructive/15 emergency-pulse"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive">
                <AlertTriangle className="h-6 w-6 text-destructive-foreground" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-destructive">Emergency Broadcast</h2>
                <p className="text-sm text-muted-foreground">Send alert to all nearby nodes</p>
              </div>
            </div>
          </button>
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <ActionCard
            icon={MessageSquare}
            title="Messages"
            subtitle={`${activeNodes.length} devices reachable`}
            onClick={() => navigate("/messaging")}
          />
          <ActionCard
            icon={Store}
            title="Relief Market"
            subtitle="Requests & offers"
            onClick={() => navigate("/marketplace")}
          />
          <ActionCard
            icon={Network}
            title="Network Map"
            subtitle="View mesh topology"
            onClick={() => navigate("/network")}
          />
        </motion.div>

        {/* Nearby Nodes */}
        <motion.div variants={item}>
          <h3 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">Nearby Nodes</h3>
          <div className="space-y-2">
            {activeNodes.map((node, i) => (
              <motion.div
                key={node.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.05 }}
                className="flex items-center justify-between rounded-lg bg-card border border-border p-3 card-glow-hover cursor-pointer"
                onClick={() => navigate("/messaging")}
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Radio className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{node.name}</p>
                    <p className="text-xs text-muted-foreground font-mono">{node.id}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1.5">
                    <SignalBar strength={node.signalStrength} />
                    <span className="text-xs text-muted-foreground">{node.distance}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">{node.lastSeen}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>

      <EmergencyBroadcastModal open={broadcastOpen} onOpenChange={setBroadcastOpen} />
    </div>
  );
}

function ActionCard({ icon: Icon, title, subtitle, onClick }: { icon: any; title: string; subtitle: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 text-left transition-all card-glow-hover hover:border-primary/20"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
    </button>
  );
}

function SignalBar({ strength }: { strength: number }) {
  const bars = strength > 80 ? 4 : strength > 60 ? 3 : strength > 40 ? 2 : 1;
  return (
    <div className="flex items-end gap-0.5 h-3">
      {[1, 2, 3, 4].map(i => (
        <div
          key={i}
          className={`w-1 rounded-full transition-colors ${
            i <= bars ? "bg-success" : "bg-muted"
          }`}
          style={{ height: `${i * 25}%` }}
        />
      ))}
    </div>
  );
}
