import React from 'react';
import { useApp } from '../../context/AppContext';

interface CategorySidebarProps {
  selectedCategory: string | null;
  setSelectedCategory: (cat: string | null) => void;
  onAddCategory: () => void;
  onEditCategory: (catObj: any) => void;
}

export const CategorySidebar: React.FC<CategorySidebarProps> = ({
  selectedCategory,
  setSelectedCategory,
  onAddCategory,
  onEditCategory,
}) => {
  const { appData } = useApp();

  return (
    <div className="category-sidebar">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ fontSize: '1.25rem', color: '#1e293b', fontWeight: 600 }}>Categories</h3>
        <button
          className="btn btn-next"
          style={{
            padding: '6px 16px',
            fontSize: '0.85rem',
            borderRadius: 20,
            backgroundColor: '#3b82f6',
            color: '#fff',
            border: 'none',
            fontWeight: 500,
          }}
          onClick={onAddCategory}
        >
          + Add
        </button>
      </div>

      <div className="category-list-container">
        {appData.categories.map((catObj: any, i: number) => {
          const catName = typeof catObj === 'string' ? catObj : catObj.name;
          const isActiveCategory = typeof catObj === 'object' && catObj.status === 'Inactive' ? false : true;
          const items = appData.menu.filter((m: any) => m.category === catName);
          const activeCount = items.filter((m: any) => m.available !== false && m.status === 'Active').length;
          const inactiveCount = items.length - activeCount;
          const isActiveCat = selectedCategory === catName;

          return (
            <div
              key={i}
              className={`category-card ${isActiveCat ? 'active-cat' : ''}`}
              onClick={() => setSelectedCategory(catName)}
            >
              <div className="category-card-header">
                <h4>
                  {i + 1}. {catName}{' '}
                  {!isActiveCategory && (
                    <span
                      style={{
                        fontSize: '0.6rem',
                        color: '#ef4444',
                        border: '1px solid #ef4444',
                        padding: '2px 6px',
                        borderRadius: 10,
                        marginLeft: 8,
                        verticalAlign: 'middle',
                      }}
                    >
                      Inactive
                    </span>
                  )}
                </h4>
                <button
                  className="edit-cat-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditCategory(catObj);
                  }}
                >
                  Edit
                </button>
              </div>
              <div className="category-stats">
                <div className="cat-stat active-stat">
                  <span className="cat-stat-value">{activeCount}</span>
                  <span className="cat-stat-label">ACTIVE</span>
                </div>
                <div className="cat-stat deactive-stat">
                  <span className="cat-stat-value">{inactiveCount}</span>
                  <span className="cat-stat-label">DEACTIVE</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
