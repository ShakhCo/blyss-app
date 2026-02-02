import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface TmaUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
}

interface UserState {
  user: TmaUser | null;
  privacyPolicyAccepted: boolean;
  setUser: (user: TmaUser | null) => void;
  acceptPrivacyPolicy: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      privacyPolicyAccepted: false,
      setUser: (user) => set({ user }),
      acceptPrivacyPolicy: () => set({ privacyPolicyAccepted: true }),
    }),
    {
      name: "tma-user",
      partialize: (state) => ({
        privacyPolicyAccepted: state.privacyPolicyAccepted,
      }),
    }
  )
);
