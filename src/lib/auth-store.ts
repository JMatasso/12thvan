"use client";

import { useState, useEffect, useCallback, createContext, useContext } from "react";
import type { UserRole } from "./types";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
}

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAdmin: boolean;
  isDriver: boolean;
}

const STORAGE_KEY = "12thvan_auth";

// In-memory user database (replace with Supabase in production)
const USERS_DB_KEY = "12thvan_users_db";

function getStoredUsers(): AuthUser[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(USERS_DB_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  // Seed with default admins and drivers
  const defaults: (AuthUser & { password: string })[] = [
    { id: "admin-1", name: "Admin", email: "admin@12thvan.com", phone: "9795551111", role: "admin", password: "admin123" },
    { id: "driver-1", name: "Jake Morrison", email: "jake@12thvan.com", phone: "9795551234", role: "driver", password: "driver123" },
    { id: "driver-2", name: "Sarah Chen", email: "sarah@12thvan.com", phone: "9795555678", role: "driver", password: "driver123" },
  ];
  localStorage.setItem(USERS_DB_KEY, JSON.stringify(defaults));
  return defaults;
}

function getStoredPasswords(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(USERS_DB_KEY);
    if (!raw) return {};
    const users = JSON.parse(raw);
    const map: Record<string, string> = {};
    for (const u of users) {
      if (u.password) map[u.email] = u.password;
    }
    return map;
  } catch {
    return {};
  }
}

export function addUserToDB(user: AuthUser & { password: string }) {
  const users = getStoredUsers();
  const existing = users.find((u) => u.email === user.email);
  if (existing) return false;
  const allRaw = localStorage.getItem(USERS_DB_KEY);
  const all = allRaw ? JSON.parse(allRaw) : [];
  all.push(user);
  localStorage.setItem(USERS_DB_KEY, JSON.stringify(all));
  return true;
}

export function getAllUsers(): (AuthUser & { password?: string })[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(USERS_DB_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function updateUserInDB(email: string, updates: Partial<AuthUser>) {
  const raw = localStorage.getItem(USERS_DB_KEY);
  if (!raw) return;
  const users = JSON.parse(raw);
  const idx = users.findIndex((u: AuthUser) => u.email === email);
  if (idx >= 0) {
    users[idx] = { ...users[idx], ...updates };
    localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
  }
}

export function removeUserFromDB(email: string) {
  const raw = localStorage.getItem(USERS_DB_KEY);
  if (!raw) return;
  const users = JSON.parse(raw).filter((u: AuthUser) => u.email !== email);
  localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
}

const AuthContext = createContext<AuthState>({
  user: null,
  loading: true,
  login: async () => ({ success: false }),
  logout: () => {},
  isAdmin: false,
  isDriver: false,
});

export function useAuth() {
  return useContext(AuthContext);
}

export { AuthContext };

export function useAuthProvider(): AuthState {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch {}
    setLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    // Initialize users DB if needed
    getStoredUsers();
    const passwords = getStoredPasswords();

    const storedPassword = passwords[email];

    if (storedPassword && storedPassword === password) {
      const allRaw = localStorage.getItem(USERS_DB_KEY);
      const all = allRaw ? JSON.parse(allRaw) : [];
      const found = all.find((u: AuthUser) => u.email === email);
      if (found) {
        const authUser: AuthUser = {
          id: found.id,
          name: found.name,
          email: found.email,
          phone: found.phone,
          role: found.role,
        };
        setUser(authUser);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(authUser));
        return { success: true };
      }
    }

    // Allow any email/pass (6+ chars) to register as rider
    if (email && password.length >= 6 && !storedPassword) {
      const newUser: AuthUser = {
        id: `rider-${Date.now()}`,
        name: email.split("@")[0],
        email,
        role: "rider",
      };
      addUserToDB({ ...newUser, password });
      setUser(newUser);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
      return { success: true };
    }

    return { success: false, error: "Invalid email or password" };
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    user,
    loading,
    login,
    logout,
    isAdmin: user?.role === "admin",
    isDriver: user?.role === "driver",
  };
}
