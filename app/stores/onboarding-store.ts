import { create } from "zustand";

interface OnboardingData {
  id?: string;
  phone_number?: string;
  telegram_id?: number;
  first_name?: string;
  last_name?: string;
  is_verified?: boolean;
}

interface OnboardingState {
  data: OnboardingData | null;
  setData: (data: Partial<OnboardingData>) => void;
  clearData: () => void;
}

const initialData: OnboardingData | null = null;

export const useOnboardingStore = create<OnboardingState>((set) => ({
  data: initialData,
  setData: (newData) => set((state) => ({
    data: state.data ? { ...state.data, ...newData } : newData
  })),
  clearData: () => set({ data: initialData }),
}));
