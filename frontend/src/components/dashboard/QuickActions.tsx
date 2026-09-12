import React from 'react';
import { Link } from 'react-router-dom';
import {
  Zap,
  Armchair,
  UtensilsCrossed,
  Boxes,
  FileSpreadsheet,
  Settings,
  ArrowUpRight,
} from 'lucide-react';

export const QuickActions: React.FC = () => {
  const actions = [
    {
      label: 'Takeaway POS',
      desc: 'Quick Counter Sale',
      path: '/pos?mode=quick',
      icon: Zap,
      iconColor: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-500/10',
      borderHover: 'hover:border-amber-400 dark:hover:border-amber-500',
    },
    {
      label: 'Dine-In Floor',
      desc: 'Table Service & KOT',
      path: '/pos?mode=table',
      icon: Armchair,
      iconColor: 'text-sky-600 dark:text-sky-400',
      bgColor: 'bg-sky-500/10',
      borderHover: 'hover:border-sky-400 dark:hover:border-sky-500',
    },
    {
      label: 'Food Menu',
      desc: 'Dishes, Prices & Categories',
      path: '/menu',
      icon: UtensilsCrossed,
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      borderHover: 'hover:border-emerald-400 dark:hover:border-emerald-500',
    },
    {
      label: 'Stock Audit',
      desc: 'Pantry Ingredients & Levels',
      path: '/inventory',
      icon: Boxes,
      iconColor: 'text-indigo-600 dark:text-indigo-400',
      bgColor: 'bg-indigo-500/10',
      borderHover: 'hover:border-indigo-400 dark:hover:border-indigo-500',
    },
    {
      label: 'Sales Reports',
      desc: 'Daily Register & Invoices',
      path: '/reports',
      icon: FileSpreadsheet,
      iconColor: 'text-violet-600 dark:text-violet-400',
      bgColor: 'bg-violet-500/10',
      borderHover: 'hover:border-violet-400 dark:hover:border-violet-500',
    },
    {
      label: 'Store Settings',
      desc: 'Taxes, Printer & Profile',
      path: '/settings',
      icon: Settings,
      iconColor: 'text-stone-600 dark:text-stone-400',
      bgColor: 'bg-stone-500/10',
      borderHover: 'hover:border-stone-400 dark:hover:border-stone-500',
    },
  ];

  return (
    <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 hover:border-amber-400/80 dark:hover:border-amber-500/60 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col justify-between transition-all">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-stone-100 dark:border-stone-800">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-stone-900 dark:text-stone-100">
              Quick Operations
            </h3>
            <p className="text-[11px] text-stone-400 dark:text-stone-500">
              Fast shortcuts to everyday POS and store tools
            </p>
          </div>
        </div>

        <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400">
          6 Workflows
        </span>
      </div>

      {/* Grid of Shortcuts */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-3">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <Link
              key={act.label}
              to={act.path}
              className={`p-3.5 rounded-2xl border border-stone-200/70 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-850/60 ${act.borderHover} transition-all flex flex-col justify-between group active:scale-98`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${act.bgColor} ${act.iconColor}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-stone-300 dark:text-stone-600 group-hover:text-amber-500 transition-colors" />
              </div>

              <div>
                <span className="text-xs font-extrabold text-stone-850 dark:text-stone-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 block transition-colors">
                  {act.label}
                </span>
                <span className="text-[10px] text-stone-400 dark:text-stone-500 block truncate mt-0.5">
                  {act.desc}
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="pt-3 border-t border-stone-100 dark:border-stone-800 text-[11px] text-stone-400 flex items-center justify-between">
        <span>Instant launch without navigation menu</span>
        <span className="font-semibold text-stone-500">Shortcuts</span>
      </div>
    </div>
  );
};
