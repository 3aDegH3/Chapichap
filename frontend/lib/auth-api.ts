import { api } from "./api";
import {
  AuthResponse,
  MeResponse,
  getRefreshToken,
} from "./auth";

export type RegisterPayload = {
  email: string;
  password: string;
  username?: string;
  phone_number?: string;
};

export type LoginPayload = {
  identifier: string;
  password: string;
};

export async function registerUser(payload: RegisterPayload) {
  const response = await api.post<AuthResponse>("/auth/register/", payload);
  return response.data;
}

export async function loginUser(payload: LoginPayload) {
  const response = await api.post<AuthResponse>("/auth/login/", payload);
  return response.data;
}

export async function getMe() {
  const response = await api.get<MeResponse>("/auth/me/");
  return response.data;
}

export async function logoutUser() {
  const refresh = getRefreshToken();

  if (!refresh) {
    return {
      success: true,
      message: "خروج انجام شد.",
    };
  }

  const response = await api.post("/auth/logout/", {
    refresh,
  });

  return response.data;
}