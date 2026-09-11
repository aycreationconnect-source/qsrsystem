export interface AreaColorTheme {
  id: string;
  name: string;
  hex: string;
  dot: string;
  topAccent: string;
  cardBorder: string;
  cardBgLight: string;
  headerBg: string;
  iconBg: string;
  badge: string;
  tableCardHover: string;
  newTableBorder: string;
  filterActive: string;
}

export const AREA_COLOR_THEMES: AreaColorTheme[] = [
  {
    id: 'amber',
    name: 'Warm Amber',
    hex: '#f59e0b',
    dot: 'bg-amber-500',
    topAccent: 'bg-amber-500',
    cardBorder: 'border-amber-200/90 dark:border-amber-900/50',
    cardBgLight: 'bg-amber-500/[0.02]',
    headerBg: 'bg-amber-50/70 dark:bg-amber-950/30',
    iconBg: 'bg-amber-500/15 dark:bg-amber-500/25 text-amber-600 dark:text-amber-400',
    badge: 'bg-amber-100/80 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300/60 dark:border-amber-800/60',
    tableCardHover: 'hover:border-amber-400 dark:hover:border-amber-500',
    newTableBorder: 'border-amber-300 dark:border-amber-800/80 hover:border-amber-500 text-amber-600 dark:text-amber-400 hover:bg-amber-50/50 dark:hover:bg-amber-950/30',
    filterActive: 'bg-amber-500 text-stone-950 shadow-sm ring-1 ring-amber-400',
  },
  {
    id: 'indigo',
    name: 'Royal Indigo',
    hex: '#6366f1',
    dot: 'bg-indigo-500',
    topAccent: 'bg-indigo-500',
    cardBorder: 'border-indigo-200/90 dark:border-indigo-900/50',
    cardBgLight: 'bg-indigo-500/[0.02]',
    headerBg: 'bg-indigo-50/70 dark:bg-indigo-950/30',
    iconBg: 'bg-indigo-500/15 dark:bg-indigo-500/25 text-indigo-600 dark:text-indigo-400',
    badge: 'bg-indigo-100/80 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 border border-indigo-300/60 dark:border-indigo-800/60',
    tableCardHover: 'hover:border-indigo-400 dark:hover:border-indigo-500',
    newTableBorder: 'border-indigo-300 dark:border-indigo-800/80 hover:border-indigo-500 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30',
    filterActive: 'bg-indigo-500 text-white shadow-sm ring-1 ring-indigo-400',
  },
  {
    id: 'emerald',
    name: 'Fresh Emerald',
    hex: '#10b981',
    dot: 'bg-emerald-500',
    topAccent: 'bg-emerald-500',
    cardBorder: 'border-emerald-200/90 dark:border-emerald-900/50',
    cardBgLight: 'bg-emerald-500/[0.02]',
    headerBg: 'bg-emerald-50/70 dark:bg-emerald-950/30',
    iconBg: 'bg-emerald-500/15 dark:bg-emerald-500/25 text-emerald-600 dark:text-emerald-400',
    badge: 'bg-emerald-100/80 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300/60 dark:border-emerald-800/60',
    tableCardHover: 'hover:border-emerald-400 dark:hover:border-emerald-500',
    newTableBorder: 'border-emerald-300 dark:border-emerald-800/80 hover:border-emerald-500 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30',
    filterActive: 'bg-emerald-500 text-white shadow-sm ring-1 ring-emerald-400',
  },
  {
    id: 'purple',
    name: 'Velvet Purple',
    hex: '#a855f7',
    dot: 'bg-purple-500',
    topAccent: 'bg-purple-500',
    cardBorder: 'border-purple-200/90 dark:border-purple-900/50',
    cardBgLight: 'bg-purple-500/[0.02]',
    headerBg: 'bg-purple-50/70 dark:bg-purple-950/30',
    iconBg: 'bg-purple-500/15 dark:bg-purple-500/25 text-purple-600 dark:text-purple-400',
    badge: 'bg-purple-100/80 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border border-purple-300/60 dark:border-purple-800/60',
    tableCardHover: 'hover:border-purple-400 dark:hover:border-purple-500',
    newTableBorder: 'border-purple-300 dark:border-purple-800/80 hover:border-purple-500 text-purple-600 dark:text-purple-400 hover:bg-purple-50/50 dark:hover:bg-purple-950/30',
    filterActive: 'bg-purple-500 text-white shadow-sm ring-1 ring-purple-400',
  },
  {
    id: 'rose',
    name: 'Coral Rose',
    hex: '#f43f5e',
    dot: 'bg-rose-500',
    topAccent: 'bg-rose-500',
    cardBorder: 'border-rose-200/90 dark:border-rose-900/50',
    cardBgLight: 'bg-rose-500/[0.02]',
    headerBg: 'bg-rose-50/70 dark:bg-rose-950/30',
    iconBg: 'bg-rose-500/15 dark:bg-rose-500/25 text-rose-600 dark:text-rose-400',
    badge: 'bg-rose-100/80 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-300/60 dark:border-rose-800/60',
    tableCardHover: 'hover:border-rose-400 dark:hover:border-rose-500',
    newTableBorder: 'border-rose-300 dark:border-rose-800/80 hover:border-rose-500 text-rose-600 dark:text-rose-400 hover:bg-rose-50/50 dark:hover:bg-rose-950/30',
    filterActive: 'bg-rose-500 text-white shadow-sm ring-1 ring-rose-400',
  },
  {
    id: 'cyan',
    name: 'Electric Cyan',
    hex: '#06b6d4',
    dot: 'bg-cyan-500',
    topAccent: 'bg-cyan-500',
    cardBorder: 'border-cyan-200/90 dark:border-cyan-900/50',
    cardBgLight: 'bg-cyan-500/[0.02]',
    headerBg: 'bg-cyan-50/70 dark:bg-cyan-950/30',
    iconBg: 'bg-cyan-500/15 dark:bg-cyan-500/25 text-cyan-600 dark:text-cyan-400',
    badge: 'bg-cyan-100/80 dark:bg-cyan-950/60 text-cyan-800 dark:text-cyan-300 border border-cyan-300/60 dark:border-cyan-800/60',
    tableCardHover: 'hover:border-cyan-400 dark:hover:border-cyan-500',
    newTableBorder: 'border-cyan-300 dark:border-cyan-800/80 hover:border-cyan-500 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-50/50 dark:hover:bg-cyan-950/30',
    filterActive: 'bg-cyan-500 text-stone-950 shadow-sm ring-1 ring-cyan-400',
  },
  {
    id: 'blue',
    name: 'Ocean Blue',
    hex: '#3b82f6',
    dot: 'bg-blue-500',
    topAccent: 'bg-blue-500',
    cardBorder: 'border-blue-200/90 dark:border-blue-900/50',
    cardBgLight: 'bg-blue-500/[0.02]',
    headerBg: 'bg-blue-50/70 dark:bg-blue-950/30',
    iconBg: 'bg-blue-500/15 dark:bg-blue-500/25 text-blue-600 dark:text-blue-400',
    badge: 'bg-blue-100/80 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-300/60 dark:border-blue-800/60',
    tableCardHover: 'hover:border-blue-400 dark:hover:border-blue-500',
    newTableBorder: 'border-blue-300 dark:border-blue-800/80 hover:border-blue-500 text-blue-600 dark:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-950/30',
    filterActive: 'bg-blue-500 text-white shadow-sm ring-1 ring-blue-400',
  },
  {
    id: 'teal',
    name: 'Deep Teal',
    hex: '#14b8a6',
    dot: 'bg-teal-500',
    topAccent: 'bg-teal-500',
    cardBorder: 'border-teal-200/90 dark:border-teal-900/50',
    cardBgLight: 'bg-teal-500/[0.02]',
    headerBg: 'bg-teal-50/70 dark:bg-teal-950/30',
    iconBg: 'bg-teal-500/15 dark:bg-teal-500/25 text-teal-600 dark:text-teal-400',
    badge: 'bg-teal-100/80 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border border-teal-300/60 dark:border-teal-800/60',
    tableCardHover: 'hover:border-teal-400 dark:hover:border-teal-500',
    newTableBorder: 'border-teal-300 dark:border-teal-800/80 hover:border-teal-500 text-teal-600 dark:text-teal-400 hover:bg-teal-50/50 dark:hover:bg-teal-950/30',
    filterActive: 'bg-teal-500 text-white shadow-sm ring-1 ring-teal-400',
  },
];

