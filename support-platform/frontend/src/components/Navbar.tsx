import React from 'react';
import { ShieldCheck, Plus, Settings2, RefreshCw, Sun, Moon, LogOut, User } from 'lucide-react';
import { Tooltip } from './common/Tooltip';
import { useTheme } from '../context/ThemeContext';
import { AdminUser } from '../types';

interface NavbarProps {
  onOpenRegister: () => void;
  onOpenPlanManager: () => void;
  onRefresh: () => void;
  onLogout: () => void;
  currentUser: AdminUser | null;
  isLoading: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenRegister,
  onOpenPlanManager,
  onRefresh,
  onLogout,
  currentUser,
  isLoading,
}) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20 text-slate-950">
              <ShieldCheck className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">
                  QSR Super-Admin
                </span>
                <span className="px-2 py-0.5 text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 rounded-full">
                  Golden DB Control
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Master License Issuer & Multi-Cafe Management</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2.5">
            {/* Theme Toggle Button */}
            <Tooltip content={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'} position="bottom">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all cursor-pointer"
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-indigo-600" />
                )}
              </button>
            </Tooltip>

            {/* Refresh Data */}
            <Tooltip content="Refresh Golden DB data" position="bottom">
              <button
                onClick={onRefresh}
                disabled={isLoading}
                className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl transition-all cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-amber-500' : ''}`} />
              </button>
            </Tooltip>

            {/* Plan Manager */}
            <button
              onClick={onOpenPlanManager}
              className="flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm transition-all cursor-pointer"
            >
              <Settings2 className="w-3.5 h-3.5 text-amber-500" />
              <span>Manage Plans</span>
            </button>

            {/* Onboard Cafe */}
            <button
              onClick={onOpenRegister}
              className="flex items-center space-x-1.5 px-3.5 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 rounded-xl shadow-md shadow-orange-500/20 transition-all active:scale-[0.98] cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>Onboard Cafe</span>
            </button>

            {/* Admin User Chip & Logout */}
            <div className="pl-2 flex items-center space-x-2 border-l border-slate-200 dark:border-slate-800">
              <div className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                <User className="w-3.5 h-3.5 text-amber-500" />
                <span className="truncate max-w-[110px]">{currentUser?.username || 'Admin'}</span>
              </div>

              <Tooltip content="Sign Out from Super-Admin" position="bottom">
                <button
                  onClick={onLogout}
                  className="p-2 rounded-xl text-rose-500 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </Tooltip>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
