import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Tooltip } from '../ui';
import {
  Menu,
  Bell,
  Boxes,
  Receipt,
  ShieldAlert,
  CheckCheck,
} from 'lucide-react';
import { cn } from '../../lib/utils';

export interface HeaderProps {
  onToggleMobileNav?: () => void;
  onOpenStoreProfile?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobileNav }) => {
  const { currentUser, storeProfile, licenseStatus, appData } = useApp();
  const location = useLocation();

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [readNotificationIds, setReadNotificationIds] = useState<Set<string>>(new Set());
  const notificationRef = useRef<HTMLDivElement>(null);

  // Close notifications dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(e.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    if (isNotificationsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isNotificationsOpen]);

  // Dynamic notification list based on live store data
  const lowStockItems = (appData.inventory || []).filter(
    (inv) =>
      inv.status === 'Low Stock' ||
      inv.status === 'Out of Stock' ||
      (typeof inv.stock === 'number' && inv.stock <= inv.threshold)
  );

  const recentOrders = (appData.orders || []).slice(0, 4);

  const notifications: Array<{
    id: string;
    type: 'inventory' | 'order' | 'license';
    title: string;
    description: string;
    time?: string;
  }> = [];

  if (licenseStatus && licenseStatus.daysRemaining <= 15) {
    notifications.push({
      id: 'license-warning',
      type: 'license',
      title: 'Subscription License Alert',
      description: `Station license expires in ${licenseStatus.daysRemaining} days. Renew to avoid offline locking.`,
    });
  }

  lowStockItems.slice(0, 4).forEach((item) => {
    notifications.push({
      id: `stock-${item.id || item.name || item.item}`,
      type: 'inventory',
      title: `Low Stock: ${item.name || item.item}`,
      description: `Only ${item.stock} ${item.unit} remaining (Threshold: ${item.threshold} ${item.unit})`,
    });
  });

  recentOrders.forEach((order) => {
    notifications.push({
      id: `order-${order.id}`,
      type: 'order',
      title: `Live Order #${order.id}`,
      description: `Total ₹${parseFloat(String(order.total || 0)).toFixed(2)} • ${
        order.paymentMethod || 'Cash'
      } • ${order.status || 'Completed'}`,
    });
  });

  const unreadCount = notifications.filter((n) => !readNotificationIds.has(n.id)).length;

  const markAllAsRead = () => {
    const allIds = new Set(notifications.map((n) => n.id));
    setReadNotificationIds(allIds);
  };

  const getTabTitle = (pathname: string) => {
    if (pathname.startsWith('/menu')) return 'Menu Management';
    if (pathname.startsWith('/inventory')) return 'Inventory Management';
    if (pathname.startsWith('/tables')) return 'Table & Floor Setup';
    if (pathname.startsWith('/settings')) return 'Store Settings';
    if (pathname.startsWith('/pos')) return 'Point of Sale';
    return 'Dashboard';
  };

  const currentTabTitle = getTabTitle(location.pathname);
  const displayName = currentUser?.fullName || currentUser?.username || 'Store Manager';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <header className="h-16 px-4 sm:px-6 bg-white dark:bg-stone-900 border-b border-stone-200/80 dark:border-stone-800 flex items-center justify-between gap-4 shrink-0 z-10">
      {/* Left: Mobile Nav Toggle & Current Section Title */}
      <div className="flex items-center gap-3 min-w-0">
        {onToggleMobileNav && (
          <button
            type="button"
            onClick={onToggleMobileNav}
            className="lg:hidden p-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:text-stone-900 cursor-pointer"
            aria-label="Open Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div>
          <h2 className="text-base sm:text-lg font-extrabold text-stone-900 dark:text-stone-100 leading-tight">
            {currentTabTitle}
          </h2>
        </div>
      </div>

      {/* Right: License Status Pill, Notifications Bell & User Avatar */}
      <div className="flex items-center gap-2.5 sm:gap-4 shrink-0">
        {/* License Pill */}
        {licenseStatus && (
          <Tooltip content={`Node Licensed to ${storeProfile?.businessName}`} position="bottom">
            <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800/60">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{licenseStatus.daysRemaining} Days Left</span>
            </div>
          </Tooltip>
        )}

        {/* Notifications Popover Dropdown */}
        <div className="relative" ref={notificationRef}>
          <Tooltip content="Live Alerts & Notifications" position="bottom">
            <button
              type="button"
              onClick={() => setIsNotificationsOpen((prev) => !prev)}
              className={cn(
                'relative w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center transition-all cursor-pointer select-none',
                isNotificationsOpen
                  ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 ring-2 ring-amber-500/30'
                  : 'bg-stone-100 hover:bg-stone-200/80 dark:bg-stone-800 dark:hover:bg-stone-750 text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100'
              )}
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5 text-stone-700 dark:text-stone-200" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-rose-500 text-[10px] font-black text-white shadow-sm ring-2 ring-white dark:ring-stone-900 pointer-events-none animate-in zoom-in-50 duration-150">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
          </Tooltip>

          {/* Notifications Dropdown Panel */}
          {isNotificationsOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
              {/* Header */}
              <div className="p-4 bg-stone-50/80 dark:bg-stone-850/80 border-b border-stone-200/80 dark:border-stone-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-extrabold text-stone-900 dark:text-stone-100">
                    Notifications
                  </h3>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                      {unreadCount} new
                    </span>
                  )}
                </div>

                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={markAllAsRead}
                    className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>Mark all read</span>
                  </button>
                )}
              </div>

              {/* Notification List */}
              <div className="max-h-80 overflow-y-auto divide-y divide-stone-100 dark:divide-stone-800">
                {notifications.length === 0 ? (
                  <div className="py-8 px-4 text-center">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-2">
                      <CheckCheck className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-bold text-stone-700 dark:text-stone-300">
                      All caught up!
                    </p>
                    <p className="text-[11px] text-stone-400 mt-0.5">
                      No low stock alerts or pending terminal events.
                    </p>
                  </div>
                ) : (
                  notifications.map((n) => {
                    const isRead = readNotificationIds.has(n.id);
                    return (
                      <div
                        key={n.id}
                        onClick={() =>
                          setReadNotificationIds((prev) => new Set([...prev, n.id]))
                        }
                        className={`p-3.5 flex items-start gap-3 hover:bg-stone-50 dark:hover:bg-stone-800/60 transition-colors cursor-pointer ${
                          !isRead ? 'bg-amber-50/20 dark:bg-amber-950/10' : ''
                        }`}
                      >
                        {/* Icon */}
                        <div className="mt-0.5 shrink-0">
                          {n.type === 'inventory' ? (
                            <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                              <Boxes className="w-4 h-4" />
                            </div>
                          ) : n.type === 'license' ? (
                            <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                              <ShieldAlert className="w-4 h-4" />
                            </div>
                          ) : (
                            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                              <Receipt className="w-4 h-4" />
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <h4
                              className={`text-xs truncate ${
                                !isRead
                                  ? 'font-extrabold text-stone-900 dark:text-stone-100'
                                  : 'font-semibold text-stone-600 dark:text-stone-400'
                              }`}
                            >
                              {n.title}
                            </h4>
                            {!isRead && (
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                            )}
                          </div>
                          <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 leading-snug line-clamp-2">
                            {n.description}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Staff User Avatar & Role */}
        <div className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-stone-200 dark:border-stone-800">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 text-stone-950 font-extrabold text-xs flex items-center justify-center shadow-sm">
            {initial}
          </div>

          <div className="hidden sm:flex flex-col">
            <span className="text-xs font-bold text-stone-800 dark:text-stone-200 leading-tight">
              {displayName}
            </span>
            <span className="text-[10px] text-stone-400 font-medium uppercase">
              {currentUser?.role || 'ADMIN'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
