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
  setUser: (user: UserData) => void;
  clearUser: () => void;
  setHasSeenIntroduction: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      user_has_seen_introduction: false,
      setUser: (user) => set({ user }),
      // Only clear user, NOT user_has_seen_introduction
      clearUser: () => set({ user: null }),
      setHasSeenIntroduction: () => set({ user_has_seen_introduction: true }),
    }),
    {
      name: "user",
      partialize: (state) => ({
        user: state.user,
        user_has_seen_introduction: state.user_has_seen_introduction,
      }),
    }
  )
);

export function isAuthenticated(user: UserData | null): boolean {
  if (!user) return false;

  return !!(
    user.id &&
    user.telegram_id &&
    user.first_name &&
    user.last_name &&
    user.phone_number &&
    user.is_verified
  );
}
