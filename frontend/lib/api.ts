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

  if (typeof FormData !== "undefined" && config.data instanceof FormData) {
    if (typeof config.headers.delete === "function") {
      config.headers.delete("Content-Type");
    } else {
      delete (config.headers as Record<string, unknown>)["Content-Type"];
    }
  }

  return config;
});

export function getApiErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;

    if (typeof data === "string") {
      const normalized = data.trim().toLowerCase();

      if (!normalized) return "خطایی در ارتباط با سرور رخ داد.";
      if (normalized.startsWith("<!doctype") || normalized.startsWith("<html")) {
        return "پاسخ نامعتبر از سرور دریافت شد. مسیر API یا اجرای بک‌اند را بررسی کن.";
      }

      return data.trim();
    }

    const responseData = data as {
      message?: string;
      errors?: unknown;
      detail?: string;
      [key: string]: unknown;
    };

    if (responseData?.message) return responseData.message;
    if (responseData?.detail) return responseData.detail;
    if (responseData?.errors && typeof responseData.errors === "object") {
      const firstError = Object.values(responseData.errors as Record<string, unknown>)[0];
      if (Array.isArray(firstError) && typeof firstError[0] === "string") return firstError[0];
      if (typeof firstError === "string") return firstError;
    }
    const firstFieldError = Object.values(responseData || {}).find(
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
