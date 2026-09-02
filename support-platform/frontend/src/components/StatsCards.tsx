import React from 'react';
import { Store, Clock, AlertTriangle, CheckCircle2, ShieldAlert, Ban } from 'lucide-react';
import { DashboardStats } from '../types';

interface StatsCardsProps {
  stats: DashboardStats | null;
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ stats, activeFilter, onFilterChange }) => {
  if (!stats) return null;

  const cards = [
    {
      id: 'ALL',
      label: 'Total Cafes',
      value: stats.totalCafes,
      sub: 'Onboarded in Golden DB',
      icon: Store,
      bg: 'bg-blue-50/70 dark:bg-blue-950/20 border-blue-200 dark:border-blue-500/20 text-blue-600 dark:text-blue-400',
      activeRing: 'ring-2 ring-blue-500 border-transparent shadow-md shadow-blue-500/10',
    },
    {
      id: 'TRIAL',
      label: 'Active Free Trials',
      value: stats.activeTrials,
      sub: '3-Month & Pilot trials running',
      icon: Clock,
      bg: 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400',
      activeRing: 'ring-2 ring-emerald-500 border-transparent shadow-md shadow-emerald-500/10',
    },
    {
      id: 'EXPIRING_SOON',
      label: 'Expiring Soon (≤ 15d)',
      value: stats.expiringSoon,
      sub: 'Action needed: Contact owner',
      icon: AlertTriangle,
      bg: 'bg-amber-50/70 dark:bg-amber-950/20 border-amber-200 dark:border-amber-500/20 text-amber-600 dark:text-amber-400',
      activeRing: 'ring-2 ring-amber-500 border-transparent shadow-md shadow-amber-500/10',
    },
    {
      id: 'PAID',
      label: 'Paid Subscriptions',
      value: stats.paidActive,
      sub: 'Active recurring revenue',
      icon: CheckCircle2,
      bg: 'bg-purple-50/70 dark:bg-purple-950/20 border-purple-200 dark:border-purple-500/20 text-purple-600 dark:text-purple-400',
      activeRing: 'ring-2 ring-purple-500 border-transparent shadow-md shadow-purple-500/10',
    },
    {
      id: 'EXPIRED',
      label: 'Expired Licenses',
      value: stats.expired,
      sub: 'Trial period ended',
      icon: ShieldAlert,
      bg: 'bg-rose-50/70 dark:bg-rose-950/20 border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400',
      activeRing: 'ring-2 ring-rose-500 border-transparent shadow-md shadow-rose-500/10',
    },
    {
      id: 'SUSPENDED',
      label: 'Blocked / Suspended',
      value: stats.suspended || 0,
      sub: 'Access revoked by Admin',
      icon: Ban,
      bg: 'bg-red-50/70 dark:bg-red-950/30 border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400',
      activeRing: 'ring-2 ring-red-500 border-transparent shadow-md shadow-red-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3.5">
      {cards.map((card) => {
        const Icon = card.icon;
        const isSelected = activeFilter === card.id;

        return (
          <button
            key={card.id}
            onClick={() => onFilterChange(card.id)}
            className={`p-4 rounded-2xl text-left ${card.bg} border transition-all hover:scale-[1.02] cursor-pointer ${
              isSelected ? card.activeRing : 'hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {card.label}
              </span>
              <Icon className="w-4 h-4 opacity-90" />
            </div>
            <div className="mt-1.5 flex items-baseline space-x-2">
              <span className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                {card.value}
              </span>
            </div>
            <p className="mt-0.5 text-[10px] text-slate-500 dark:text-slate-400 truncate">{card.sub}</p>
          </button>
        );
      })}
    </div>
  );
};
