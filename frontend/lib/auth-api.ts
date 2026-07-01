import { api } from "./api";
import {
  AuthResponse,
  MeResponse,
  getRefreshToken,
} from "./auth";

export type RegisterPayload = {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
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

export async function requestEmailCode(purpose: "email_verify" | "password_reset" = "email_verify") {
  const response = await api.post("/auth/email/request-code/", { purpose });
  return response.data;
}

export async function verifyEmailCode(code: string, purpose: "email_verify" | "password_reset" = "email_verify") {
  const response = await api.post<MeResponse>("/auth/email/verify/", { code, purpose });
  return response.data;
}

export async function requestPasswordReset(email: string) {
  const response = await api.post("/auth/forgot-password/", { email });
  return response.data;
}

export async function resetPassword(payload: { email: string; code: string; password: string }) {
  const response = await api.post("/auth/reset-password/", payload);
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
