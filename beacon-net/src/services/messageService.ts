import apiClient from "./api";
import type { Message } from "./types";

export async function sendMessage(sourceId: string, destinationId: string | null, content: string) {
  const payload = {
    source_id: sourceId,
    destination_id: destinationId,
    content,
    is_encrypted: false,
    is_broadcast: destinationId ? false : true,
  };
  const res = await apiClient.post("/send-message", payload);
  // map response to frontend Message
  const mapped: Message = {
    id: res.message_id,
    from: res.source_id,
    to: res.destination_id,
    content: res.content,
    timestamp: res.timestamp ? new Date(res.timestamp).toISOString() : new Date().toISOString(),
    isSent: res.source_id === sourceId,
  };
  return mapped;
}

export async function getMessages(deviceId: string, opts?: { limit?: number; offset?: number }) {
  const res = await apiClient.get(`/messages/${encodeURIComponent(deviceId)}?limit=${opts?.limit || 100}&offset=${opts?.offset || 0}`);
  if (!Array.isArray(res)) return [];
  return res.map((m: any) => ({
    id: m.message_id,
    from: m.source_id,
    to: m.destination_id,
    content: m.content,
    timestamp: m.timestamp ? new Date(m.timestamp).toISOString() : new Date().toISOString(),
    isSent: m.source_id === deviceId,
  })) as Message[];
}

export async function broadcastMessage(sourceId: string, content: string, priority: "normal" | "high" = "normal") {
  const payload = { source_id: sourceId, content, is_encrypted: false, max_hops: 10 };
  const res = await apiClient.post("/broadcast", payload);
  return {
    success: true,
    id: res.message_id,
  };
}
