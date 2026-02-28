import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EmergencyBroadcastModal({ open, onOpenChange }: Props) {
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState<"normal" | "high">("high");
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) return;
    setSending(true);
    try {
      await api.sendBroadcast(message, priority);
      toast.success("Emergency broadcast sent to all nearby nodes", {
        description: `Priority: ${priority.toUpperCase()}`,
      });
      setMessage("");
      onOpenChange(false);
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-destructive/30 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Emergency Broadcast
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Textarea
            placeholder="Describe the emergency situation..."
            value={message}
            onChange={e => setMessage(e.target.value)}
            className="min-h-[120px] bg-background border-border"
            autoFocus
          />
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Priority:</span>
            <div className="flex gap-1">
              {(["normal", "high"] as const).map(p => (
                <button
                  key={p}
                  onClick={() => setPriority(p)}
                  className={`rounded-md px-3 py-1 text-xs font-medium transition-all ${
                    priority === p
                      ? p === "high"
                        ? "bg-destructive text-destructive-foreground"
                        : "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {p.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          <Button
            onClick={handleSend}
            disabled={!message.trim() || sending}
            className="w-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {sending ? "Broadcasting..." : "Send Emergency Broadcast"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
