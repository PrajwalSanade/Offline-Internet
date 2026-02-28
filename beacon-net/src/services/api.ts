import axios from "axios";

// The API base URL is driven by the Vite environment variable `VITE_API_BASE_URL`.
// Whenever you change .env values, restart the development server so Vite can
// pick up the new values (the variables are inlined at build time).
const baseURL = (import.meta.env.VITE_API_BASE_URL as string) || "http://localhost:8000";

export const apiClient = axios.create({
  baseURL,
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
