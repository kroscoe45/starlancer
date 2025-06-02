// src/components/providers/UnifiedDataStoreProvider.tsx
import { createContext, useContext, ReactNode } from "react";
import { useUnifiedDataStore } from "@/hooks/useUnifiedDataStore";
import { UnifiedWebsiteData } from "@/lib/mockDataGenerator";

interface UnifiedDataStoreContextType {
  websites: UnifiedWebsiteData[];
  loading: boolean;
  error: string | null;
  loadAWSData: () => Promise<void>;
  setMockData: (data: UnifiedWebsiteData[]) => void;
  clearData: () => void;
  refreshData: () => Promise<void>;
}

const UnifiedDataStoreContext =
  createContext<UnifiedDataStoreContextType | null>(null);

export function useUnifiedDataStoreContext() {
  const context = useContext(UnifiedDataStoreContext);
  if (!context) {
    throw new Error(
      "useUnifiedDataStoreContext must be used within UnifiedDataStoreProvider",
    );
  }
  return context;
}

interface UnifiedDataStoreProviderProps {
  children: ReactNode;
}

export function UnifiedDataStoreProvider({
  children,
}: UnifiedDataStoreProviderProps) {
  const dataStore = useUnifiedDataStore();

  return (
    <UnifiedDataStoreContext.Provider value={dataStore}>
      {children}
    </UnifiedDataStoreContext.Provider>
  );
}

// Export hook that components should use
export { useUnifiedDataStore as useUnifiedDataStoreHook } from "@/hooks/useUnifiedDataStore";
