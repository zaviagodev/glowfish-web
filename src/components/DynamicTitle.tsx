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

  // Default description
  const description = "เลือกซื้อสินค้าที่ถูกใจผ่าน Storefront หน้าร้านออนไลน์ที่ใช้งานง่าย ช่วยให้คุณขายสินค้าได้อย่างมีประสิทธิภาพ";

  // Get the absolute URL for the thumbnail and current page
  const thumbnailUrl = new URL('/zaviago_storefront_thumbnail.png', window.location.origin).toString();
  const currentUrl = window.location.href;

  useEffect(() => {
    // Force update meta tags
    const metaTags = document.getElementsByTagName('meta');
    for (let i = 0; i < metaTags.length; i++) {
      const tag = metaTags[i];
      if (tag.getAttribute('property') === 'og:title') {
        tag.setAttribute('content', title);
      }
      if (tag.getAttribute('property') === 'og:url') {
        tag.setAttribute('content', currentUrl);
      }
      if (tag.getAttribute('name') === 'twitter:title') {
        tag.setAttribute('content', title);
      }
    }
  }, [title, currentUrl]);

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={thumbnailUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      {storeName && <meta property="og:site_name" content={storeName} />}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={currentUrl} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={thumbnailUrl} />
    </Helmet>
  );
}; 