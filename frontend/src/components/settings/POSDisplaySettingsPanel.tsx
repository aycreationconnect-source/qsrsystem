import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { settingsApi } from '../../api/settingsApi';
import { toast } from '../../context/ToastContext';
import { parseImageVisibilityMatrix } from '../../lib/imageVisibilityUtils';
import type {
  ItemImageVisibilityMatrix,
  SubmoduleMode,
  DeviceType,
} from '../../types/app.types';
import {
  LayoutGrid,
  Monitor,
  Tablet,
  Smartphone,
  Check,
  Plus,
  Minus,
  Eye,
  EyeOff,
  Zap,
} from 'lucide-react';
import { cn } from '../../lib/utils';

export const POSDisplaySettingsPanel: React.FC = () => {
  const { appData, setAppData, refreshSettings } = useApp();

  const [matrix, setMatrix] = useState<ItemImageVisibilityMatrix>(() => {
    return parseImageVisibilityMatrix(appData.settings);
  });

  const [isSaving, setIsSaving] = useState(false);

  // Sync state if appData.settings updates from server
  useEffect(() => {
    setMatrix(parseImageVisibilityMatrix(appData.settings));
  }, [appData.settings]);

  // Preview interactive state
  const [previewMode, setPreviewMode] = useState<SubmoduleMode>('qsr');
  const [previewDevice, setPreviewDevice] = useState<DeviceType>('desktop');
  const [previewQty, setPreviewQty] = useState(0);

  const previewShowImages = matrix[previewMode]?.[previewDevice] ?? false;

  // Toggle individual cell
  const handleToggleCell = (mode: SubmoduleMode, device: DeviceType) => {
    setMatrix((prev) => ({
      ...prev,
      [mode]: {
        ...prev[mode],
        [device]: !prev[mode][device],
      },
    }));
  };

  // Row quick-action: All ON / All OFF for a specific mode
  const handleSetRow = (mode: SubmoduleMode, value: boolean) => {
    setMatrix((prev) => ({
      ...prev,
      [mode]: {
        desktop: value,
        tablet: value,
        mobile: value,
      },
    }));
  };

  // Column quick-action: All ON / All OFF for a specific device
  const handleSetColumn = (device: DeviceType, value: boolean) => {
    setMatrix((prev) => ({
      qsr: { ...prev.qsr, [device]: value },
      table: { ...prev.table, [device]: value },
      digital_menu: { ...prev.digital_menu, [device]: value },
    }));
  };

  // Save changes to backend
  const handleSave = async () => {
    try {
      setIsSaving(true);
      const isAnyPhotoEnabled = Object.values(matrix).some((sub) =>
        Object.values(sub).some(Boolean)
      );

      const payload: Record<string, string> = {
        itemImageVisibility: JSON.stringify(matrix),
        showItemImages: isAnyPhotoEnabled ? 'true' : 'false',
      };

      await settingsApi.saveSettings(payload);

      setAppData((prev) => ({
        ...prev,
        settings: {
          ...prev.settings,
          ...payload,
        },
      }));

      toast.success('POS & Menu display configuration saved successfully!');
      await refreshSettings();
    } catch (err) {
      console.error(err);
      toast.error('Failed to save POS display settings.');
    } finally {
      setIsSaving(false);
    }
  };

  const modulesMeta: {
    id: SubmoduleMode;
    label: string;
  }[] = [
      {
        id: 'qsr',
        label: 'QSR (Quick POS)',
      },
      {
        id: 'table',
        label: 'Table POS',
      },
      {
        id: 'digital_menu',
        label: 'Digital Menu',
      },
    ];

  return (
    <div className="bg-white dark:bg-stone-900 border border-amber-500/40 dark:border-amber-500/30 rounded-3xl p-5 sm:p-7 shadow-sm space-y-6 animate-in fade-in duration-150">
      {/* 1. Header & Save Action Bar */}
      <div className="pb-4 border-b border-stone-100 dark:border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-extrabold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <LayoutGrid className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <span>POS & Menu Card Display Settings</span>
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
            Configure dish image visibility and fast card tap actions across devices (Desktop, Tablet, Mobile) and ordering terminals (QSR (Quick POS), Table POS, Digital Menu).
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className={cn(
            'px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-black text-xs sm:text-sm shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 disabled:opacity-50 active:scale-98 self-start sm:self-auto'
          )}
        >
          {isSaving ? (
            <div className="w-4 h-4 border-2 border-stone-950 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Check className="w-4 h-4 stroke-[2.5]" />
          )}
          <span>{isSaving ? 'Saving...' : 'Save Configuration'}</span>
        </button>
      </div>

      {/* 2. Granular Visibility Matrix Section */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-stone-100 dark:border-stone-800">
          <div>
            <h4 className="text-xs sm:text-sm font-black text-stone-900 dark:text-stone-100">
              Granular Visibility Matrix
            </h4>
            <p className="text-[11px] text-stone-400 mt-0.5">
              Control dish photo visibility individually for each device and terminal.
            </p>
          </div>

          {/* Column level quick toggles */}
          <div className="flex items-center gap-2 text-xs font-bold text-stone-400">
            <span>Columns:</span>
            <button
              type="button"
              onClick={() => {
                handleSetColumn('desktop', true);
                handleSetColumn('tablet', true);
                handleSetColumn('mobile', true);
              }}
              className="text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
            >
              All ON
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => {
                handleSetColumn('desktop', false);
                handleSetColumn('tablet', false);
                handleSetColumn('mobile', false);
              }}
              className="text-stone-500 hover:underline cursor-pointer"
            >
              All OFF
            </button>
          </div>
        </div>

        {/* Matrix Grid */}
        <div className="overflow-x-auto rounded-2xl border border-stone-200/80 dark:border-stone-800">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-stone-200/80 dark:border-stone-800 text-stone-500 dark:text-stone-400 text-xs uppercase tracking-wider">
                <th className="py-3 px-4 font-black">Terminals</th>
                <th className="py-3 px-4 font-black text-center w-36 sm:w-44">
                  <div className="flex items-center justify-center gap-1.5">
                    <Monitor className="w-4 h-4 text-stone-600 dark:text-stone-300" />
                    <span>Desktop</span>
                  </div>
                  <span className="text-[10px] font-normal normal-case block text-stone-400">
                    &ge; 1024px
                  </span>
                </th>
                <th className="py-3 px-4 font-black text-center w-36 sm:w-44">
                  <div className="flex items-center justify-center gap-1.5">
                    <Tablet className="w-4 h-4 text-stone-600 dark:text-stone-300" />
                    <span>Tab (Tablet)</span>
                  </div>
                  <span className="text-[10px] font-normal normal-case block text-stone-400">
                    768px &ndash; 1023px
                  </span>
                </th>
                <th className="py-3 px-4 font-black text-center w-36 sm:w-44">
                  <div className="flex items-center justify-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-stone-600 dark:text-stone-300" />
                    <span>Mobile</span>
                  </div>
                  <span className="text-[10px] font-normal normal-case block text-stone-400">
                    &lt; 768px
                  </span>
                </th>
                <th className="py-3 px-4 font-black text-right w-28">Row Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800 text-sm">
              {modulesMeta.map((mod) => {
                const subConfig = matrix[mod.id];
                const isAllOn = subConfig.desktop && subConfig.tablet && subConfig.mobile;
                return (
                  <tr
                    key={mod.id}
                    className="hover:bg-stone-50/50 dark:hover:bg-stone-850/40 transition-colors"
                  >
                    {/* Submodule */}
                    <td className="py-4 px-4">
                      <span className="font-extrabold text-sm text-stone-900 dark:text-stone-100">
                        {mod.label}
                      </span>
                    </td>

                    {/* Desktop Cell */}
                    <td className="py-4 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleCell(mod.id, 'desktop')}
                        className={cn(
                          'w-full max-w-[130px] mx-auto py-2 px-3 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 select-none border',
                          subConfig.desktop
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-500 shadow-2xs'
                            : 'bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 border-stone-200 dark:border-stone-750 hover:border-amber-400'
                        )}
                      >
                        {subConfig.desktop ? (
                          <>
                            <Eye className="w-3.5 h-3.5" />
                            <span>Photo ON</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3.5 h-3.5" />
                            <span>Text Only</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Tablet Cell */}
                    <td className="py-4 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleCell(mod.id, 'tablet')}
                        className={cn(
                          'w-full max-w-[130px] mx-auto py-2 px-3 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 select-none border',
                          subConfig.tablet
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-500 shadow-2xs'
                            : 'bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 border-stone-200 dark:border-stone-750 hover:border-amber-400'
                        )}
                      >
                        {subConfig.tablet ? (
                          <>
                            <Eye className="w-3.5 h-3.5" />
                            <span>Photo ON</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3.5 h-3.5" />
                            <span>Text Only</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Mobile Cell */}
                    <td className="py-4 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleCell(mod.id, 'mobile')}
                        className={cn(
                          'w-full max-w-[130px] mx-auto py-2 px-3 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 select-none border',
                          subConfig.mobile
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-500 shadow-2xs'
                            : 'bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 border-stone-200 dark:border-stone-750 hover:border-amber-400'
                        )}
                      >
                        {subConfig.mobile ? (
                          <>
                            <Eye className="w-3.5 h-3.5" />
                            <span>Photo ON</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3.5 h-3.5" />
                            <span>Text Only</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Row Quick Action */}
                    <td className="py-4 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleSetRow(mod.id, !isAllOn)}
                        className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
                      >
                        {isAllOn ? 'Turn OFF' : 'Turn ON'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Live Interactive Preview Section */}
      <div className="pt-2 border-t border-stone-100 dark:border-stone-800 space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-2">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-black text-amber-500 uppercase tracking-wider mb-0.5">
              <span>Interactive Simulator</span>
            </div>
            <h4 className="text-xs sm:text-sm font-black text-stone-900 dark:text-stone-100">
              Live Card Appearance Preview
            </h4>
          </div>

          {/* Module & Device Selector for Simulator with Distinct Colors - Side by Side */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {/* Terminal Group: Amber Theme */}
            <div className="inline-flex items-center bg-stone-100 dark:bg-stone-800 p-1 rounded-xl border border-stone-200/80 dark:border-stone-750 shrink-0">
              {(['qsr', 'table', 'digital_menu'] as SubmoduleMode[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setPreviewMode(m)}
                  className={cn(
                    'px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer select-none whitespace-nowrap',
                    previewMode === m
                      ? 'bg-amber-500 text-stone-950 font-black shadow-xs'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
                  )}
                >
                  {m === 'qsr' ? 'QSR (Quick POS)' : m === 'table' ? 'Table POS' : 'Digital Menu'}
                </button>
              ))}
            </div>

            {/* Device Group: Distinct Sky Blue Theme */}
            <div className="inline-flex items-center bg-stone-100 dark:bg-stone-800 p-1 rounded-xl border border-stone-200/80 dark:border-stone-750 shrink-0">
              {(['desktop', 'tablet', 'mobile'] as DeviceType[]).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setPreviewDevice(d)}
                  className={cn(
                    'px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer capitalize select-none whitespace-nowrap',
                    previewDevice === d
                      ? 'bg-sky-600 text-white font-black shadow-xs'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
                  )}
                >
                  {d === 'tablet' ? 'Tab' : d}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Simulator Card Box */}
        <div className="mt-4 flex flex-col md:flex-row items-center justify-center gap-6 p-4 sm:p-5 rounded-2xl bg-stone-50/70 dark:bg-stone-950/40 border border-dashed border-stone-200 dark:border-stone-800">
          {/* Card Simulation */}
          <div className="w-full max-w-sm">
            <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-2">
              <span>Card Output in POS:</span>
            </div>

            {/* Render Simulated Card */}
            {previewShowImages ? (
              /* Photo Mode Card */
              <div
                onClick={() => setPreviewQty((q) => q + 1)}
                className={cn(
                  'bg-white dark:bg-stone-900 border rounded-2xl overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-200 select-none group cursor-pointer active:scale-[0.98]',
                  previewQty > 0
                    ? 'border-amber-500 ring-2 ring-amber-500/50'
                    : 'border-stone-200/80 dark:border-stone-800 hover:border-amber-400'
                )}
              >
                <div className="relative h-36 w-full overflow-hidden bg-stone-100 dark:bg-stone-800">
                  <img
                    src="https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=500&q=80"
                    alt="Paneer Tikka"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2.5 left-2.5 bg-white/95 dark:bg-stone-900/95 p-1 rounded-lg shadow-xs">
                    <span className="badge-diet-veg" />
                  </div>
                  <div className="absolute top-2.5 right-2.5 flex items-center gap-1">
                    <span className="text-[9px] font-black text-amber-900 dark:text-amber-200 bg-amber-200/90 px-1.5 py-0.5 rounded-md">
                      Custom
                    </span>
                  </div>
                </div>

                <div className="p-3.5 flex flex-col flex-1 justify-between gap-2.5">
                  <div>
                    <h4 className="text-sm font-extrabold text-stone-900 dark:text-stone-100">
                      Paneer Tikka
                    </h4>
                    <p className="text-[11px] text-stone-400 line-clamp-1 mt-0.5">
                      Marinated cottage cheese cubes roasted in tandoor
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-stone-100 dark:border-stone-800">
                    <div className="text-sm font-extrabold font-mono text-stone-900 dark:text-stone-100">
                      ₹250.00
                    </div>

                    {previewQty > 0 ? (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center bg-amber-500 text-stone-950 font-black rounded-xl p-0.5 shadow-2xs"
                      >
                        <button
                          type="button"
                          onClick={() => setPreviewQty((q) => Math.max(0, q - 1))}
                          className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-amber-600 active:scale-90 transition-all cursor-pointer"
                        >
                          <Minus className="w-3 h-3 stroke-[2.5]" />
                        </button>
                        <span className="px-2 text-xs font-mono font-black">{previewQty}</span>
                        <button
                          type="button"
                          onClick={() => setPreviewQty((q) => q + 1)}
                          className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-amber-600 active:scale-90 transition-all cursor-pointer"
                        >
                          <Plus className="w-3 h-3 stroke-[2.5]" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewQty(1);
                        }}
                        className="px-3.5 py-1.5 rounded-xl border border-amber-500 text-amber-600 dark:text-amber-400 hover:bg-amber-500 hover:text-stone-950 font-black text-xs transition-all flex items-center gap-1 cursor-pointer active:scale-95 shadow-2xs"
                      >
                        <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Add</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* Text-Only Fast POS Mode Card (Requested Default) */
              <div
                onClick={() => setPreviewQty((q) => q + 1)}
                className={cn(
                  'bg-white dark:bg-stone-900 border rounded-2xl p-4 flex flex-col justify-between min-h-[120px] shadow-2xs hover:shadow-md transition-all duration-200 select-none cursor-pointer active:scale-[0.98] group',
                  previewQty > 0
                    ? 'border-amber-500 ring-2 ring-amber-500/40 bg-amber-500/[0.04]'
                    : 'border-stone-200/80 dark:border-stone-800 hover:border-amber-400'
                )}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="badge-diet-veg" />
                      <h4 className="text-sm font-extrabold text-stone-900 dark:text-stone-100 group-hover:text-amber-600 transition-colors">
                        Paneer Tikka
                      </h4>
                    </div>
                    <span className="text-[9px] font-black text-amber-900 dark:text-amber-200 bg-amber-200/90 px-1.5 py-0.5 rounded-md shrink-0">
                      Custom
                    </span>
                  </div>

                  <p className="text-xs text-stone-400 dark:text-stone-500 line-clamp-2 leading-relaxed">
                    Marinated cottage cheese cubes roasted in traditional clay tandoor with mint dip.
                  </p>
                </div>

                <div className="flex items-center justify-between gap-2 pt-2.5 mt-2 border-t border-stone-100 dark:border-stone-800">
                  <div className="text-base font-black font-mono text-stone-900 dark:text-stone-100">
                    ₹250.00
                  </div>

                  {previewQty > 0 ? (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center bg-amber-500 text-stone-950 font-black rounded-xl p-0.5 shadow-2xs"
                    >
                      <button
                        type="button"
                        onClick={() => setPreviewQty((q) => Math.max(0, q - 1))}
                        className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-amber-600 active:scale-90 transition-all cursor-pointer"
                      >
                        <Minus className="w-3 h-3 stroke-[2.5]" />
                      </button>
                      <span className="px-2 text-xs font-mono font-black">{previewQty}</span>
                      <button
                        type="button"
                        onClick={() => setPreviewQty((q) => q + 1)}
                        className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-amber-600 active:scale-90 transition-all cursor-pointer"
                      >
                        <Plus className="w-3 h-3 stroke-[2.5]" />
                      </button>
                    </div>
                  ) : (
                    <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md">
                      Tap card to add
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Reset test counter */}
            {previewQty > 0 && (
              <div className="mt-2 text-center">
                <button
                  type="button"
                  onClick={() => setPreviewQty(0)}
                  className="text-[11px] text-stone-400 hover:text-amber-600 underline cursor-pointer font-bold"
                >
                  Reset simulator quantity ({previewQty} in order)
                </button>
              </div>
            )}
          </div>

          {/* Simulator Guidance Notes */}
          <div className="max-w-xs text-xs text-stone-500 dark:text-stone-400 space-y-2">
            <div className="flex items-start gap-2 font-bold text-stone-800 dark:text-stone-200">
              <Zap className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <span>Behavior Summary for Current Selection</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-[11px] text-stone-500">
              <li>
                <strong>Terminal:</strong> {previewMode === 'qsr' ? 'QSR (Quick POS)' : previewMode === 'table' ? 'Table POS' : 'Digital Menu'}
              </li>
              <li>
                <strong>Device:</strong> {previewDevice.toUpperCase()}
              </li>
              <li>
                <strong>Images:</strong> {previewShowImages ? 'Displayed' : 'Hidden (Compact)'}
              </li>
              <li>
                <strong>Add Button:</strong> {previewShowImages ? 'Shown' : 'Removed (Direct Card Tap)'}
              </li>
            </ul>
            <p className="text-[11px] bg-amber-500/10 text-amber-900 dark:text-amber-300 p-2.5 rounded-xl border border-amber-500/20 leading-relaxed">
              💡 <strong>Tip:</strong> In text-only mode, cashiers can punch tickets 2x faster by tapping anywhere on the card tile without aiming for a small button.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Save Action Footer */}
      <div className="flex justify-end pt-3 border-t border-stone-100 dark:border-stone-800">
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className={cn(
            'px-8 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-black text-xs sm:text-sm shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-98'
          )}
        >
          {isSaving ? (
            <div className="w-4 h-4 border-2 border-stone-950 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Check className="w-4 h-4 stroke-[2.5]" />
          )}
          <span>{isSaving ? 'Saving...' : 'Save Configuration'}</span>
        </button>
      </div>
    </div>
  );
};
