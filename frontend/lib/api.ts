import axios from "axios";
import { getAccessToken } from "./auth";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1";

export const api = axios.create({
  baseURL: API_BASE_URL,
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
    };

    if (data?.message) return data.message;
    if (data?.detail) return data.detail;

    return "خطایی در ارتباط با سرور رخ داد.";
  }

  return "خطای غیرمنتظره‌ای رخ داد.";
}