import React from 'react';
import { useApp } from '../../context/AppContext';
import { Tooltip } from '../ui';
import { Menu, Building } from 'lucide-react';

export interface HeaderProps {
  onToggleMobileNav?: () => void;
  onOpenStoreProfile?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobileNav, onOpenStoreProfile }) => {
  const { activeTab, currentUser, storeProfile, licenseStatus } = useApp();
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
            {activeTab}
          </h2>
        </div>
      </div>

      {/* Right: License Status Pill, Profile Quick Edit & User Avatar */}
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

        {/* Store Profile Quick Edit Button */}
        {onOpenStoreProfile && (
          <Tooltip content="Edit Cafe Logo & Profile" position="bottom">
            <button
              type="button"
              onClick={onOpenStoreProfile}
              className="p-2 rounded-xl text-stone-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-stone-800 transition-colors cursor-pointer"
            >
              <Building className="w-4 h-4" />
            </button>
          </Tooltip>
        )}

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
