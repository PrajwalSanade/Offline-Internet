import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Package, HandHelping, Plus, Check, Clock } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { api, type MarketplaceListing } from "@/lib/api";
import { toast } from "sonner";

export default function Marketplace() {
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [tab, setTab] = useState<"request" | "offer">("request");
  const [createOpen, setCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newType, setNewType] = useState<"request" | "offer">("request");

  useEffect(() => {
    api.getMarketplace().then(setListings);
  }, []);

  const filtered = listings.filter(l => l.type === tab);

  const handleCreate = async () => {
    if (!newTitle.trim() || !newDesc.trim()) return;
    const listing = await api.createListing({ type: newType, title: newTitle, description: newDesc });
    setListings(prev => [listing, ...prev]);
    setNewTitle("");
    setNewDesc("");
    setCreateOpen(false);
    toast.success("Listing created successfully");
  };

  const handleResolve = async (id: string) => {
    await api.resolveListing(id);
    setListings(prev => prev.map(l => l.id === id ? { ...l, status: "resolved" } : l));
    toast.success("Listing marked as resolved");
  };

  return (
    <div className="md:pl-16 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Relief Marketplace</h2>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5">
              <Plus className="h-4 w-4" /> New Listing
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create Listing</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex gap-1">
                {(["request", "offer"] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => setNewType(t)}
                    className={`flex-1 rounded-md py-2 text-xs font-medium transition-all ${
                      newType === t ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {t === "request" ? "Request" : "Offer"}
                  </button>
                ))}
              </div>
              <Input
                placeholder="Title"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                className="bg-background border-border"
              />
              <Textarea
                placeholder="Description"
                value={newDesc}
                onChange={e => setNewDesc(e.target.value)}
                className="bg-background border-border min-h-[100px]"
              />
              <Button onClick={handleCreate} disabled={!newTitle.trim() || !newDesc.trim()} className="w-full">
                Submit Listing
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg bg-secondary p-1">
        {(["request", "offer"] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 flex items-center justify-center gap-1.5 rounded-md py-2 text-xs font-medium transition-all ${
              tab === t ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
            }`}
          >
            {t === "request" ? <HandHelping className="h-3.5 w-3.5" /> : <Package className="h-3.5 w-3.5" />}
            {t === "request" ? "Requests" : "Offers"}
          </button>
        ))}
      </div>

      {/* Listings */}
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {filtered.map(listing => (
            <motion.div
              key={listing.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="rounded-xl border border-border bg-card p-4 card-glow-hover"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-semibold truncate">{listing.title}</h3>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        listing.status === "open"
                          ? "bg-success/10 text-success"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {listing.status === "open" ? <Clock className="h-2.5 w-2.5" /> : <Check className="h-2.5 w-2.5" />}
                      {listing.status}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{listing.description}</p>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-mono">
                    <span>{listing.author}</span>
                    <span>·</span>
                    <span>{listing.timestamp}</span>
                  </div>
                </div>
                {listing.status === "open" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleResolve(listing.id)}
                    className="shrink-0 text-xs"
                  >
                    Resolve
                  </Button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
