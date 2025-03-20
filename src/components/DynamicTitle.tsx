import { useEffect } from 'react';
import { useStore } from '@/hooks/useStore';

export const DynamicTitle = () => {
  const storeName = useStore((state) => state.storeName);

  useEffect(() => {
    // Set default title if no store name is available
    const title = storeName 
      ? `Zaviago Storefront | ${storeName}`
      : 'Zaviago Storefront';
    document.title = title;
  }, [storeName]);

  return null;
}; 