// Mock API service for Offline Internet Emergency Communication System

export interface Node {
  id: string;
  name: string;
  distance: string;
  signalStrength: number;
  lastSeen: string;
}

export interface Message {
  id: string;
  from: string;
  to: string;
  content: string;
  timestamp: string;
  isSent: boolean;
}

export interface MarketplaceListing {
  id: string;
  type: "request" | "offer";
  title: string;
  description: string;
  timestamp: string;
  status: "open" | "resolved";
  author: string;
}

const MOCK_NODES: Node[] = [
  { id: "NODE-A7F2", name: "Relief Station Alpha", distance: "120m", signalStrength: 92, lastSeen: "Just now" },
  { id: "NODE-B3D1", name: "Medical Tent", distance: "340m", signalStrength: 78, lastSeen: "2 min ago" },
  { id: "NODE-C9E5", name: "Supply Depot", distance: "580m", signalStrength: 61, lastSeen: "5 min ago" },
  { id: "NODE-D4A8", name: "Command Post", distance: "1.2km", signalStrength: 45, lastSeen: "8 min ago" },
  { id: "NODE-E1F3", name: "Evacuation Point", distance: "890m", signalStrength: 53, lastSeen: "1 min ago" },
];

const MOCK_MESSAGES: Message[] = [
  { id: "1", from: "NODE-A7F2", to: "self", content: "Water supply running low at Station Alpha. Need resupply within 2 hours.", timestamp: "14:32", isSent: false },
  { id: "2", from: "self", to: "NODE-A7F2", content: "Copy that. Dispatching supply team now. ETA 45 minutes.", timestamp: "14:35", isSent: true },
  { id: "3", from: "NODE-B3D1", to: "self", content: "Medical tent requesting additional first aid kits.", timestamp: "14:40", isSent: false },
  { id: "4", from: "self", to: "NODE-B3D1", content: "Acknowledged. Adding to next supply run.", timestamp: "14:42", isSent: true },
];

const MOCK_LISTINGS: MarketplaceListing[] = [
  { id: "1", type: "request", title: "Portable Water Filters", description: "Need 20 portable water filters for displaced families in Zone B.", timestamp: "2 hours ago", status: "open", author: "NODE-A7F2" },
  { id: "2", type: "offer", title: "Solar Chargers Available", description: "We have 15 solar phone chargers available for distribution.", timestamp: "3 hours ago", status: "open", author: "NODE-C9E5" },
  { id: "3", type: "request", title: "Medical Supplies", description: "Urgent need for bandages, antiseptic, and pain medication.", timestamp: "5 hours ago", status: "resolved", author: "NODE-B3D1" },
  { id: "4", type: "offer", title: "Emergency Blankets", description: "50 emergency thermal blankets ready for pickup at Supply Depot.", timestamp: "1 hour ago", status: "open", author: "NODE-C9E5" },
  { id: "5", type: "request", title: "Generator Fuel", description: "Command post generator running low. Need 20L diesel.", timestamp: "30 min ago", status: "open", author: "NODE-D4A8" },
];

// Simulated API calls
export const api = {
  getNodes: async (): Promise<Node[]> => {
    await delay(300);
    return MOCK_NODES;
  },

  sendBroadcast: async (message: string, priority: "normal" | "high"): Promise<{ success: boolean }> => {
    await delay(500);
    return { success: true };
  },

  sendMessage: async (to: string, content: string): Promise<Message> => {
    await delay(300);
    const msg: Message = {
      id: Date.now().toString(),
      from: "self",
      to,
      content,
      timestamp: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }),
      isSent: true,
    };
    return msg;
  },

  getMessages: async (nodeId: string): Promise<Message[]> => {
    await delay(300);
    return MOCK_MESSAGES.filter(m => m.from === nodeId || m.to === nodeId);
  },

  getMarketplace: async (): Promise<MarketplaceListing[]> => {
    await delay(300);
    return [...MOCK_LISTINGS];
  },

  createListing: async (listing: Omit<MarketplaceListing, "id" | "timestamp" | "status" | "author">): Promise<MarketplaceListing> => {
    await delay(400);
    return {
      ...listing,
      id: Date.now().toString(),
      timestamp: "Just now",
      status: "open",
      author: "SELF",
    };
  },

  resolveListing: async (id: string): Promise<{ success: boolean }> => {
    await delay(300);
    return { success: true };
  },
};

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
