import { useState, useEffect } from 'react';

const STORE_KEY = 'store';
const DEFAULT_STORE = import.meta.env.VITE_DEFAULT_STORE;

export const useStore = () => {
  // Prioritize env variable, fallback to localStorage only if env is not set
  const [storeName, setStoreName] = useState<string>(() => 
    DEFAULT_STORE || localStorage.getItem(STORE_KEY) || ''
  );

  useEffect(() => {
    // Only save to localStorage if env variable is not set
    if (storeName && !DEFAULT_STORE) {
      localStorage.setItem(STORE_KEY, storeName);
    }
  }, [storeName]);

  const updateStoreName = (newStoreName: string) => {
    // Only allow updates if env variable is not set
    if (!DEFAULT_STORE) {
      setStoreName(newStoreName);
    }
  };

  return {
    storeName,
    updateStoreName,
  };
}; 