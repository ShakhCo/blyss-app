import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { NearestBusiness } from "~/lib/business-api";

interface BusinessesState {
  businesses: NearestBusiness[];
  last_updated: number | null;
  setBusinesses: (businesses: NearestBusiness[]) => void;
}

export const useBusinessesStore = create<BusinessesState>()(
  persist(
    (set) => ({
      businesses: [],
      last_updated: null,

      setBusinesses: (businesses) =>
        set({
          businesses,
          last_updated: Date.now(),
        }),
    }),
    {
      name: "blyss-businesses",
      partialize: (state) => ({
        businesses: state.businesses,
        last_updated: state.last_updated,
      }),
    }
  )
);
