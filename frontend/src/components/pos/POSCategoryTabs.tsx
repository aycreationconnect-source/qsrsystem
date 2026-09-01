import React from 'react';
import { useApp } from '../../context/AppContext';
import { usePOS } from '../../context/POSContext';

export const POSCategoryTabs: React.FC = () => {
  const { appData } = useApp();
  const { posCategory, setPosCategory } = usePOS();

  const categories = [
    'All Items',
    ...appData.categories.map((c: any) => (typeof c === 'string' ? c : c.name)),
  ];

  return (
    <div className="pos-categories-bar">
      {categories.map((cat: string, i: number) => (
        <div
          key={i}
          className={`pos-category ${posCategory === cat ? 'active' : ''}`}
          onClick={() => setPosCategory(cat)}
        >
          {cat}
        </div>
      ))}
    </div>
  );
};
