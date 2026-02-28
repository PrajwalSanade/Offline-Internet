import apiClient from "./api";
import type { MarketplaceListing } from "./types";

export async function getMarketplace() {
  const res = await apiClient.get("/marketplace");
  if (!Array.isArray(res)) return [];
  return res.map((l: any) => ({
    id: l.listing_id,
    type: l.type || (l.status === "request" ? "request" : "offer"),
    title: l.title,
    description: l.description,
    timestamp: l.created_at,
    status: l.status || (l.status === undefined ? (l.available ? "open" : "resolved") : l.status),
    author: l.device_id,
  })) as MarketplaceListing[];
}

export async function createListing(payload: { device_id: string; title: string; description?: string; resource_type?: string; quantity?: number; unit?: string; price_credits?: number; expires_at?: string }) {
  const res = await apiClient.post("/marketplace", payload);
  return {
    id: res.listing_id,
    type: "request",
    title: res.title,
    description: res.description,
    timestamp: res.created_at,
    status: res.status,
    author: res.device_id,
  } as MarketplaceListing;
}

export async function resolveListing(id: string, resolved_with: string) {
  const res = await apiClient.put(`/marketplace/${encodeURIComponent(id)}/resolve`, { resolved_with, status: "resolved" });
  return res;
}
