import { useState, useEffect } from 'react';

const STORE_KEY = 'store';

export const useStore = () => {
  const [storeName, setStoreName] = useState<string>(() => 
    localStorage.getItem(STORE_KEY) || import.meta.env.VITE_DEFAULT_STORE
  );

  useEffect(() => {
    if (storeName) {
      localStorage.setItem(STORE_KEY, storeName);
    }
  }, [storeName]);

  const updateStoreName = (newStoreName: string) => {
    setStoreName(newStoreName);
  };

  return {
    storeName,
    updateStoreName,
  };
}; 