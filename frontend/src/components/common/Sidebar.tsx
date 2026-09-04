import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { CafeBrandBadge } from '../ui';
import {
  LayoutDashboard,
  UtensilsCrossed,
  Boxes,
  Armchair,
  Settings,
  Zap,
  Utensils,
  Tablet,
  LogOut,
  ExternalLink,
} from 'lucide-react';
import { cn } from '../../lib/utils';

export interface SidebarProps {
  onOpenStoreProfile?: () => void;
  onCloseMobileNav?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobileNav }) => {
  const { storeProfile, handleLogout } = useApp();
  const navigate = useNavigate();

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Menu Management', path: '/menu', icon: UtensilsCrossed },
    { label: 'Inventory', path: '/inventory', icon: Boxes },
    { label: 'Table Setup', path: '/tables', icon: Armchair },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  const onSignOut = async () => {
    await handleLogout();
    navigate('/login');
  };

  return (
    <aside className="w-64 sm:w-72 h-full flex flex-col bg-white dark:bg-stone-900 border-r border-stone-200/80 dark:border-stone-800 shrink-0 select-none">
      {/* 1. Cafe Brand Badge Header */}
      <div className="p-4 sm:p-5 border-b border-stone-200/80 dark:border-stone-800 flex items-center justify-between shrink-0">
        <div className="flex-1">
          <CafeBrandBadge
            name={storeProfile?.businessName || 'Vidhara Cafe'}
            cafeCode={storeProfile?.cafeCode || 'CF-MUM-001'}
            logoUrl={storeProfile?.logoUrl}
            size="md"
          />
        </div>
      </div>

      {/* 2. Main Navigation Links */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-1">
        <div className="text-[10px] font-extrabold uppercase tracking-wider text-stone-400 dark:text-stone-500 px-3 py-1.5">
          Management
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onCloseMobileNav}
              className={({ isActive }) =>
                cn(
                  'w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer',
                  isActive
                    ? 'bg-amber-500 text-stone-950 shadow-sm shadow-amber-500/20 font-extrabold'
                    : 'text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
                )
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="truncate">{item.label}</span>
            </NavLink>
          );
        })}

        {/* Terminals Launch Section */}
        <div className="pt-4 mt-4 border-t border-stone-100 dark:border-stone-800">
          <div className="text-[10px] font-extrabold uppercase tracking-wider text-stone-400 dark:text-stone-500 px-3 py-1.5">
            Active Terminals
          </div>

          <div className="space-y-1.5 mt-1">
            <a
              href="/pos?mode=quick"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold bg-amber-50/60 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 border border-amber-200/80 dark:border-amber-900/50 hover:bg-amber-100 dark:hover:bg-amber-950/60 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Zap className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>Quick POS Terminal</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 opacity-60" />
            </a>

            <a
              href="/pos?mode=table"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold bg-stone-50 dark:bg-stone-850 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-750 hover:bg-stone-100 dark:hover:bg-stone-800 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Utensils className="w-4 h-4 text-amber-500" />
                <span>Table POS Terminal</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 opacity-60" />
            </a>

            <a
              href="/pos?mode=kiosk"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold bg-stone-50 dark:bg-stone-850 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-750 hover:bg-stone-100 dark:hover:bg-stone-800 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Tablet className="w-4 h-4 text-emerald-500" />
                <span>Kiosk Terminal</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 opacity-60" />
            </a>
          </div>
        </div>
      </div>

      {/* 3. Bottom User Logout Section */}
      <div className="p-4 border-t border-stone-200/80 dark:border-stone-800 shrink-0">
        <button
          type="button"
          onClick={onSignOut}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
