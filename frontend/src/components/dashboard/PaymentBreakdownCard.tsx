import React from 'react';
import { Wallet, QrCode, CreditCard, Layers } from 'lucide-react';

export interface PaymentBreakdownData {
  cash: number;
  upi: number;
  card: number;
  other: number;
  total: number;
  cashPercent: number;
  upiPercent: number;
  cardPercent: number;
  otherPercent: number;
}

interface PaymentBreakdownCardProps {
  data: PaymentBreakdownData;
}

export const PaymentBreakdownCard: React.FC<PaymentBreakdownCardProps> = ({ data }) => {
  const { cash, upi, card, other, total, cashPercent, upiPercent, cardPercent, otherPercent } = data;

  return (
    <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 hover:border-amber-400/80 dark:hover:border-amber-500/60 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col justify-between transition-all">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-100 dark:border-stone-800 gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Wallet className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-stone-900 dark:text-stone-100">
              Payment Methods Today
            </h3>
            <p className="text-[11px] text-stone-400 dark:text-stone-500">
              Cash drawer & digital payment breakdown
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          <span className="text-xs font-mono font-black text-emerald-800 dark:text-emerald-300 bg-emerald-500/15 dark:bg-emerald-500/25 px-2.5 py-1 rounded-lg border border-emerald-500/30">
            ₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className="text-[11px] font-bold text-stone-400">Total</span>
        </div>
      </div>

      {/* Multi-Segment Progress Bar */}
      <div className="my-5">
        <div className="flex justify-between items-center text-xs font-bold mb-2">
          <span className="text-stone-500 dark:text-stone-400">Collection Split</span>
          <span className="text-stone-400 font-mono text-[11px]">
            {total > 0 ? '100% Accounted' : 'No sales today'}
          </span>
        </div>

        <div className="h-3.5 w-full bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden flex shadow-inner">
          {total > 0 ? (
            <>
              {cashPercent > 0 && (
                <div
                  style={{ width: `${cashPercent}%` }}
                  title={`Cash: ₹${cash.toFixed(2)} (${cashPercent}%)`}
                  className="bg-emerald-500 hover:bg-emerald-600 transition-all h-full"
                />
              )}
              {upiPercent > 0 && (
                <div
                  style={{ width: `${upiPercent}%` }}
                  title={`UPI: ₹${upi.toFixed(2)} (${upiPercent}%)`}
                  className="bg-sky-500 hover:bg-sky-600 transition-all h-full"
                />
              )}
              {cardPercent > 0 && (
                <div
                  style={{ width: `${cardPercent}%` }}
                  title={`Card: ₹${card.toFixed(2)} (${cardPercent}%)`}
                  className="bg-violet-500 hover:bg-violet-600 transition-all h-full"
                />
              )}
              {otherPercent > 0 && (
                <div
                  style={{ width: `${otherPercent}%` }}
                  title={`Other: ₹${other.toFixed(2)} (${otherPercent}%)`}
                  className="bg-amber-500 hover:bg-amber-600 transition-all h-full"
                />
              )}
            </>
          ) : (
            <div className="w-full bg-stone-200/60 dark:bg-stone-800 h-full rounded-full" />
          )}
        </div>
      </div>

      {/* Breakdown Items List */}
      <div className="space-y-2.5">
        {/* Cash */}
        <div className="flex items-center justify-between p-2.5 rounded-2xl bg-stone-50/70 dark:bg-stone-850/60 border border-stone-200/60 dark:border-stone-800/80">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
            <div className="flex items-center gap-1.5 text-xs font-bold text-stone-800 dark:text-stone-200">
              <Wallet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Cash in Register</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-right">
            <span className="text-xs font-mono font-extrabold text-stone-900 dark:text-stone-100">
              ₹{cash.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-[11px] font-mono text-stone-400 font-semibold w-9 text-right">
              {cashPercent}%
            </span>
          </div>
        </div>

        {/* UPI / Online */}
        <div className="flex items-center justify-between p-2.5 rounded-2xl bg-stone-50/70 dark:bg-stone-850/60 border border-stone-200/60 dark:border-stone-800/80">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-sky-500 shrink-0" />
            <div className="flex items-center gap-1.5 text-xs font-bold text-stone-800 dark:text-stone-200">
              <QrCode className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
              <span>UPI / Online QR</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-right">
            <span className="text-xs font-mono font-extrabold text-stone-900 dark:text-stone-100">
              ₹{upi.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-[11px] font-mono text-stone-400 font-semibold w-9 text-right">
              {upiPercent}%
            </span>
          </div>
        </div>

        {/* Card & Others */}
        <div className="flex items-center justify-between p-2.5 rounded-2xl bg-stone-50/70 dark:bg-stone-850/60 border border-stone-200/60 dark:border-stone-800/80">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-violet-500 shrink-0" />
            <div className="flex items-center gap-1.5 text-xs font-bold text-stone-800 dark:text-stone-200">
              <CreditCard className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
              <span>Card & Other Modes</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-right">
            <span className="text-xs font-mono font-extrabold text-stone-900 dark:text-stone-100">
              ₹{(card + other).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-[11px] font-mono text-stone-400 font-semibold w-9 text-right">
              {cardPercent + otherPercent}%
            </span>
          </div>
        </div>
      </div>

      {/* Footer Drawer Tip */}
      <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-[11px] text-stone-400">
        <span className="flex items-center gap-1">
          <Layers className="w-3 h-3 text-stone-400" />
          <span>Drawer count tip:</span>
        </span>
        <span className="font-semibold text-stone-600 dark:text-stone-300">
          Physical cash should equal ₹{cash.toFixed(2)}
        </span>
      </div>
    </div>
  );
};
