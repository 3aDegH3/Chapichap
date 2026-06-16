"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";

import {
  AuthUser,
  clearTokens,
  hasAccessToken,
  setTokens,
} from "@/lib/auth";
import {
  getMe,
  loginUser,
  logoutUser,
  registerUser,
  LoginPayload,
  RegisterPayload,
} from "@/lib/auth-api";
import { getApiErrorMessage } from "@/lib/api";

type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();

  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function refreshUser() {
    try {
      if (!hasAccessToken()) {
        setUser(null);
        return;
      }

      const response = await getMe();
      setUser(response.data.user);
    } catch {
      clearTokens();
      setUser(null);
    }
  }

  async function login(payload: LoginPayload) {
    try {
      setError(null);
      setIsLoading(true);

      const response = await loginUser(payload);

      setTokens(response.data.tokens);
      setUser(response.data.user);

      router.push("/");
    } catch (err) {
      setError(getApiErrorMessage(err));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }

  async function register(payload: RegisterPayload) {
    try {
      setError(null);
      setIsLoading(true);

      const response = await registerUser(payload);

      setTokens(response.data.tokens);
      setUser(response.data.user);

      router.push("/");
    } catch (err) {
      setError(getApiErrorMessage(err));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }

  async function logout() {
    try {
      await logoutUser();
    } catch {
      // حتی اگر سرور خطا داد، از سمت فرانت خروج انجام می‌شود.
    } finally {
      clearTokens();
      setUser(null);
      router.push("/login");
    }
  }

  useEffect(() => {
    async function bootstrapAuth() {
      setIsLoading(true);
      await refreshUser();
      setIsLoading(false);
    }

    bootstrapAuth();
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      error,
      login,
      register,
      logout,
      refreshUser,
    }),
    [user, isLoading, error]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}