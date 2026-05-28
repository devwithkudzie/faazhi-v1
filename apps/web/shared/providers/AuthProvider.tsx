"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import type { User } from "@/shared/types";
import { findUserById } from "@/shared/data/users";
import { apiRequest } from "@/shared/api/client";

interface AuthValue {
  user: User | null;
  token: string | null;
  hydrated: boolean;
  signIn: (email: string, password: string) => Promise<{ ok: true; user: User } | { ok: false; error: string }>;
  signUp: (input: { name: string; email: string; password: string }) => Promise<{ ok: true; user: User } | { ok: false; error: string }>;
  signOut: () => Promise<void>;
  loginAs: (userId: string) => Promise<{ ok: true; user: User } | { ok: false; error: string }>;
}

const AuthContext = createContext<AuthValue | undefined>(undefined);

const STORAGE_KEY = "papermark.session.v1";

interface StoredSession {
  token: string;
  user: User;
}

interface AuthResponse {
  token: string;
  user: User;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      const raw = window.localStorage.getItem(STORAGE_KEY);

      if (raw) {
        const stored = JSON.parse(raw) as StoredSession;

        setToken(stored.token);
        setUser(stored.user);

        const result = await apiRequest<{ user: User }>("/api/auth/me", {
          token: stored.token,
        });

        if (!cancelled) {
          setUser(result.user);
        }
      }
    }

    restoreSession()
      .catch(() => {
        window.localStorage.removeItem(STORAGE_KEY);
        setToken(null);
        setUser(null);
      })
      .finally(() => {
        if (!cancelled) setHydrated(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const persist = useCallback((nextUser: User | null, nextToken: string | null) => {
    setUser(nextUser);
    setToken(nextToken);

    try {
      if (nextUser && nextToken) {
        window.localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ token: nextToken, user: nextUser }),
        );
      } else {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // ignore
    }
  }, []);

  const signIn: AuthValue["signIn"] = useCallback(
    async (email, password) => {
      try {
        const result = await apiRequest<AuthResponse>("/api/auth/sign-in", {
          method: "POST",
          body: JSON.stringify({ email, password }),
        });

        persist(result.user, result.token);
        return { ok: true, user: result.user };
      } catch (error) {
        return {
          ok: false,
          error:
            error instanceof Error
              ? error.message
              : "Invalid email or password.",
        };
      }
    },
    [persist],
  );

  const signUp: AuthValue["signUp"] = useCallback(
    async (input) => {
      try {
        const result = await apiRequest<AuthResponse>("/api/auth/sign-up", {
          method: "POST",
          body: JSON.stringify(input),
        });

        persist(result.user, result.token);
        return { ok: true, user: result.user };
      } catch (error) {
        return {
          ok: false,
          error:
            error instanceof Error
              ? error.message
              : "Could not create account.",
        };
      }
    },
    [persist],
  );

  const signOut = useCallback(async () => {
    const currentToken = token;
    persist(null, null);

    if (currentToken) {
      await apiRequest<void>("/api/auth/sign-out", {
        method: "POST",
        token: currentToken,
      }).catch(() => undefined);
    }
  }, [persist, token]);

  const loginAs = useCallback(
    async (userId: string) => {
      const foundUser = findUserById(userId);

      if (!foundUser?.password) {
        return { ok: false as const, error: "Demo account was not found." };
      }

      return signIn(foundUser.email, foundUser.password);
    },
    [signIn],
  );

  const value = useMemo(
    () => ({
      user,
      token,
      hydrated,
      signIn,
      signUp,
      signOut,
      loginAs,
    }),
    [user, token, hydrated, signIn, signUp, signOut, loginAs],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be inside AuthProvider");
  }

  return context;
}
