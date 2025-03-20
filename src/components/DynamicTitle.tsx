import { useEffect } from 'react';
import { useStore } from '@/hooks/useStore';
import { useLocation } from 'react-router-dom';

const navItems = [
  { label: "Home", path: "/home" },
  { label: "Events", path: "/events" },
  { label: "Products", path: "/products" },
  { label: "Tickets", path: "/tickets" },
  { label: "Rewards", path: "/rewards" },
  { label: "Me", path: "/settings" },
];

export const DynamicTitle = () => {
  const storeName = useStore((state) => state.storeName);
  const location = useLocation();

  useEffect(() => {
    // Get the current path
    const currentPath = location.pathname;
    
    // Find matching nav item
    const matchingNavItem = navItems.find(item => 
      currentPath === item.path || 
      (item.path === "/home" && (currentPath === "/home" || currentPath === "/")) ||
      currentPath.startsWith(item.path)
    );

    // Set the title with both store name and page title
    const pageTitle = matchingNavItem ? matchingNavItem.label : 'Home';
    const title = storeName 
      ? `${pageTitle} | ${storeName}`
      : pageTitle;
      
    document.title = title;
  }, [storeName, location.pathname]);

  return null;
}; 