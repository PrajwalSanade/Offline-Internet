import type { Device, Message as ApiMessage, MarketplaceListing } from "@/services/types";
import * as deviceService from "@/services/deviceService";
import * as messageService from "@/services/messageService";
import * as marketplaceService from "@/services/marketplaceService";

// Expose types under the legacy names used across the app
export type Node = Device;
export type Message = ApiMessage;

// Backwards-compatible `api` object used by existing pages
export const api = {
  getNodes: async (): Promise<Node[]> => deviceService.getNodes(),

  // sendMessage(to: string, content: string)
  sendMessage: async (to: string, content: string): Promise<Message> => {
    const stored = deviceService.getStoredDeviceId();
    const sourceId = stored || (await deviceService.registerDevice({ name: "WebClient" })).id;
    return messageService.sendMessage(sourceId, to, content);
  },

  getMessages: async (nodeId: string) => {
    const stored = deviceService.getStoredDeviceId();
    const deviceId = stored || null;
    // backend returns messages for nodeId; we simply proxy
    return messageService.getMessages(nodeId);
  },

  sendBroadcast: async (message: string, priority: "normal" | "high" = "normal") => {
    const stored = deviceService.getStoredDeviceId();
    const sourceId = stored || (await deviceService.registerDevice({ name: "WebClient" })).id;
    return messageService.broadcastMessage(sourceId, message, priority);
  },

  getMarketplace: async (): Promise<MarketplaceListing[]> => marketplaceService.getMarketplace(),

  createListing: async (payload: any) => marketplaceService.createListing(payload),

  resolveListing: async (id: string, resolved_with?: string) => marketplaceService.resolveListing(id, resolved_with || ""),
};

export type MarketplaceListingType = MarketplaceListing;

