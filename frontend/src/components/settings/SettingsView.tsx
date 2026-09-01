import React from 'react';
import { useApp } from '../../context/AppContext';
import { settingsApi } from '../../api/settingsApi';

export const SettingsView: React.FC = () => {
  const { appData, setAppData, fetchBackendData } = useApp();

  const handleSaveSettings = async () => {
    try {
      await settingsApi.saveSettings({
        globalTaxName: appData.settings?.globalTaxName || '',
        globalTaxRate: appData.settings?.globalTaxRate || '0',
      });
      alert('Settings saved successfully!');
      fetchBackendData();
    } catch (err) {
      console.error(err);
      alert('Failed to save settings.');
    }
  };

  return (
    <div className="admin-content">
      <div className="admin-card">
        <h3 style={{ marginBottom: 24, fontSize: '1.25rem' }}>Global Settings</h3>

        <div
          style={{
            maxWidth: 500,
            padding: 24,
            border: '1px solid var(--border-color)',
            borderRadius: 12,
            backgroundColor: '#f8fafc',
          }}
        >
          <h4 style={{ marginBottom: 16, color: '#334155' }}>Global Tax Settings</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
            <div className="form-group">
              <label style={{ fontSize: '0.9rem', fontWeight: 600, color: '#475569' }}>Tax Name</label>
              <input
                type="text"
                placeholder="e.g. GST"
                value={appData.settings?.globalTaxName || ''}
                onChange={(e) =>
                  setAppData({
                    ...appData,
                    settings: { ...appData.settings, globalTaxName: e.target.value },
                  })
                }
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 8,
                  border: '1px solid #cbd5e1',
                }}
              />
            </div>
            <div className="form-group">
              <label style={{ fontSize: '0.9rem', fontWeight: 600, color: '#475569' }}>
                Tax Rate (%)
              </label>
              <input
                type="number"
                placeholder="e.g. 5"
                value={appData.settings?.globalTaxRate || ''}
                onChange={(e) =>
                  setAppData({
                    ...appData,
                    settings: { ...appData.settings, globalTaxRate: e.target.value },
                  })
                }
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 8,
                  border: '1px solid #cbd5e1',
                }}
              />
            </div>
          </div>
          <button
            className="btn btn-next"
            style={{ width: '100%', padding: 12, fontSize: '1rem', fontWeight: 600 }}
            onClick={handleSaveSettings}
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};
