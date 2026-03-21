import type { Session, SupabaseClient, User } from "@supabase/supabase-js";
import { create } from "zustand";

interface AuthState {
  session: Session | null;
  user: User | null;
  loading: boolean;
  _supabase: SupabaseClient | null;
  initialize: (supabase: SupabaseClient | null) => Promise<() => void>;
  signInWithEmail: (email: string, password: string) => Promise<{ error: string | null }>;
  signUpWithEmail: (email: string, password: string) => Promise<{ error: string | null }>;
  signInWithGitHub: (redirectUrl?: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  loading: true,
  _supabase: null,

  initialize: async (supabase) => {
    if (!supabase) {
      set({ loading: false });
      return () => {};
    }
    set({ _supabase: supabase });
    const { data } = await supabase.auth.getSession();
    set({ session: data.session, user: data.session?.user ?? null, loading: false });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      set({ session, user: session?.user ?? null });
    });
    return () => listener.subscription.unsubscribe();
  },

  signInWithEmail: async (email, password) => {
    const supabase = get()._supabase;
    if (!supabase) return { error: "Supabase not configured" };
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  },

  signUpWithEmail: async (email, password) => {
    const supabase = get()._supabase;
    if (!supabase) return { error: "Supabase not configured" };
    const { error } = await supabase.auth.signUp({ email, password });
    return { error: error?.message ?? null };
  },

  signInWithGitHub: async (redirectUrl) => {
    const supabase = get()._supabase;
    if (!supabase) return { error: "Supabase not configured" };
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: { redirectTo: redirectUrl },
    });
    return { error: error?.message ?? null };
  },

  signOut: async () => {
    const supabase = get()._supabase;
    if (!supabase) return;
    await supabase.auth.signOut();
    set({ session: null, user: null });
  },
}));
