import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AreaModal } from './AreaModal';
import { TableModal } from './TableModal';

export const FloorManagement: React.FC = () => {
  const { appData } = useApp();

  const [showAddAreaModal, setShowAddAreaModal] = useState(false);
  const [editingAreaId, setEditingAreaId] = useState<number | null>(null);
  const [newArea, setNewArea] = useState<{ name: string; description: string }>({
    name: '',
    description: '',
  });

  const [showAddTableConfigModal, setShowAddTableConfigModal] = useState(false);
  const [editingTableId, setEditingTableId] = useState<number | string | null>(null);
  const [newTableConfig, setNewTableConfig] = useState<any>({
    name: '',
    seats: 4,
    status: 'Available',
    areaId: '',
  });

  return (
    <div className="admin-content">
      <div className="admin-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3>Table Configuration</h3>
            <p style={{ color: 'var(--text-muted)', marginTop: 12 }}>Manage areas and tables.</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              className="btn-primary"
              onClick={() => {
                setEditingAreaId(null);
                setNewArea({ name: '', description: '' });
                setShowAddAreaModal(true);
              }}
            >
              + Add Area
            </button>
          </div>
        </div>

        {appData.areas?.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
            No areas configured. Create an area first.
          </div>
        ) : (
          appData.areas?.map((area: any) => (
            <div
              key={area.id}
              style={{
                marginTop: 24,
                padding: 16,
                border: '1px solid var(--border-color)',
                borderRadius: 8,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 16,
                }}
              >
                <h4 style={{ margin: 0 }}>{area.name}</h4>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    style={{
                      backgroundColor: '#eff6ff',
                      color: '#2563eb',
                      border: '1px solid #bfdbfe',
                      borderRadius: '6px',
                      padding: '6px 12px',
                      fontSize: '0.9rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      cursor: 'pointer',
                      fontWeight: 500,
                      transition: 'background-color 0.2s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#dbeafe')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#eff6ff')}
                    onClick={() => {
                      setEditingAreaId(area.id);
                      setNewArea({ name: area.name, description: area.description || '' });
                      setShowAddAreaModal(true);
                    }}
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                    </svg>
                    Edit Area
                  </button>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'stretch' }}>
                {appData.tables
                  ?.filter((t: any) => t.areaId === area.id)
                  .map((t: any) => (
                    <div
                      key={t.id}
                      style={{
                        width: 120,
                        padding: 12,
                        border: '2px solid var(--border-color)',
                        borderRadius: 8,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'border-color 0.2s',
                        position: 'relative',
                      }}
                      onClick={() => {
                        setEditingTableId(t.id);
                        setNewTableConfig({
                          name: t.name,
                          seats: t.seats,
                          status: t.status,
                          areaId: t.areaId,
                        });
                        setShowAddTableConfigModal(true);
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--accent-color)')}
                      onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-color)')}
                    >
                      <svg
                        width="32"
                        height="32"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ color: 'var(--text-muted)', marginBottom: 8 }}
                      >
                        <rect x="4" y="7" width="16" height="10" rx="2" />
                        <path d="M8 7V5c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2v2" />
                        <path d="M8 17v2c0 1.1.9 2 2 2h4c1.1 0 2-.9 2-2v-2" />
                        <path d="M4 10H2c-1.1 0-2 .9-2 2v2c0 1.1.9 2 2 2h2" />
                        <path d="M20 10h2c1.1 0 2 .9 2 2v2c0 1.1.9 2 2 2h-2" />
                      </svg>
                      <div style={{ fontWeight: 'bold' }}>{t.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t.seats} Seats</div>
                    </div>
                  ))}

                <div
                  style={{
                    width: 120,
                    padding: 12,
                    border: '2px dashed var(--border-color)',
                    borderRadius: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: 'var(--text-muted)',
                    transition: 'border-color 0.2s, color 0.2s',
                  }}
                  onClick={() => {
                    setEditingTableId(null);
                    setNewTableConfig({ name: '', seats: 4, status: 'Available', areaId: area.id });
                    setShowAddTableConfigModal(true);
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--accent-color)';
                    e.currentTarget.style.color = 'var(--accent-color)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-color)';
                    e.currentTarget.style.color = 'var(--text-muted)';
                  }}
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ marginBottom: 8 }}
                  >
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                  <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>Add Table</div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <AreaModal
        show={showAddAreaModal}
        onClose={() => setShowAddAreaModal(false)}
        editingAreaId={editingAreaId}
        newArea={newArea}
        setNewArea={setNewArea}
      />

      <TableModal
        show={showAddTableConfigModal}
        onClose={() => setShowAddTableConfigModal(false)}
        editingTableId={editingTableId}
        newTableConfig={newTableConfig}
        setNewTableConfig={setNewTableConfig}
      />
    </div>
  );
};
