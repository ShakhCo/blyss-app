import { createContext, useContext } from "react";

export interface SafeAreaInsets {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

const SafeAreaContext = createContext<SafeAreaInsets>({
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
});

export function SafeAreaProvider({
  children,
  value,
}: {
  children: React.ReactNode;
  value: SafeAreaInsets;
}) {
  return (
    <SafeAreaContext.Provider value={value}>
      {children}
    </SafeAreaContext.Provider>
  );
}

export function useSafeArea() {
  return useContext(SafeAreaContext);
}
