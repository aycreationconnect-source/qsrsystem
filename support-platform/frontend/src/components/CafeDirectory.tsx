import React, { useState } from 'react';
import {
  Search,
  MessageSquare,
  RefreshCw,
  History,
  KeyRound,
  MapPin,
  Phone,
  Calendar,
  Ban,
  CheckCircle2,
  Copy,
  Check,
} from 'lucide-react';
import { CafeMaster } from '../types';
import { Tooltip } from './common/Tooltip';

interface CafeDirectoryProps {
  cafes: CafeMaster[];
  onOpenWhatsApp: (cafe: CafeMaster) => void;
  onOpenRenew: (cafe: CafeMaster) => void;
  onOpenHistory: (cafe: CafeMaster) => void;
  onRequestRegenerateKey: (cafe: CafeMaster) => void;
  onRequestToggleStatus: (cafe: CafeMaster, action: 'BLOCK' | 'UNBLOCK') => void;
  search: string;
  onSearchChange: (val: string) => void;
  activeFilter: string;
}

export const CafeDirectory: React.FC<CafeDirectoryProps> = ({
  cafes,
  onOpenWhatsApp,
  onOpenRenew,
  onOpenHistory,
  onRequestRegenerateKey,
  onRequestToggleStatus,
  search,
  onSearchChange,
  activeFilter,
}) => {
  const [selectedCity, setSelectedCity] = useState<string>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Extract unique cities
  const cities = ['ALL', ...Array.from(new Set(cafes.map((c) => c.city).filter(Boolean)))];

  const handleCopyId = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filter cafes
  const filteredCafes = cafes.filter((cafe) => {
    // Status Filter
    if (activeFilter === 'TRIAL' && (cafe.computedStatus !== 'TRIAL' || cafe.isExpired || cafe.isSuspended)) return false;
    if (activeFilter === 'EXPIRING_SOON' && !cafe.isExpiringSoon) return false;
    if (activeFilter === 'PAID' && (cafe.plan?.planType !== 'PAID' || cafe.isExpired || cafe.isSuspended)) return false;
    if (activeFilter === 'EXPIRED' && (!cafe.isExpired || cafe.isSuspended)) return false;
    if (activeFilter === 'SUSPENDED' && !cafe.isSuspended) return false;

    // City Filter
    if (selectedCity !== 'ALL' && cafe.city !== selectedCity) return false;

    return true;
  });

  return (
    <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xl dark:shadow-2xl transition-colors duration-200">
      {/* Table Header & Search Controls */}
      <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50 dark:bg-transparent">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <span>Registered Cafes Directory</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
              {filteredCafes.length} {filteredCafes.length === 1 ? 'store' : 'stores'}
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Monitor offline license validity, trial expirations, and block/unblock cafe access
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* City Filter */}
          <div className="relative">
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              aria-label="Filter by City"
              className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs rounded-xl px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-amber-500/40 appearance-none cursor-pointer shadow-sm"
            >
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city === 'ALL' ? '📍 All Cities' : `📍 ${city}`}
                </option>
              ))}
            </select>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search cafe, code, phone, ID..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 text-xs rounded-xl pl-9 pr-4 py-2 w-56 sm:w-64 focus:outline-none focus:ring-2 focus:ring-amber-500/40 placeholder-slate-400 shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* Cafes Table */}
      {filteredCafes.length === 0 ? (
        <div className="p-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center mx-auto text-slate-400 mb-3">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">No cafes found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            No stores match the current filter or search criteria.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/70 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4">Cafe Code & Master ID</th>
                <th className="py-3.5 px-4">Owner & Contact</th>
                <th className="py-3.5 px-4">City / Region</th>
                <th className="py-3.5 px-4">Assigned Plan</th>
                <th className="py-3.5 px-4">License Expiry</th>
                <th className="py-3.5 px-4">Status & Days Left</th>
                <th className="py-3.5 px-6 text-right">Quick Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70 dark:divide-slate-800/60">
              {filteredCafes.map((cafe) => {
                const expiryDate = new Date(cafe.licenseExpiresAt).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                });

                return (
                  <tr key={cafe.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    {/* Cafe Code & Name & Master ID */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-[11px] shrink-0">
                          {cafe.cafeCode.split('-')[1] || 'CF'}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center space-x-1.5">
                            <span>{cafe.businessName}</span>
                            {/* {cafe.isSuspended && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30 font-bold">
                                BLOCKED
                              </span>
                            )} */}
                          </div>
                          <div className="flex items-center space-x-2 mt-0.5">
                            <span className="font-mono text-[11px] text-amber-600 dark:text-amber-400/90 font-semibold">
                              {cafe.cafeCode}
                            </span>
                            <span className="text-slate-300 dark:text-slate-600">•</span>
                            <Tooltip content={`${copiedId === cafe.id ? 'Copied' : 'Copy'} Master ID`} position="top" align="start">
                              <button
                                onClick={(e) => handleCopyId(cafe.id, e)}
                                className="font-mono text-[10px] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 flex items-center space-x-1 bg-slate-100 dark:bg-slate-950 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-800 cursor-pointer"
                              >
                                {copiedId === cafe.id ? (
                                  <Check className="w-2.5 h-2.5 text-emerald-500" />
                                ) : (
                                  <Copy className="w-2.5 h-2.5 text-slate-400" />
                                )}
                              </button>
                            </Tooltip>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Owner & Phone */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">{cafe.ownerName}</div>
                      <div className="flex items-center space-x-1 text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                        <Phone className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                        <span>{cafe.ownerPhone}</span>
                      </div>
                    </td>

                    {/* City */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-1 text-slate-700 dark:text-slate-300 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                        <span>
                          {cafe.city}, {cafe.state}
                        </span>
                      </div>
                    </td>

                    {/* Plan */}
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                        {cafe.plan?.name || '3 Months Trial'}
                      </span>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {cafe.plan?.durationDays} Days Duration
                      </div>
                    </td>

                    {/* Expiry Date */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-1 text-slate-700 dark:text-slate-300 font-medium">
                        <Calendar className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                        <span>{expiryDate}</span>
                      </div>
                    </td>

                    {/* Status & Days Left */}
                    <td className="py-3.5 px-4">
                      {cafe.isSuspended ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400 border border-red-300 dark:border-red-800">
                          🚫 Blocked by Admin
                        </span>
                      ) : cafe.isExpired ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-300 dark:border-rose-500/30">
                          🛑 Expired
                        </span>
                      ) : cafe.isExpiringSoon ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-500/30 animate-pulse">
                          ⚠️ {cafe.daysRemaining} {cafe.daysRemaining === 1 ? 'day' : 'days'} left
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/30">
                          🟢 {cafe.daysRemaining} days left
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-6 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        {/* Block / Unblock Toggle Button */}
                        {cafe.isSuspended ? (
                          <Tooltip content="Unblock Store Access" position="top" align="center">
                            <button
                              onClick={() => onRequestToggleStatus(cafe, 'UNBLOCK')}
                              className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-500/10 hover:bg-emerald-200 dark:hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/30 transition-all active:scale-95 cursor-pointer"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </button>
                          </Tooltip>
                        ) : (
                          <Tooltip content="Block Store Access" position="top" align="center">
                            <button
                              onClick={() => onRequestToggleStatus(cafe, 'BLOCK')}
                              className="p-1.5 rounded-lg bg-red-100 dark:bg-red-500/10 hover:bg-red-200 dark:hover:bg-red-500/20 text-red-700 dark:text-red-400 border border-red-300 dark:border-red-500/30 transition-all active:scale-95 cursor-pointer"
                            >
                              <Ban className="w-3.5 h-3.5" />
                            </button>
                          </Tooltip>
                        )}

                        {/* WhatsApp Onboarding Card */}
                        <Tooltip content="WhatsApp Onboarding Card & Key" position="top" align="center">
                          <button
                            onClick={() => onOpenWhatsApp(cafe)}
                            className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-500/10 hover:bg-emerald-200 dark:hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/30 transition-all active:scale-95 cursor-pointer"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </button>
                        </Tooltip>

                        {/* Renew / Extend */}
                        <Tooltip content="Renew or Extend License" position="top" align="end">
                          <button
                            onClick={() => onOpenRenew(cafe)}
                            className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-500/10 hover:bg-amber-200 dark:hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-500/30 transition-all active:scale-95 cursor-pointer"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>
                        </Tooltip>

                        {/* Audit History */}
                        <Tooltip content="View License Audit History" position="top" align="end">
                          <button
                            onClick={() => onOpenHistory(cafe)}
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-all active:scale-95 cursor-pointer"
                          >
                            <History className="w-3.5 h-3.5" />
                          </button>
                        </Tooltip>

                        {/* Regenerate Key */}
                        <Tooltip content="Regenerate Cryptographic Key" position="top" align="end">
                          <button
                            onClick={() => onRequestRegenerateKey(cafe)}
                            className="p-1.5 rounded-lg bg-purple-100 dark:bg-purple-500/10 hover:bg-purple-200 dark:hover:bg-purple-500/20 text-purple-700 dark:text-purple-400 border border-purple-300 dark:border-purple-500/30 transition-all active:scale-95 cursor-pointer"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                          </button>
                        </Tooltip>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
