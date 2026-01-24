import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface UserData {
  id: string;
  telegram_id: number;
  first_name: string;
  last_name: string;
  phone_number: string;
  is_verified: boolean;
}

interface UserState {
  user: UserData | null;
  user_has_seen_introduction: boolean;
  access_token: string | null;
  refresh_token: string | null;
  expires_at: string | null;
  setUser: (user: UserData) => void;
  setTokens: (access_token: string, refresh_token: string, expires_at: string) => void;
  clearUser: () => void;
  setHasSeenIntroduction: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      user_has_seen_introduction: false,
      access_token: null,
      refresh_token: null,
      expires_at: null,
      setUser: (user) => set({ user }),
      setTokens: (access_token, refresh_token, expires_at) =>
        set({ access_token, refresh_token, expires_at }),
      // Only clear user and tokens, NOT user_has_seen_introduction
      clearUser: () => set({ user: null, access_token: null, refresh_token: null, expires_at: null }),
      setHasSeenIntroduction: () => set({ user_has_seen_introduction: true }),
    }),
    {
      name: "user",
      partialize: (state) => ({
        user: state.user,
        user_has_seen_introduction: state.user_has_seen_introduction,
        access_token: state.access_token,
        refresh_token: state.refresh_token,
        expires_at: state.expires_at,
      }),
    }
  )
);

/**
 * Check if user has valid authentication based on access_token presence
 */
export function isAuthenticated(access_token: string | null): boolean {
  return !!access_token;
}

/**
 * Check if access token is expired
 */
export function isTokenExpired(expires_at: string | null): boolean {
  if (!expires_at) return true;
  return new Date(expires_at) < new Date();
}
