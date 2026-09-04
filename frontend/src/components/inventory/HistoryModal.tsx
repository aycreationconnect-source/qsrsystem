import React from 'react';
import { useApp } from '../../context/AppContext';
import { Modal, Button } from '../ui';
import { History, ArrowUpRight, ArrowDownRight, Clock } from 'lucide-react';

interface HistoryModalProps {
  show: boolean;
  onClose: () => void;
  historyItemIndex: number | null;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({ show, onClose, historyItemIndex }) => {
  const { appData } = useApp();

  if (!show || historyItemIndex === null || !appData.inventory[historyItemIndex]) {
    return null;
  }

  const currentItem = appData.inventory[historyItemIndex];
  const historyList = currentItem.history || [];

  return (
    <Modal
      isOpen={show}
      onClose={onClose}
      title={`Stock Movement Ledger: ${currentItem.item}`}
      description={`Audit log of receipts, consumption, and manual adjustments for this ingredient (${currentItem.unit}).`}
      maxWidth="lg"
      footer={
        <Button variant="outline" size="sm" onClick={onClose}>
          Close Ledger
        </Button>
      }
    >
      <div className="space-y-3">
        {/* Item Summary Card */}
        <div className="p-3.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <History className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-stone-900 dark:text-stone-100 block">
                {currentItem.item}
              </span>
              <span className="text-[10px] text-stone-500 dark:text-stone-400">
                Minimum Alert Threshold: {currentItem.threshold} {currentItem.unit}
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-stone-400 block">
              Current Available
            </span>
            <span className="text-sm font-extrabold text-stone-900 dark:text-stone-100">
              {currentItem.stock} {currentItem.unit}
            </span>
          </div>
        </div>

        {/* Movement Table */}
        <div className="max-h-[360px] overflow-y-auto border border-stone-200/80 dark:border-stone-800 rounded-2xl">
          {historyList.length === 0 ? (
            <div className="p-8 text-center text-stone-400">
              <Clock className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-xs font-bold text-stone-600 dark:text-stone-400">
                No Stock Movements Recorded
              </p>
              <p className="text-[11px] text-stone-400 mt-0.5">
                Adjustments and recipe order deductions will appear chronologically here.
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-50 dark:bg-stone-850/60 border-b border-stone-200/80 dark:border-stone-800 text-[11px] font-extrabold uppercase tracking-wider text-stone-400">
                  <th className="py-2.5 px-4">Date & Time</th>
                  <th className="py-2.5 px-4">Quantity Change</th>
                  <th className="py-2.5 px-4">Movement Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800/80 text-xs">
                {historyList.map((hist: any, i: number) => {
                  const isPositive = String(hist.change).startsWith('+');
                  return (
                    <tr
                      key={i}
                      className="hover:bg-amber-50/20 dark:hover:bg-amber-950/10 transition-colors"
                    >
                      <td className="py-2.5 px-4 text-stone-600 dark:text-stone-300 font-mono text-[11px]">
                        {hist.date}
                      </td>
                      <td className="py-2.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 font-mono font-bold px-2 py-0.5 rounded-lg text-xs ${
                            isPositive
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60'
                              : 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/60'
                          }`}
                        >
                          {isPositive ? (
                            <ArrowUpRight className="w-3 h-3 text-emerald-500" />
                          ) : (
                            <ArrowDownRight className="w-3 h-3 text-rose-500" />
                          )}
                          <span>
                            {hist.change} {currentItem.unit}
                          </span>
                        </span>
                      </td>
                      <td className="py-2.5 px-4 font-semibold text-stone-700 dark:text-stone-300">
                        {hist.type || 'Manual Adjustment'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </Modal>
  );
};
