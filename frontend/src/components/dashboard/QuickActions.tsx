import React from 'react';
import { Link } from 'react-router-dom';
import { UtensilsCrossed, Armchair, Boxes, Settings, Zap, FileSpreadsheet } from 'lucide-react';

export const QuickActions: React.FC = () => {
  const actions = [
    { label: 'Add Dish', path: '/menu', icon: UtensilsCrossed, color: 'text-amber-600 bg-amber-500/10' },
    { label: 'New Table', path: '/tables', icon: Armchair, color: 'text-sky-600 bg-sky-500/10' },
    { label: 'Stock Audit', path: '/inventory', icon: Boxes, color: 'text-emerald-600 bg-emerald-500/10' },
    { label: 'Reports', path: '/reports', icon: FileSpreadsheet, color: 'text-indigo-600 bg-indigo-500/10' },
    { label: 'Settings', path: '/settings', icon: Settings, color: 'text-stone-600 bg-stone-500/10' },
  ];

  return (
    <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-3xl p-5 sm:p-6 shadow-sm">
      <div className="flex items-center gap-2 pb-3 border-b border-stone-100 dark:border-stone-800 mb-4">
        <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
          <Zap className="w-4 h-4" />
        </div>
        <h3 className="text-sm font-extrabold text-stone-900 dark:text-stone-100">
          Quick Workflows
        </h3>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-5 gap-2.5">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <Link
              key={act.label}
              to={act.path}
              className="p-3.5 rounded-2xl border border-stone-200/80 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-850 hover:bg-amber-50 hover:border-amber-400 dark:hover:bg-amber-950/20 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer active:scale-95 group"
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${act.color}`}>
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-stone-800 dark:text-stone-200 group-hover:text-amber-600">
                {act.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
