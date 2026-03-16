import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { api, setAuthToken } from "@/utils/api";

type Role = "teacher" | "student";

export type AuthUser = {
  _id: string;
  name: string;
  email: string;
  role: Role;
  createdAt?: string;
  updatedAt?: string;
};

type AuthResponse = { token: string; user: AuthUser };

type AuthContextValue = {
  user?: AuthUser;
  token?: string;
  loading: boolean;
  hydrated: boolean;
  isAuthenticated: boolean;
  login: (payload: { email: string; password: string }) => Promise<void>;
  register: (payload: {
    name: string;
    email: string;
    password: string;
    role: Role;
  }) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser>();
  const [token, setToken] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  const setSession = useCallback((nextToken?: string, nextUser?: AuthUser) => {
    setToken(nextToken);
    setUser(nextUser);
    setAuthToken(nextToken ?? null);
    if (nextToken && nextUser) {
      AsyncStorage.setItem("auth_token", nextToken);
      AsyncStorage.setItem("auth_user", JSON.stringify(nextUser));
    } else {
      AsyncStorage.multiRemove(["auth_token", "auth_user"]);
    }
  }, []);

  // load saved session on first mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [savedToken, savedUser] = await Promise.all([
          AsyncStorage.getItem("auth_token"),
          AsyncStorage.getItem("auth_user"),
        ]);
        if (!cancelled && savedToken && savedUser) {
          const parsedUser = JSON.parse(savedUser) as AuthUser;
          setSession(savedToken, parsedUser);
        }
      } finally {
        if (!cancelled) setHydrated(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [setSession]);

  const handleAuthResponse = useCallback(
    (data: AuthResponse) => {
      setSession(data.token, data.user);
    },
    [setSession],
  );

  const login = useCallback(
    async (payload: { email: string; password: string }) => {
      setLoading(true);
      try {
        const response = await api.post<AuthResponse>("/auth/login", payload);
        handleAuthResponse(response);
      } finally {
        setLoading(false);
      }
    },
    [handleAuthResponse],
  );

  const register = useCallback(
    async (payload: {
      name: string;
      email: string;
      password: string;
      role: Role;
    }) => {
      setLoading(true);
      try {
        const response = await api.post<AuthResponse>(
          "/auth/register",
          payload,
        );
        handleAuthResponse(response);
      } finally {
        setLoading(false);
      }
    },
    [handleAuthResponse],
  );

  const logout = useCallback(() => {
    setSession(undefined, undefined);
  }, [setSession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      loading,
      hydrated,
      isAuthenticated: Boolean(token),
      login,
      register,
      logout,
    }),
    [user, token, loading, hydrated, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
