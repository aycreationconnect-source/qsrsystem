import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Button, Tooltip } from '../ui';
import { Plus, Edit2, FolderTree, Search, Layers } from 'lucide-react';
import { cn } from '../../lib/utils';

interface CategorySidebarProps {
  selectedCategory: string | null;
  setSelectedCategory: (cat: string | null) => void;
  selectedSubcategory?: string | null;
  setSelectedSubcategory?: (sub: string | null) => void;
  onAddCategory: () => void;
  onEditCategory: (catObj: any) => void;
}

export const CategorySidebar: React.FC<CategorySidebarProps> = ({
  selectedCategory,
  setSelectedCategory,
  setSelectedSubcategory,
  onAddCategory,
  onEditCategory,
}) => {
  const { appData } = useApp();
  const [catSearch, setCatSearch] = useState('');

  const categories = appData.categories || [];
  const filteredCategories = categories.filter((c: any) => {
    const name = typeof c === 'string' ? c : c.name;
    return name.toLowerCase().includes(catSearch.toLowerCase());
  });

  return (
    <div className="w-full md:w-72 lg:w-80 h-full flex flex-col bg-white dark:bg-stone-900 border-r border-stone-200/80 dark:border-stone-800 shrink-0 select-none">
      {/* Top Header */}
      <div className="p-4 border-b border-stone-200/80 dark:border-stone-800 flex items-center justify-between shrink-0">
        <div>
          <h3 className="text-sm font-extrabold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
            <FolderTree className="w-4 h-4 text-amber-500" />
            <span>Categories</span>
          </h3>
          <span className="text-[11px] text-stone-400 font-medium">
            {categories.length} Sections
          </span>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={onAddCategory}
          leftIcon={<Plus className="w-3.5 h-3.5" />}
          className="text-xs font-bold py-1 px-2.5"
        >
          Add
        </Button>
      </div>

      {/* Category Search Filter */}
      <div className="p-3 border-b border-stone-100 dark:border-stone-800/80 shrink-0">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Filter categories..."
            value={catSearch}
            onChange={(e) => setCatSearch(e.target.value)}
            className="w-full bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder-stone-400 text-xs pl-8 pr-3 py-1.5 rounded-xl border border-transparent focus:border-amber-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Categories List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {filteredCategories.map((catObj: any, i: number) => {
          const catName = typeof catObj === 'string' ? catObj : catObj.name;
          const isActiveCategory =
            typeof catObj === 'object' && catObj.status === 'Inactive' ? false : true;
          const items = (appData.menu || []).filter((m: any) => m.category === catName);
          const activeCount = items.filter(
            (m: any) => m.status === 'Active' || (m.status !== 'Inactive' && m.available !== false)
          ).length;
          const inactiveCount = items.length - activeCount;
          const isSelected = selectedCategory === catName;
          const subcats: string[] = Array.isArray(catObj?.subcategories) ? catObj.subcategories : [];

          return (
            <div
              key={i}
              onClick={() => {
                setSelectedCategory(catName);
                if (setSelectedSubcategory) setSelectedSubcategory(null);
              }}
              className={cn(
                'p-3.5 rounded-2xl border transition-all cursor-pointer select-none flex flex-col gap-2',
                isSelected
                  ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-500 ring-1 ring-amber-500 shadow-sm'
                  : 'bg-white dark:bg-stone-850 border-stone-200/80 dark:border-stone-750 hover:border-stone-300'
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-5 h-5 rounded-md bg-stone-100 dark:bg-stone-750 text-stone-500 text-[10px] font-bold flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <h4 className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100 truncate">
                    {catName}
                  </h4>
                  {!isActiveCategory && (
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                      Hidden
                    </span>
                  )}
                </div>

                <Tooltip content="Edit Category" position="left">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditCategory(catObj);
                    }}
                    className="p-1 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-750 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </Tooltip>
              </div>

              {/* Count Pills */}
              <div className="flex items-center gap-1.5 flex-wrap text-[10px] font-bold">
                <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50">
                  {activeCount} Active
                </span>
                {inactiveCount > 0 && (
                  <span className="px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-500">
                    {inactiveCount} Paused
                  </span>
                )}
                {subcats.length > 0 && (
                  <span className="px-2 py-0.5 rounded-md bg-amber-100/70 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50 flex items-center gap-1">
                    <Layers className="w-2.5 h-2.5" />
                    <span>{subcats.length} Subcats</span>
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
