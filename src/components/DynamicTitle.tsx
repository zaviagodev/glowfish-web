import { useEffect } from 'react';
import { useStore } from '@/hooks/useStore';
import { useLocation } from 'react-router-dom';
import { navItems } from './navigation/BottomNav';
import { Helmet } from 'react-helmet-async';

export const DynamicTitle = () => {
  const storeName = useStore((state) => state.storeName);
  const location = useLocation();

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

  // Get the absolute URL for the thumbnail
  const thumbnailUrl = `${window.location.origin}/zaviago_storefront_thumbnail.png`;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta property="og:title" content={title} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={window.location.href} />
      <meta property="og:image" content={thumbnailUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      {storeName && <meta property="og:site_name" content={storeName} />}
      <meta name="twitter:title" content={title} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:image" content={thumbnailUrl} />
    </Helmet>
  );
}; 