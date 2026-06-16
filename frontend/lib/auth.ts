export type AuthUser = {
  id: number;
  email: string;
  phone_number: string | null;
  username: string | null;
  avatar: string | null;
  date_joined: string;
};

export type AuthTokens = {
  access: string;
  refresh: string;
};

export type AuthResponse = {
  success: boolean;
  message: string;
  data: {
    user: AuthUser;
    tokens: AuthTokens;
  };
};

export type MeResponse = {
  success: boolean;
  message: string;
  data: {
    user: AuthUser;
  };
};

const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";

const isBrowser = typeof window !== "undefined";

export function setTokens(tokens: AuthTokens) {
  if (!isBrowser) return;

  localStorage.setItem(ACCESS_TOKEN_KEY, tokens.access);
  localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh);
}

export function getAccessToken() {
  if (!isBrowser) return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken() {
  if (!isBrowser) return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function clearTokens() {
  if (!isBrowser) return;

  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function hasAccessToken() {
  return Boolean(getAccessToken());
}