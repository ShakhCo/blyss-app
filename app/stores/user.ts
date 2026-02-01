import { create } from "zustand";

export interface TmaUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
}

interface UserState {
  user: TmaUser | null;
  setUser: (user: TmaUser | null) => void;
}

export const useUserStore = create<UserState>()((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));
