import axios from "axios";
import { getAccessToken } from "./auth";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1";

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export function getApiErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as {
      message?: string;
      errors?: unknown;
      detail?: string;
      [key: string]: unknown;
    };

    if (data?.message) return data.message;
    if (data?.detail) return data.detail;
    if (data?.errors && typeof data.errors === "object") {
      const firstError = Object.values(data.errors as Record<string, unknown>)[0];
      if (Array.isArray(firstError) && typeof firstError[0] === "string") return firstError[0];
      if (typeof firstError === "string") return firstError;
    }
    const firstFieldError = Object.values(data || {}).find(
      (value) => Array.isArray(value) || typeof value === "string"
    );
    if (Array.isArray(firstFieldError) && typeof firstFieldError[0] === "string") {
      return firstFieldError[0];
    }
    if (typeof firstFieldError === "string") return firstFieldError;

    return "خطایی در ارتباط با سرور رخ داد.";
  }

  return "خطای غیرمنتظره‌ای رخ داد.";
}
