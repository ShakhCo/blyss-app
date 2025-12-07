import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface UserData {
  _id: string;
  telegram_id: number;
  first_name: string;
  last_name: string;
  phone_number: string;
  date_created: string;
}

interface UserState {
  user: UserData | null;
  setUser: (user: UserData) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      clearUser: () => set({ user: null }),
    }),
    {
      name: "user",
      partialize: (state) => ({ user: state.user }),
    }
  )
);

// Helper function to check authentication
export const isAuthenticated = (user: UserData | null): boolean => {
  return !!user?.phone_number;
};
