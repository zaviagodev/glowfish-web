import { createContext, useContext, useEffect, useState } from "react";
import { useQuery, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useStore } from "./useStore";

interface StoreConfig {
  [key: string]: any;
}

interface ConfigContextType {
  config: StoreConfig;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<unknown>;
  setConfig: (config: StoreConfig) => void;
}

const ConfigContext = createContext<ConfigContextType>({
  config: {},
  isLoading: false,
  error: null,
  refetch: async () => {},
  setConfig: () => {},
});

// Create a client
const queryClient = new QueryClient();

const ConfigProviderContent = ({ children }: { children: React.ReactNode }) => {
  const { storeName } = useStore();
  const [config, setConfig] = useState<StoreConfig>({});

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["store-config", storeName],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("get-store-config?store_name=" + storeName, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (error) throw error;
      return data;
    },
    enabled: !!storeName,
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 30, // 30 minutes
  });

  // Initialize language from localStorage
  useEffect(() => {
    const savedLocale = localStorage.getItem('locale') || 'th';
    setConfig(prev => ({
      ...prev,
      default_language: savedLocale
    }));
    
    // Also set in localStorage if it's not already set
    if (!localStorage.getItem('locale')) {
      localStorage.setItem('locale', 'th');
    }
  }, []);

  useEffect(() => {
    if (data) {
      setConfig(data);
    }
  }, [data]);

  return (
    <ConfigContext.Provider value={{ config, isLoading, error: error as Error | null, refetch, setConfig }}>
      {children}
    </ConfigContext.Provider>
  );
};

export const ConfigProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProviderContent>{children}</ConfigProviderContent>
    </QueryClientProvider>
  );
};

export const useConfig = () => useContext(ConfigContext);

export default useConfig;