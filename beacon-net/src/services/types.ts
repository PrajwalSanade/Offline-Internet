export interface Device {
  id: string;
  name: string;
  distance?: string;
  signalStrength?: number;
  lastSeen?: string;
  isActive?: boolean;
  status?: string;
}

export interface Message {
  id: string;
  from: string;
  to?: string | null;
  content: string;
  timestamp: string;
  isSent?: boolean;
}

export interface MarketplaceListing {
  id: string;
  type: "request" | "offer";
  title: string;
  description?: string | null;
  timestamp?: string;
  status: "open" | "resolved" | string;
  author?: string;
}
