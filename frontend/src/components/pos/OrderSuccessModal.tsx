import React from 'react';
import { usePOS } from '../../context/POSContext';
import { CheckCircle2, Receipt } from 'lucide-react';

export const OrderSuccessModal: React.FC = () => {
  const { orderSuccess } = usePOS();

  if (!orderSuccess) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-3xl p-8 shadow-2xl text-center flex flex-col items-center animate-in zoom-in-95 duration-200">
        <div className="w-16 h-16 rounded-3xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 shadow-lg shadow-emerald-600/20">
          <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
        </div>

        <h3 className="text-xl font-extrabold text-stone-900 dark:text-stone-100">
          Settlement Complete!
        </h3>

        <p className="text-xs text-stone-500 dark:text-stone-400 mt-1.5 max-w-xs">
          Order logged, stock decremented, and thermal receipt generated.
        </p>

        <div className="mt-5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
          <Receipt className="w-3.5 h-3.5" />
          <span>Ticket Closed Successfully</span>
        </div>
      </div>
    </div>
  );
};