/**
 * Returns the color theme for an area by its explicit color identifier,
 * or by fallback index / area ID so every section always has a distinct color.
 */
export function getAreaColorTheme(
  colorOrArea?: string | { color?: string | null; id?: number | string },
  fallbackIndex: number = 0
): AreaColorTheme {
  let colorId: string | null | undefined = null;

  if (typeof colorOrArea === 'string') {
    colorId = colorOrArea;
  } else if (colorOrArea && typeof colorOrArea === 'object') {
    colorId = colorOrArea.color;
    if (!colorId && typeof colorOrArea.id !== 'undefined') {
      const numId = Number(colorOrArea.id);
      if (!isNaN(numId)) {
        fallbackIndex = numId - 1;
      }
    }
  }

  if (colorId) {
    const found = AREA_COLOR_THEMES.find((t) => t.id.toLowerCase() === colorId!.toLowerCase());
    if (found) return found;
  }

  // Fallback to palette index cyclically
  const safeIndex = Math.abs(fallbackIndex) % AREA_COLOR_THEMES.length;
  return AREA_COLOR_THEMES[safeIndex];
}

/**
 * Suggests the next available color from the palette that hasn't been used yet.
 */
export function getNextAvailableColor(existingAreas: Array<{ color?: string | null }> = []): string {
  const usedColors = new Set(
    existingAreas.map((a) => a.color?.toLowerCase()).filter(Boolean)
  );

  const unused = AREA_COLOR_THEMES.find((t) => !usedColors.has(t.id.toLowerCase()));
  if (unused) return unused.id;

  // If all are used, cycle by count
  return AREA_COLOR_THEMES[existingAreas.length % AREA_COLOR_THEMES.length].id;
}
