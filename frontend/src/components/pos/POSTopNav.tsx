import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { usePOS } from '../../context/POSContext';
import { CafeBrandBadge, Button, Tooltip } from '../ui';
import {
  ShoppingBag,
  Utensils,
  Zap,
  History,
  Search,
  X,
  Bell,
  ChevronDown,
  LogOut,
  Store,
  Settings,
  Sparkles,
  Boxes,
  ShieldAlert,
  Receipt,
  CheckCheck,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { isToday, buildDailyOrderNumberMap } from '../../lib/orderUtils';

export interface POSTopNavProps {
  onOpenMobileCart?: () => void;
  onOpenPackageDetails?: () => void;
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

export const POSTopNav: React.FC<POSTopNavProps> = ({
  onOpenMobileCart,
  onOpenPackageDetails,
  onOpenStoreProfile,
}) => {
  const { posMode, appData, storeProfile, licenseStatus, currentUser, handleLogout } = useApp();
  const navigate = useNavigate();
  const {
    selectedTableId,
    cart,
    setShowOrderHistoryModal,
    posSearchQuery,
    setPosSearchQuery,
  } = usePOS();

  const searchInputRef = useRef<HTMLInputElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Read notifications state persisted in localStorage
  const [readNotificationIds, setReadNotificationIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return new Set(parsed);
      }
    } catch {}
    return new Set<string>();
  });

  // Global hotkey: '/' or 'Ctrl+K' focuses search input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.key === '/' || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k')) &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA' &&
        document.activeElement?.tagName !== 'SELECT'
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(e.target as Node)) {
        setIsNotificationsOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    if (isNotificationsOpen || isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isNotificationsOpen, isUserMenuOpen]);

  // Notifications calculation
  const lowStockItems = (appData.inventory || []).filter(
    (inv) =>
      inv.status === 'Low Stock' ||
      inv.status === 'Out of Stock' ||
      (typeof inv.stock === 'number' && inv.stock <= inv.threshold)
  );

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
  }

  const allNotifications: NotificationItem[] = [];

  if (licenseStatus && licenseStatus.daysRemaining <= 15) {
    allNotifications.push({
      id: 'license-warning',
      type: 'license',
      title: 'Subscription License Alert',
      description: `Station license expires in ${licenseStatus.daysRemaining} days. Renew to avoid offline lock.`,
      timeAgo: 'Urgent',
    });
  }

  lowStockItems.slice(0, 4).forEach((item) => {
    allNotifications.push({
      id: `stock-${item.id || item.name || item.item}`,
      type: 'inventory',
      title: `Low Stock: ${item.name || item.item}`,
      description: `Only ${item.stock} ${item.unit} left (Threshold: ${item.threshold} ${item.unit})`,
      timeAgo: 'Stock Alert',
    });
  });

  const dailyNumMap = buildDailyOrderNumberMap(appData.orders || []);

  todayOrders.slice(0, 8).forEach((order: any) => {
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
      time: formatTimeOnly(order.date),
      timeAgo: formatRelativeTime(order.date),
    });
  });

  const activeNotifications = allNotifications.filter((n) => !readNotificationIds.has(n.id));
  const unreadCount = activeNotifications.length;

  const saveReadIds = (updatedSet: Set<string>) => {
    setReadNotificationIds(updatedSet);
    try {
      localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(Array.from(updatedSet)));
    } catch {}
  };

  const markAllAsRead = () => {
    const updated = new Set(readNotificationIds);
    allNotifications.forEach((n) => updated.add(n.id));
    saveReadIds(updated);
  };

  const markSingleAsRead = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const updated = new Set(readNotificationIds);
    updated.add(id);
    saveReadIds(updated);
  };

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const isFloorView = posMode === 'table' && !selectedTableId;

  const displayName = currentUser?.fullName || currentUser?.username || 'SK';
  const userInitials = displayName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'SK';

  return (
    <header className="h-16 px-4 sm:px-6 bg-white dark:bg-stone-900 border-b border-stone-200/80 dark:border-stone-800 flex items-center justify-between gap-3 shrink-0 z-30 select-none">
      {/* Left: Brand Badge, Mode Indicator & Floor Navigation */}
      <div className="flex items-center gap-3 min-w-0">
        <CafeBrandBadge
          name={storeProfile?.businessName || 'The Urban Bistro'}
          cafeCode={storeProfile?.cafeCode || 'CF-NAG-001'}
          logoUrl={storeProfile?.logoUrl}
          size="sm"
        />

        {/* Station Title and Mode Badge (Matching Image 2) */}
        <div className="hidden sm:flex flex-col min-w-0 pl-3 border-l border-stone-200 dark:border-stone-800">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-extrabold text-stone-900 dark:text-stone-100 leading-tight">
              {posMode === 'table' ? 'POS - Table Service' : 'POS - Quick Order'}
            </h2>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#fff5ea] dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-300/80 dark:border-amber-800/60">
              {posMode === 'table' ? (
                <>
                  <Utensils className="w-3 h-3 text-amber-600" />
                  Table Mode
                </>
              ) : (
                <>
                  <Zap className="w-3 h-3 text-amber-600" />
                  Quick Mode
                </>
              )}
            </span>
          </div>
          <p className="hidden xl:block text-[11px] text-stone-500 dark:text-stone-400 font-medium truncate">
            {posMode === 'table'
              ? 'Dine-in floor orders, table booking & live billing'
              : 'Fast counter sales, express checkout & takeaway billing'}
          </p>
        </div>
      </div>

      {/* Center: Search Input (Dynamic placeholder based on view) */}
      <div className="flex-1 max-w-sm sm:max-w-md lg:max-w-lg mx-2 sm:mx-4 min-w-0">
        <div className="relative w-full group">
          <Search className="w-4 h-4 text-stone-400 group-focus-within:text-amber-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder={
              isFloorView
                ? 'Search tables, areas or guest... /'
                : 'Search food & beverages... /'
            }
            value={posSearchQuery}
            onChange={(e) => setPosSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setPosSearchQuery('');
                searchInputRef.current?.blur();
              }
            }}
            className="w-full bg-stone-100/90 dark:bg-stone-800/90 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 text-xs sm:text-sm pl-10 pr-9 py-2 rounded-2xl border border-stone-200/80 dark:border-stone-700/80 focus:border-amber-500 dark:focus:border-amber-500 focus:bg-white dark:focus:bg-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all shadow-2xs"
          />
          {posSearchQuery ? (
            <button
              type="button"
              onClick={() => {
                setPosSearchQuery('');
                searchInputRef.current?.focus();
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-200/60 dark:hover:bg-stone-700/60 transition-colors cursor-pointer"
              title="Clear search (Esc)"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <kbd className="hidden lg:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-stone-400 bg-stone-200/50 dark:bg-stone-700/50 rounded border border-stone-300 dark:border-stone-600 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none select-none">
              /
            </kbd>
          )}
        </div>
      </div>

      {/* Right Controls: Order History, License Pill, Notifications Bell, User Avatar */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Mobile Cart Trigger (Visible on small screens when inside an order) */}
        {onOpenMobileCart && !isFloorView && (
          <button
            type="button"
            onClick={onOpenMobileCart}
            className="lg:hidden relative p-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold transition-all active:scale-95 shadow-sm cursor-pointer"
            aria-label="View Cart"
          >
            <ShoppingBag className="w-4 h-4" />
            {totalCartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-rose-600 text-white text-[10px] font-extrabold flex items-center justify-center ring-2 ring-white dark:ring-stone-900">
                {totalCartCount}
              </span>
            )}
          </button>
        )}

        {/* Order History Button (Matching Figure 2) */}
        <Tooltip content="Terminal Order History & Reprint Bills" position="bottom">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowOrderHistoryModal(true)}
            leftIcon={<History className="w-4 h-4 text-amber-500" />}
            className="font-bold cursor-pointer rounded-2xl"
          >
            <span className="hidden sm:inline">Order History</span>
            <span className="sm:hidden">History</span>
          </Button>
        </Tooltip>

        {/* License Status Pill (Added as explicitly requested by user) */}
        {licenseStatus && (
          <Tooltip
            content={`Station Licensed • ${licenseStatus.daysRemaining} days remaining. Click for package details.`}
            position="bottom"
          >
            <button
              type="button"
              onClick={onOpenPackageDetails}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800/60 transition-all cursor-pointer shadow-xs active:scale-95 group select-none"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="hidden sm:inline">{licenseStatus.daysRemaining} Days Left</span>
              <span className="sm:hidden">{licenseStatus.daysRemaining}d</span>
            </button>
          </Tooltip>
        )}

        {/* Notifications Popover Bell (Figure 2 with red indicator) */}
        <div className="relative" ref={notificationRef}>
          <Tooltip content="Live Alerts & Notifications" position="bottom">
            <button
              type="button"
              onClick={() => setIsNotificationsOpen((prev) => !prev)}
              className={cn(
                'relative w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center transition-all cursor-pointer select-none',
                isNotificationsOpen
                  ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 ring-2 ring-amber-500/30'
                  : 'bg-stone-100 hover:bg-stone-200/80 dark:bg-stone-800 dark:hover:bg-stone-750 text-stone-600 dark:text-stone-300'
              )}
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-stone-700 dark:text-stone-200" />
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
              <div className="p-3.5 bg-stone-50/80 dark:bg-stone-850/80 border-b border-stone-200/80 dark:border-stone-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-extrabold text-stone-900 dark:text-stone-100">
                    Notifications
                  </h3>
                  {unreadCount > 0 ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                      {unreadCount} unread
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                      Caught up
                    </span>
                  )}
                </div>

                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={markAllAsRead}
                    className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>Mark all read</span>
                  </button>
                )}
              </div>

              {/* Notification List */}
              <div className="max-h-80 overflow-y-auto divide-y divide-stone-100 dark:divide-stone-800">
                {activeNotifications.length === 0 ? (
                  <div className="py-8 px-4 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-2.5">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <p className="text-xs font-bold text-stone-800 dark:text-stone-200">
                      All caught up!
                    </p>
                    <p className="text-[11px] text-stone-400 mt-0.5">
                      No pending order alerts or stock warnings.
                    </p>
                  </div>
                ) : (
                  activeNotifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markSingleAsRead(n.id)}
                      className="p-3 flex items-start gap-2.5 hover:bg-stone-50 dark:hover:bg-stone-800/60 transition-colors cursor-pointer group bg-amber-50/20 dark:bg-amber-950/10"
                    >
                      <div className="mt-0.5 shrink-0">
                        {n.type === 'inventory' ? (
                          <div className="w-7 h-7 rounded-xl bg-rose-100 dark:bg-rose-950/50 text-rose-600 flex items-center justify-center">
                            <Boxes className="w-3.5 h-3.5" />
                          </div>
                        ) : n.type === 'license' ? (
                          <div className="w-7 h-7 rounded-xl bg-amber-100 dark:bg-amber-950/50 text-amber-600 flex items-center justify-center">
                            <ShieldAlert className="w-3.5 h-3.5" />
                          </div>
                        ) : (
                          <div className="w-7 h-7 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center">
                            <Receipt className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="text-xs font-extrabold text-stone-900 dark:text-stone-100 truncate">
                            {n.title}
                          </h4>
                          <span className="text-[10px] font-mono text-stone-400 shrink-0">
                            {n.timeAgo}
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-600 dark:text-stone-300 mt-0.5 leading-snug line-clamp-2">
                          {n.description}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Staff User Avatar & Dropdown (Figure 2 "SK" with chevron) */}
        <div className="relative" ref={userMenuRef}>
          <button
            type="button"
            onClick={() => setIsUserMenuOpen((prev) => !prev)}
            className="flex items-center gap-1.5 p-1 rounded-2xl hover:bg-stone-100 dark:hover:bg-stone-800 transition-all cursor-pointer group select-none"
            aria-label="User profile menu"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 text-stone-950 font-black text-xs sm:text-sm flex items-center justify-center shadow-xs">
              {userInitials}
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-stone-400 group-hover:text-stone-700 dark:group-hover:text-stone-200 transition-colors" />
          </button>

          {/* User Profile Dropdown Menu */}
          {isUserMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xl p-2.5 z-50 animate-in fade-in zoom-in-95 duration-100 text-xs select-none">
              {/* Profile Name & Status (Kept & Enhanced) */}
              <div className="p-3 bg-stone-50/80 dark:bg-stone-850/70 rounded-2xl border border-stone-100 dark:border-stone-800 mb-2">
                <div className="flex items-center justify-between gap-1">
                  <div className="font-extrabold text-stone-900 dark:text-stone-100 text-sm truncate">
                    {displayName}
                  </div>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Online
                  </span>
                </div>
                <div className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mt-0.5">
                  {currentUser?.role || 'OWNER'}
                </div>
                <div className="text-[10px] text-stone-400 dark:text-stone-500 mt-1 truncate">
                  {storeProfile?.businessName || 'The Urban Bistro'} • {storeProfile?.cafeCode || 'CF-NAG-001'}
                </div>
              </div>

              {/* Profile Page & Business Details */}
              <button
                type="button"
                onClick={() => {
                  setIsUserMenuOpen(false);
                  if (onOpenStoreProfile) onOpenStoreProfile();
                }}
                className="w-full px-3 py-2.5 rounded-xl text-left text-stone-700 dark:text-stone-200 hover:bg-amber-50 dark:hover:bg-amber-950/30 hover:text-amber-600 dark:hover:text-amber-400 font-bold flex items-center gap-2.5 cursor-pointer transition-colors"
              >
                <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                  <Store className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="leading-tight">Store & Owner Profile</div>
                  <div className="text-[10px] font-normal text-stone-400">Cafe info, contact & GSTIN</div>
                </div>
              </button>

              {/* Store Settings Link */}
              <button
                type="button"
                onClick={() => {
                  setIsUserMenuOpen(false);
                  navigate('/settings');
                }}
                className="w-full px-3 py-2.5 rounded-xl text-left text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 font-bold flex items-center gap-2.5 cursor-pointer transition-colors"
              >
                <div className="w-7 h-7 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 flex items-center justify-center shrink-0">
                  <Settings className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="leading-tight">Store Settings</div>
                  <div className="text-[10px] font-normal text-stone-400">Taxes, printer & station node</div>
                </div>
              </button>

              {/* Station Logout (Kept) */}
              <button
                type="button"
                onClick={() => {
                  setIsUserMenuOpen(false);
                  handleLogout();
                }}
                className="w-full px-3 py-2.5 rounded-xl text-left text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 font-bold flex items-center gap-2.5 cursor-pointer transition-colors border-t border-stone-100 dark:border-stone-800 mt-1"
              >
                <div className="w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center shrink-0">
                  <LogOut className="w-4 h-4" />
                </div>
                <span>Lock / Log Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
