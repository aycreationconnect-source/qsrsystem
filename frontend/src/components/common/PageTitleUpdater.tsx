import { useEffect } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';

interface PageMetadata {
  title: string;
  description: string;
  favicon: string;
}

export const PageTitleUpdater: React.FC = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const pathname = location.pathname;
    const modeParam = searchParams.get('mode');

    let meta: PageMetadata;

    if (pathname === '/dashboard') {
      meta = {
        title: 'Velora | Admin-panel - Management Dashboard',
        description:
          'Velora Cafe & QSR Admin Panel - Real-time metrics, live analytics, sales overview, and operations.',
        favicon: '/favicon.svg',
      };
    } else if (pathname === '/menu') {
      meta = {
        title: 'Velora | Menu Management - Dishes, Recipes & Categories',
        description:
          'Velora Menu Management - Manage dishes, beverages, categories, recipes, and add-ons.',
        favicon: '/favicon.svg',
      };
    } else if (pathname === '/inventory') {
      meta = {
        title: 'Velora | Inventory Management - Stock Tracking & Alerts',
        description:
          'Velora Inventory Management - Track raw ingredients, real-time stock levels, wastage, and movement history.',
        favicon: '/favicon.svg',
      };
    } else if (pathname === '/tables') {
      meta = {
        title: 'Velora | Table Setup - Floor Plans & Seating Architecture',
        description:
          'Velora Floor & Table Setup - Manage dine-in sections, seating layouts, and live table status.',
        favicon: '/favicon.svg',
      };
    } else if (pathname === '/settings') {
      meta = {
        title: 'Velora | Settings - Store Identity & System Configuration',
        description:
          'Velora System Settings - Store profile, tax rates, payment gateways, printers, and system configurations.',
        favicon: '/favicon.svg',
      };
    } else if (pathname === '/pos') {
      const mode = (modeParam || 'quick').trim().toLowerCase();
      const formattedMode = mode.charAt(0).toUpperCase() + mode.slice(1);
      const modeDesc =
        mode === 'table'
          ? 'Dine-in Floor & Table Operations'
          : mode === 'kiosk'
          ? 'Self-Ordering Kiosk Terminal'
          : 'Fast Counter Order & Express Billing';
      meta = {
        title: `Velora | POS | ${formattedMode} - ${modeDesc}`,
        description: `Velora POS Terminal (${formattedMode}) - ${modeDesc}. High-speed order entry, fast billing, and kitchen dispatch.`,
        favicon: '/favicon-pos.svg',
      };
    } else if (pathname === '/login') {
      meta = {
        title: 'Velora | Staff Login - Secure Authentication Portal',
        description:
          'Velora POS - High-performance QSR & Restaurant Management System secure staff login.',
        favicon: '/favicon.svg',
      };
    } else if (pathname === '/activate') {
      meta = {
        title: 'Velora | Station Activation - Terminal License Verification',
        description:
          'Velora POS - Terminal license verification and station database initialization portal.',
        favicon: '/favicon.svg',
      };
    } else {
      meta = {
        title: 'Velora | Next-Gen QSR & Restaurant Management',
        description:
          'Velora is a modern, ultra-responsive, offline-capable QSR and Cafe Management POS system.',
        favicon: '/favicon.svg',
      };
    }

    // 1. Update Document Title
    document.title = meta.title;

    // 2. Update Meta Title Tags
    const metaTitle = document.querySelector<HTMLMetaElement>('meta[name="title"]');
    if (metaTitle) metaTitle.content = meta.title;
    const ogTitle = document.querySelector<HTMLMetaElement>('meta[property="og:title"]');
    if (ogTitle) ogTitle.content = meta.title;
    const twTitle = document.querySelector<HTMLMetaElement>('meta[name="twitter:title"]');
    if (twTitle) twTitle.content = meta.title;

    // 3. Update Meta Description Tags
    const metaDesc = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (metaDesc) metaDesc.content = meta.description;
    const ogDesc = document.querySelector<HTMLMetaElement>('meta[property="og:description"]');
    if (ogDesc) ogDesc.content = meta.description;
    const twDesc = document.querySelector<HTMLMetaElement>('meta[name="twitter:description"]');
    if (twDesc) twDesc.content = meta.description;

    // 4. Update Dynamic Favicon
    let favicon = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
    if (favicon) {
      if (favicon.getAttribute('href') !== meta.favicon) {
        favicon.setAttribute('href', meta.favicon);
      }
    } else {
      favicon = document.createElement('link');
      favicon.rel = 'icon';
      favicon.type = 'image/svg+xml';
      favicon.setAttribute('href', meta.favicon);
      document.head.appendChild(favicon);
    }
  }, [location.pathname, searchParams]);

  return null;
};
