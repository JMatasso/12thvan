"use client";

import { useState, useEffect, useCallback, createContext, useContext } from "react";
import { supabase } from "./supabase";
import type { UserRole } from "./types";

export interface AuthUser {
  id: string;
  auth_id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  photo_url?: string;
  bio?: string;
}

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<AuthUser>) => Promise<void>;
  changePassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>;
  isAdmin: boolean;
  isDriver: boolean;
}

const AuthContext = createContext<AuthState>({
  user: null,
  loading: true,
  login: async () => ({ success: false }),
  register: async () => ({ success: false }),
  logout: async () => {},
  updateProfile: async () => {},
  changePassword: async () => ({ success: false }),
  isAdmin: false,
  isDriver: false,
});

export function useAuth() {
  return useContext(AuthContext);
}

export { AuthContext };

async function fetchUserProfile(authId: string): Promise<AuthUser | null> {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("auth_id", authId)
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    auth_id: data.auth_id,
    name: data.name,
    email: data.email,
    phone: data.phone,
    role: data.role as UserRole,
    photo_url: data.photo_url,
    bio: data.bio,
  };
}

export function useAuthProvider(): AuthState {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function init() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user && mounted) {
        const profile = await fetchUserProfile(session.user.id);
        if (mounted) setUser(profile);
      }
      if (mounted) setLoading(false);
    }

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const profile = await fetchUserProfile(session.user.id);
        if (mounted) setUser(profile);
      } else {
        if (mounted) setUser(null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { success: false, error: error.message };
    return { success: true };
  }, []);

  const register = useCallback(async (name: string, email: string, password: string, phone?: string) => {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) return { success: false, error: authError.message };
    if (!authData.user) return { success: false, error: "Registration failed" };

    // Create the user profile in our users table
    const { error: profileError } = await supabase.from("users").insert({
      auth_id: authData.user.id,
      name,
      email,
      phone: phone || null,
      role: "rider",
    });

    if (profileError) return { success: false, error: profileError.message };

    return { success: true };
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (updates: Partial<AuthUser>) => {
    if (!user) return;

    const dbUpdates: Record<string, unknown> = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.email !== undefined) dbUpdates.email = updates.email;
    if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
    if (updates.photo_url !== undefined) dbUpdates.photo_url = updates.photo_url;
    if (updates.bio !== undefined) dbUpdates.bio = updates.bio;

    const { error } = await supabase
      .from("users")
      .update(dbUpdates)
      .eq("id", user.id);

    if (!error) {
      setUser({ ...user, ...updates });
    }
  }, [user]);

  const changePassword = useCallback(async (newPassword: string) => {
    if (!user) return { success: false, error: "Not logged in" };
    if (newPassword.length < 6) return { success: false, error: "Password must be at least 6 characters" };

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) return { success: false, error: error.message };
    return { success: true };
  }, [user]);

  return {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    isAdmin: user?.role === "admin",
    isDriver: user?.role === "driver",
  };
}
