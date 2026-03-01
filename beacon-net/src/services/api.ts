import axios from "axios";

// API base URL driven by Vite env var `VITE_API_BASE_URL` (inlined at build time).
// For local development use: http://localhost:8000
// For Docker Compose use (frontend container -> backend container): http://backend:8000
// When you change `.env`, restart the Vite dev server so values are picked up.
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string) || "http://localhost:8000";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Response interceptor to unwrap data and centralize error logging
apiClient.interceptors.response.use(
  (res) => res.data,
  (error) => {
    // Log useful info for debugging
    // eslint-disable-next-line no-console
    console.error("API error:", {
      url: error?.config?.url,
      method: error?.config?.method,
      status: error?.response?.status,
      data: error?.response?.data,
      message: error?.message,
    });
    return Promise.reject(error);
  }
);

export default apiClient;
