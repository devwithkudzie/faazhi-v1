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
import { findUserByEmail, findUserById } from "@/shared/data/users";

interface AuthValue {
  user: User | null;
  hydrated: boolean;
  signIn: (email: string, password: string) => { ok: true } | { ok: false; error: string };
  signOut: () => void;
  loginAs: (userId: string) => void;
}

const AuthContext = createContext<AuthValue | undefined>(undefined);

const STORAGE_KEY = "papermark.session.v1";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);

      if (raw) {
        const id = JSON.parse(raw) as string;
        const foundUser = findUserById(id);

        if (foundUser) {
          setUser(foundUser);
        }
      }
    } catch {
      // ignore
    } finally {
      setHydrated(true);
    }
  }, []);

  const persist = useCallback((nextUser: User | null) => {
    setUser(nextUser);

    try {
      if (nextUser) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser.id));
      } else {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // ignore
    }
  }, []);

  const signIn: AuthValue["signIn"] = useCallback(
    (email, password) => {
      const foundUser = findUserByEmail(email);

      if (!foundUser || foundUser.password !== password) {
        return { ok: false, error: "Invalid email or password." };
      }

      persist(foundUser);
      return { ok: true };
    },
    [persist],
  );

  const signOut = useCallback(() => {
    persist(null);
  }, [persist]);

  const loginAs = useCallback(
    (userId: string) => {
      const foundUser = findUserById(userId);

      if (foundUser) {
        persist(foundUser);
      }
    },
    [persist],
  );

  const value = useMemo(
    () => ({
      user,
      hydrated,
      signIn,
      signOut,
      loginAs,
    }),
    [user, hydrated, signIn, signOut, loginAs],
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