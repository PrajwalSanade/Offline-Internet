import apiClient from "./api";
import type { Device } from "./types";

export async function registerDevice(payload: { name: string; location?: string; device_type?: string }) {
  const res = await apiClient.post("/register-device", payload);
  // backend returns device_id, map to Device
  const mapped: Device = {
    id: res.device_id,
    name: res.name,
    distance: undefined,
    signalStrength: undefined,
    lastSeen: res.last_seen ? new Date(res.last_seen).toISOString() : undefined,
  };
  // persist device id locally
  try { localStorage.setItem("beacon_device_id", mapped.id); } catch {}
  return mapped;
}

export async function getNodes(): Promise<Device[]> {
  const res = await apiClient.get("/nodes");
  if (!Array.isArray(res)) return [];
  return res.map((d: any) => ({
    id: d.device_id,
    name: d.name,
    distance: d.distance || "",
    signalStrength: d.signal_strength || d.signalStrength || 0,
    lastSeen: d.last_seen ? new Date(d.last_seen).toISOString() : undefined,
  }));
}

export function getStoredDeviceId() {
  try { return localStorage.getItem("beacon_device_id"); } catch { return null; }
}
