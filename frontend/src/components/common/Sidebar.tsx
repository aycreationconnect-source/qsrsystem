import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Tooltip } from '../ui';
import {
  LayoutDashboard,
  UtensilsCrossed,
  Boxes,
  Armchair,
  Settings,
  Zap,
  Utensils,
  LogOut,
  FileBarChart2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '../../lib/utils';

export interface SidebarProps {
  onOpenStoreProfile?: () => void;
  onCloseMobileNav?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  isMobileDrawer?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  onOpenStoreProfile,
  onCloseMobileNav,
  isCollapsed: controlledCollapsed,
  onToggleCollapse,
  isMobileDrawer = false,
}) => {
  const { storeProfile, handleLogout } = useApp();
  const navigate = useNavigate();
  const sidebarRef = useRef<HTMLElement>(null);
  const hoverTimeoutRef = useRef<number | null>(null);

  // Desktop mouse hover expansion state
  const [isHovered, setIsHovered] = useState(false);

  // Tablet/Touch manual toggle expansion state
  const [isManuallyExpanded, setIsManuallyExpanded] = useState(false);

  // Collapsed state calculation:
  // In mobile drawer: always false (expanded)
  // Otherwise: collapsed unless hovered on desktop OR manually toggled on tablet
  const isCollapsed = isMobileDrawer
    ? false
    : controlledCollapsed !== undefined
    ? controlledCollapsed && !isHovered && !isManuallyExpanded
    : !isHovered && !isManuallyExpanded;

  // Manual toggle for tablet / touch view
  const handleToggleCollapse = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleCollapse) {
      onToggleCollapse();
    } else {
      setIsManuallyExpanded((prev) => !prev);
    }
  };

  // Desktop hover expansion handlers (smooth 120ms debounce prevents flickering on border crossing)
  const handleMouseEnter = () => {
    if (isMobileDrawer) return;
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    if (isMobileDrawer) return;
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = window.setTimeout(() => {
      setIsHovered(false);
    }, 120);
  };

  // Close / collapse when clicking anywhere outside on screen
  useEffect(() => {
    if (!isHovered && !isManuallyExpanded) return;

    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
        setIsHovered(false);
        setIsManuallyExpanded(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isHovered, isManuallyExpanded]);

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Menu Management', path: '/menu', icon: UtensilsCrossed },
    { label: 'Inventory', path: '/inventory', icon: Boxes },
    { label: 'Table Setup', path: '/tables', icon: Armchair },
    { label: 'Report', path: '/reports', icon: FileBarChart2 },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  const onSignOut = async () => {
    await handleLogout();
    navigate('/login');
  };

  // Generate 2-letter cafe monogram
  const getInitials = (str: string): string => {
    if (!str) return 'CF';
    const words = str
      .trim()
      .split(/\s+/)
      .filter((w) => !['the', 'and', '&'].includes(w.toLowerCase()));

    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return str.substring(0, 2).toUpperCase();
  };

  const initials = getInitials(storeProfile?.businessName || 'Velora Cafe');

  return (
    <aside
      ref={sidebarRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        'h-full flex flex-col bg-white dark:bg-stone-900 border-r border-stone-200/80 dark:border-stone-800 select-none transition-all duration-300 ease-in-out',
        isMobileDrawer
          ? 'w-full'
          : isCollapsed
          ? 'w-[72px] relative z-30'
          : 'w-[268px] absolute top-0 left-0 bottom-0 shadow-2xl z-40 ring-1 ring-black/5 dark:ring-white/5'
      )}
    >
      {/* Tablet Arrow Mark Toggle Button:
          - Visible on tablet view (lg:hidden flex)
          - Hidden on desktop (lg:hidden) where hover auto-expansion is used
          - Smoothly moves with the sidebar border */}
      {!isMobileDrawer && (
        <button
          type="button"
          onClick={handleToggleCollapse}
          className="flex lg:hidden absolute -right-3.5 top-5 z-50 w-7 h-7 rounded-full bg-amber-500 hover:bg-amber-600 text-stone-950 shadow-md border-2 border-white dark:border-stone-900 items-center justify-center cursor-pointer transition-transform duration-200 active:scale-90"
          aria-label={isCollapsed ? 'Open Sidebar' : 'Collapse Sidebar'}
          title={isCollapsed ? 'Open Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4 stroke-[3]" />
          ) : (
            <ChevronLeft className="w-4 h-4 stroke-[3]" />
          )}
        </button>
      )}

      {/* 1. Cafe Brand Badge Header */}
      <div className="h-16 border-b border-stone-200/80 dark:border-stone-800 flex items-center shrink-0 relative overflow-hidden">
        {/* Monogram / Logo Slot: Fixed in 72px slot (centered at x=36px) */}
        <div
          onClick={onOpenStoreProfile}
          className="w-[72px] shrink-0 flex items-center justify-center cursor-pointer"
          title={storeProfile?.businessName || 'Velora Cafe'}
        >
          <div className="relative shrink-0">
            {storeProfile?.logoUrl ? (
              <img
                src={storeProfile.logoUrl}
                alt={storeProfile?.businessName || 'Velora Cafe'}
                className="w-10 h-10 object-cover rounded-xl border border-amber-500/30 shadow-sm"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="w-10 h-10 rounded-xl flex items-center justify-center font-extrabold tracking-wider bg-gradient-to-br from-amber-500 to-amber-600 text-stone-950 shadow-sm shadow-amber-500/20 border border-amber-400/40 text-sm">
                {initials}
              </div>
            )}
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-stone-900" />
          </div>
        </div>

        {/* Cafe Name & Code details: Smooth reveal without jerking */}
        <div
          onClick={onOpenStoreProfile}
          className={cn(
            'flex flex-col min-w-0 pr-3 whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out cursor-pointer',
            isCollapsed ? 'opacity-0 max-w-0 pointer-events-none' : 'opacity-100 max-w-[180px]'
          )}
        >
          <span className="truncate font-extrabold text-sm text-stone-900 dark:text-stone-100 leading-tight">
            {storeProfile?.businessName || 'Velora Cafe'}
          </span>
          <span className="text-[11px] font-medium text-stone-400 dark:text-stone-500 truncate">
            {storeProfile?.cafeCode || 'CF-MUM-001'}
          </span>
        </div>

        {/* Mobile Drawer Close Arrow (inside mobile drawer) */}
        {isMobileDrawer && onCloseMobileNav && (
          <button
            type="button"
            onClick={onCloseMobileNav}
            className="ml-auto mr-3 p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
            aria-label="Close Navigation"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* 2. Main Navigation Links */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-2 space-y-1">
        {/* Section Category Header */}
        <div
          className={cn(
            'text-[10px] font-extrabold uppercase tracking-wider text-stone-400 dark:text-stone-500 px-3 transition-all duration-300 ease-in-out overflow-hidden whitespace-nowrap',
            isCollapsed ? 'h-0 opacity-0 py-0 pointer-events-none' : 'h-5 opacity-100 py-1'
          )}
        >
          Management
        </div>

        <div className="w-full flex flex-col space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Tooltip
                key={item.path}
                content={isCollapsed ? item.label : null}
                position="right"
                wrapperClassName="w-full block"
              >
                <NavLink
                  to={item.path}
                  onClick={() => {
                    if (isMobileDrawer && onCloseMobileNav) onCloseMobileNav();
                  }}
                  className={({ isActive }) =>
                    cn(
                      'group relative w-full h-11 flex items-center rounded-2xl transition-colors duration-200 cursor-pointer overflow-hidden',
                      isActive
                        ? 'bg-amber-500 text-stone-950 shadow-sm shadow-amber-500/20 font-extrabold'
                        : 'text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 font-bold'
                    )
                  }
                >
                  {/* Fixed Centered Icon Slot: 56px inside p-2 (centered at x=36px) */}
                  <div className="w-[56px] shrink-0 flex items-center justify-center">
                    <Icon className="w-5 h-5 shrink-0 transition-transform duration-200 group-hover:scale-110" />
                  </div>

                  {/* Smooth Text Reveal without layout shift */}
                  <div
                    className={cn(
                      'min-w-0 pr-3 whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out',
                      isCollapsed ? 'opacity-0 max-w-0 pointer-events-none' : 'opacity-100 max-w-[180px]'
                    )}
                  >
                    <span className="text-sm truncate block">{item.label}</span>
                  </div>
                </NavLink>
              </Tooltip>
            );
          })}
        </div>

        {/* Active Terminals Launch Section */}
        <div className="pt-3 mt-3 border-t border-stone-100 dark:border-stone-800">
          <div
            className={cn(
              'text-[10px] font-extrabold uppercase tracking-wider text-stone-400 dark:text-stone-500 px-3 transition-all duration-300 ease-in-out overflow-hidden whitespace-nowrap',
              isCollapsed ? 'h-0 opacity-0 py-0 pointer-events-none' : 'h-5 opacity-100 py-1'
            )}
          >
            Active Terminals
          </div>

          <div className="w-full flex flex-col space-y-1.5 mt-1">
            <Tooltip
              content={isCollapsed ? 'Quick POS Terminal' : null}
              position="right"
              wrapperClassName="w-full block"
            >
              <a
                href="/pos?mode=quick"
                target="_blank"
                rel="noopener noreferrer"
                className="group w-full h-11 flex items-center rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 border border-amber-200/80 dark:border-amber-900/50 hover:bg-amber-100 dark:hover:bg-amber-950/60 transition-all cursor-pointer overflow-hidden"
              >
                <div className="w-[56px] shrink-0 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 transition-transform duration-200 group-hover:scale-110" />
                </div>
                <div
                  className={cn(
                    'flex-1 flex items-center justify-between min-w-0 pr-3 whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out',
                    isCollapsed ? 'opacity-0 max-w-0 pointer-events-none' : 'opacity-100 max-w-[180px]'
                  )}
                >
                  <span className="text-xs font-bold truncate">Quick POS Terminal</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-60 ml-2 shrink-0" />
                </div>
              </a>
            </Tooltip>

            <Tooltip
              content={isCollapsed ? 'Table POS Terminal' : null}
              position="right"
              wrapperClassName="w-full block"
            >
              <a
                href="/pos?mode=table"
                target="_blank"
                rel="noopener noreferrer"
                className="group w-full h-11 flex items-center rounded-2xl bg-stone-50 dark:bg-stone-850 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-750 hover:bg-stone-100 dark:hover:bg-stone-800 transition-all cursor-pointer overflow-hidden"
              >
                <div className="w-[56px] shrink-0 flex items-center justify-center">
                  <Utensils className="w-4 h-4 text-amber-500 shrink-0 transition-transform duration-200 group-hover:scale-110" />
                </div>
                <div
                  className={cn(
                    'flex-1 flex items-center justify-between min-w-0 pr-3 whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out',
                    isCollapsed ? 'opacity-0 max-w-0 pointer-events-none' : 'opacity-100 max-w-[180px]'
                  )}
                >
                  <span className="text-xs font-bold truncate">Table POS Terminal</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-60 ml-2 shrink-0" />
                </div>
              </a>
            </Tooltip>
          </div>
        </div>
      </div>

      {/* 3. Bottom User Logout Section */}
      <div className="p-2 border-t border-stone-200/80 dark:border-stone-800 shrink-0">
        <Tooltip
          content={isCollapsed ? 'Sign Out' : null}
          position="right"
          wrapperClassName="w-full block"
        >
          <button
            type="button"
            onClick={onSignOut}
            className="group w-full h-11 flex items-center rounded-2xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all cursor-pointer overflow-hidden"
            aria-label="Sign Out"
          >
            <div className="w-[56px] shrink-0 flex items-center justify-center">
              <LogOut className="w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-110" />
            </div>
            <div
              className={cn(
                'flex-1 min-w-0 pr-3 whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out text-left',
                isCollapsed ? 'opacity-0 max-w-0 pointer-events-none' : 'opacity-100 max-w-[180px]'
              )}
            >
              <span className="text-xs font-bold truncate">Sign Out</span>
            </div>
          </button>
        </Tooltip>
      </div>
    </aside>
  );
};
