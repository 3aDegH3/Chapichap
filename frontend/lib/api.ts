import axios, { type InternalAxiosRequestConfig } from "axios";
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setTokens,
} from "./auth";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1";

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retryAfterRefresh?: boolean;
};

let refreshRequest: Promise<{ access: string; refresh: string }> | null = null;

async function refreshAccessToken() {
  const refresh = getRefreshToken();
  if (!refresh) throw new Error("Refresh token is unavailable.");

  const response = await axios.post<{ access: string; refresh?: string }>(
    `${API_BASE_URL}/auth/token/refresh/`,
    { refresh },
    { withCredentials: true },
  );

  const tokens = {
    access: response.data.access,
    refresh: response.data.refresh || refresh,
  };

  setTokens(tokens);
  return tokens;
}

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

api.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error)) {
      return Promise.reject(error);
    }

    const requestConfig = error.config as RetryableRequestConfig | undefined;
    const isUnauthorized = error.response?.status === 401;
    const isRefreshRequest = requestConfig?.url?.includes("/auth/token/refresh/");

    if (!requestConfig || !isUnauthorized || isRefreshRequest || requestConfig._retryAfterRefresh) {
      return Promise.reject(error);
    }

    requestConfig._retryAfterRefresh = true;

    try {
      refreshRequest ??= refreshAccessToken().finally(() => {
        refreshRequest = null;
      });

      const tokens = await refreshRequest;
      requestConfig.headers.Authorization = `Bearer ${tokens.access}`;
      return api(requestConfig);
    } catch (refreshError) {
      clearTokens();
      return Promise.reject(refreshError);
    }
  },
);

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

function normalizeApiErrorValue(value: unknown): string | null {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    const firstMessage = value.find((item) => typeof item === "string");
    return firstMessage || null;
  }
  if (value && typeof value === "object") {
    const nestedMessage = Object.values(value as Record<string, unknown>)
      .map(normalizeApiErrorValue)
      .find(Boolean);
    return nestedMessage || null;
  }
  return null;
}

export function getApiFieldErrors(error: unknown) {
  if (!axios.isAxiosError(error)) return {};

  const data = error.response?.data;
  if (!data || typeof data !== "object" || Array.isArray(data)) return {};

  const responseData = data as { errors?: unknown; [key: string]: unknown };
  const rawErrors =
    responseData.errors && typeof responseData.errors === "object"
      ? responseData.errors
      : responseData;

  return Object.entries(rawErrors as Record<string, unknown>).reduce<Record<string, string>>(
    (result, [field, value]) => {
      const message = normalizeApiErrorValue(value);
      if (message) result[field] = message;
      return result;
    },
    {}
  );
}
