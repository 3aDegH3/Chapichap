import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
import { getAccessToken } from "./auth";

export const api = axios.create({
  baseURL: `${BASE_URL}/api/v1`,
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});