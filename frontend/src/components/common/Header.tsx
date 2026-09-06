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
  Check,
  Clock,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { isToday, buildDailyOrderNumberMap } from '../../lib/orderUtils';

export interface HeaderProps {
  onToggleMobileNav?: () => void;
  onOpenStoreProfile?: () => void;
}

const NOTIFICATIONS_STORAGE_KEY = 'velora_read_notifications';

const formatRelativeTime = (dateStr?: string | Date): string => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  const now = new Date();
  const diffSecs = Math.max(0, Math.floor((now.getTime() - d.getTime()) / 1000));
  if (diffSecs < 60) return 'Just now';
  const diffMins = Math.floor(diffSecs / 60);
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const formatTimeOnly = (dateStr?: string | Date): string => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export const Header: React.FC<HeaderProps> = ({ onToggleMobileNav }) => {
  const { currentUser, storeProfile, licenseStatus, appData } = useApp();
  const location = useLocation();

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [showCleared, setShowCleared] = useState(false);

  // Read notification IDs persisted in localStorage so washed-out orders stay washed out across reloads
  const [readNotificationIds, setReadNotificationIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return new Set(parsed);
        }
      }
    } catch (e) {
      console.warn('Failed to parse read notifications from localStorage', e);
    }
    return new Set<string>();
  });

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

  // Filter for today's orders only (newest first)
  const todayOrders = (appData.orders || [])
    .filter((order: any) => isToday(order.date))
    .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

  interface NotificationItem {
    id: string;
    type: 'inventory' | 'order' | 'license';
    title: string;
    description: string;
    time?: string;
    timeAgo?: string;
    amount?: number;
    paymentMethod?: string;
    status?: string;
    itemSummary?: string;
  }

  const allNotifications: NotificationItem[] = [];

  // 1. License alert (if expiring soon)
  if (licenseStatus && licenseStatus.daysRemaining <= 15) {
    allNotifications.push({
      id: 'license-warning',
      type: 'license',
      title: 'Subscription License Alert',
      description: `Station license expires in ${licenseStatus.daysRemaining} days. Renew to avoid offline locking.`,
      timeAgo: 'Urgent',
    });
  }

  // 2. Low stock items
  lowStockItems.slice(0, 5).forEach((item) => {
    allNotifications.push({
      id: `stock-${item.id || item.name || item.item}`,
      type: 'inventory',
      title: `Low Stock: ${item.name || item.item}`,
      description: `Only ${item.stock} ${item.unit} remaining (Threshold: ${item.threshold} ${item.unit})`,
      timeAgo: 'Stock Alert',
    });
  });

  // Map daily sequence numbers (#1, #2, #3...) restarting everyday
  const dailyNumMap = buildDailyOrderNumberMap(appData.orders || []);

  // 3. Today's Recent Orders
  todayOrders.forEach((order: any) => {
    let itemSummary = '';
    if (order.items && Array.isArray(order.items) && order.items.length > 0) {
      const parts = order.items.map((it: any) => {
        const name = it.menuItem?.name || it.name || 'Item';
        return `${it.quantity || 1}x ${name}`;
      });
      itemSummary =
        parts.length > 2
          ? `${parts.slice(0, 2).join(', ')} +${parts.length - 2} more`
          : parts.join(', ');
    }

    const orderTotal = parseFloat(String(order.total || 0));
    const dailySeq = dailyNumMap.get(order.id) || order.dailyOrderNumber || order.id;

    allNotifications.push({
      id: `order-${order.id}`,
      type: 'order',
      title: `Order #${dailySeq}`,
      description: itemSummary || `${order.paymentMethod || 'Cash'} • ${order.status || 'Completed'}`,
      amount: orderTotal,
      paymentMethod: order.paymentMethod || 'Cash',
      status: order.status || 'Completed',
      itemSummary,
      time: formatTimeOnly(order.date),
      timeAgo: formatRelativeTime(order.date),
    });
  });

  // Active (unread / not washed out) notifications
  const activeNotifications = allNotifications.filter((n) => !readNotificationIds.has(n.id));
  // Washed out (already read) notifications
  const clearedNotifications = allNotifications.filter((n) => readNotificationIds.has(n.id));
  const unreadCount = activeNotifications.length;

  const saveReadIds = (updatedSet: Set<string>) => {
    setReadNotificationIds(updatedSet);
    try {
      localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(Array.from(updatedSet)));
    } catch (e) {
      console.warn('Failed to save read notifications to localStorage', e);
    }
  };

  // Wash out all active notifications
  const markAllAsRead = () => {
    const updated = new Set(readNotificationIds);
    allNotifications.forEach((n) => updated.add(n.id));
    saveReadIds(updated);
  };

  // Wash out an individual notification
  const markSingleAsRead = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const updated = new Set(readNotificationIds);
    updated.add(id);
    saveReadIds(updated);
  };

  const getTabInfo = (pathname: string) => {
    if (pathname.startsWith('/menu')) {
      return {
        title: 'Menu Management',
        description: 'Dishes, beverages, categories, recipes & add-ons catalog',
      };
    }
    if (pathname.startsWith('/inventory')) {
      return {
        title: 'Inventory Management',
        description: 'Ingredient stock, threshold warnings, movements & wastage',
      };
    }
    if (pathname.startsWith('/tables')) {
      return {
        title: 'Table & Floor Setup',
        description: 'Restaurant sections, seating capacity & floor arrangement',
      };
    }
    if (pathname.startsWith('/settings')) {
      return {
        title: 'Store Settings',
        description: 'Cafe profile, tax configurations, payment gateways & station node',
      };
    }
    if (pathname.startsWith('/pos')) {
      return {
        title: 'Point of Sale',
        description: 'High-speed order billing & kitchen dispatch terminal',
      };
    }
    return {
      title: 'Dashboard',
      description: 'Real-time sales analytics, orders summary & cafe metrics',
    };
  };

  const currentTab = getTabInfo(location.pathname);
  const displayName = currentUser?.fullName || currentUser?.username || 'Store Manager';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <header className="h-16 px-4 sm:px-6 bg-white dark:bg-stone-900 border-b border-stone-200/80 dark:border-stone-800 flex items-center justify-between gap-4 shrink-0 z-10">
      {/* Left: Mobile Nav Toggle & Current Section Title + Description */}
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

        <div className="flex flex-col min-w-0">
          <h2 className="text-base sm:text-lg font-extrabold text-stone-900 dark:text-stone-100 leading-tight truncate">
            {currentTab.title}
          </h2>
          <p className="hidden md:block text-[11px] text-stone-500 dark:text-stone-400 font-medium truncate">
            {currentTab.description}
          </p>
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
            <div className="absolute right-0 top-full mt-2 w-84 sm:w-96 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
              {/* Header */}
              <div className="p-4 bg-stone-50/80 dark:bg-stone-850/80 border-b border-stone-200/80 dark:border-stone-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-extrabold text-stone-900 dark:text-stone-100">
                    Notifications
                  </h3>
                  {unreadCount > 0 ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                      {unreadCount} unread
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      Caught up
                    </span>
                  )}
                </div>

                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={markAllAsRead}
                    className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 hover:underline flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>Mark all read</span>
                  </button>
                )}
              </div>

              {/* Notification List: Active (Unwashed) Notifications */}
              <div className="max-h-84 overflow-y-auto divide-y divide-stone-100 dark:divide-stone-800">
                {activeNotifications.length === 0 ? (
                  <div className="py-8 px-4 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-2.5">
                      <Sparkles className="w-6 h-6 stroke-[2.2]" />
                    </div>
                    <p className="text-xs font-bold text-stone-800 dark:text-stone-200">
                      All caught up!
                    </p>
                    <p className="text-[11px] text-stone-400 mt-0.5 max-w-[220px] mx-auto leading-normal">
                      {clearedNotifications.length > 0
                        ? "All today's orders and alerts have been marked as read and cleared."
                        : 'No pending orders or system alerts today.'}
                    </p>
                  </div>
                ) : (
                  activeNotifications.map((n) => {
                    return (
                      <div
                        key={n.id}
                        onClick={() => markSingleAsRead(n.id)}
                        className="p-3.5 flex items-start gap-3 hover:bg-stone-50 dark:hover:bg-stone-800/60 transition-colors cursor-pointer group bg-amber-50/20 dark:bg-amber-950/10"
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
                            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs">
                              <Receipt className="w-4 h-4" />
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <h4 className="text-xs font-extrabold text-stone-900 dark:text-stone-100 truncate">
                                {n.title}
                              </h4>
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className="text-[10px] font-mono text-stone-400 dark:text-stone-500">
                                {n.timeAgo}
                              </span>

                              <Tooltip content="Mark read & clear" position="left">
                                <button
                                  type="button"
                                  onClick={(e) => markSingleAsRead(n.id, e)}
                                  className="p-1 rounded-lg text-stone-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer"
                                  aria-label="Mark read"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                              </Tooltip>
                            </div>
                          </div>

                          <p className="text-[11px] text-stone-600 dark:text-stone-300 mt-0.5 leading-snug line-clamp-2">
                            {n.description}
                          </p>

                          {/* Extra info for Order notifications */}
                          {n.type === 'order' && (
                            <div className="flex items-center gap-2 mt-2 pt-1 border-t border-stone-100 dark:border-stone-800/80 text-[10px]">
                              {typeof n.amount === 'number' && (
                                <span className="font-mono font-black text-emerald-600 dark:text-emerald-400 text-xs">
                                  ₹{n.amount.toFixed(2)}
                                </span>
                              )}

                              {n.paymentMethod && (
                                <span className="px-1.5 py-0.2 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 font-semibold">
                                  {n.paymentMethod}
                                </span>
                              )}

                              {n.status && (
                                <span
                                  className={cn(
                                    'px-1.5 py-0.2 rounded-md font-semibold',
                                    n.status === 'Completed'
                                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                                      : 'bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300'
                                  )}
                                >
                                  {n.status}
                                </span>
                              )}

                              {n.time && (
                                <span className="ml-auto text-stone-400 flex items-center gap-0.5 font-mono">
                                  <Clock className="w-2.5 h-2.5" />
                                  {n.time}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}

                {/* Cleared / Washed Out Orders Drawer */}
                {clearedNotifications.length > 0 && (
                  <div className="border-t border-stone-200/80 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/50">
                    <button
                      type="button"
                      onClick={() => setShowCleared((prev) => !prev)}
                      className="w-full py-2 px-3 text-[11px] font-bold text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200 flex items-center justify-between cursor-pointer transition-colors"
                    >
                      <span className="flex items-center gap-1.5">
                        <CheckCheck className="w-3.5 h-3.5 text-stone-400" />
                        <span>Today's Cleared Orders ({clearedNotifications.length})</span>
                      </span>
                      {showCleared ? (
                        <ChevronUp className="w-3.5 h-3.5 text-stone-400" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
                      )}
                    </button>

                    {showCleared && (
                      <div className="divide-y divide-stone-100 dark:divide-stone-800/60 max-h-48 overflow-y-auto">
                        {clearedNotifications.map((n) => (
                          <div
                            key={n.id}
                            className="p-2.5 px-3 flex items-center justify-between text-xs text-stone-400 dark:text-stone-500 hover:bg-stone-100/60 dark:hover:bg-stone-800/40"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <Receipt className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                              <span className="font-semibold text-stone-700 dark:text-stone-300 truncate">
                                {n.title}
                              </span>
                              {typeof n.amount === 'number' && (
                                <span className="font-mono text-[11px] font-semibold text-stone-600 dark:text-stone-400">
                                  ₹{n.amount.toFixed(2)}
                                </span>
                              )}
                            </div>

                            <span className="text-[10px] font-mono shrink-0 ml-2">
                              {n.time || n.timeAgo}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
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
