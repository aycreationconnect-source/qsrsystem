import React from 'react';
import { useApp } from '../../context/AppContext';

export const RegisterView: React.FC = () => {
  const { registerData, setRegisterData, handleRegister, setView } = useApp();

  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRegisterData({ ...registerData, [e.target.name]: e.target.value });
  };

  return (
    <div className="auth-container" style={{ width: '600px' }}>
      <div className="auth-header">
        <h2>New Client Registration</h2>
        <p>Configure your local database & admin credentials</p>
      </div>

      <form onSubmit={handleRegister}>
        <div className="section-title">1. Local Database Configuration (MySQL)</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="form-group">
            <label>Host</label>
            <input
              type="text"
              name="dbHost"
              value={registerData.dbHost}
              onChange={handleRegisterChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Port</label>
            <input
              type="text"
              name="dbPort"
              value={registerData.dbPort}
              onChange={handleRegisterChange}
              required
            />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="form-group">
            <label>Database User</label>
            <input
              type="text"
              name="dbUser"
              value={registerData.dbUser}
              onChange={handleRegisterChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Database Password</label>
            <input
              type="password"
              name="dbPassword"
              value={registerData.dbPassword}
              onChange={handleRegisterChange}
            />
          </div>
        </div>
        <div className="form-group">
          <label>Database Name</label>
          <input
            type="text"
            name="dbName"
            value={registerData.dbName}
            onChange={handleRegisterChange}
            required
          />
        </div>

        <div className="section-title">2. Admin Credentials</div>
        <div className="form-group">
          <label>Restaurant Name</label>
          <input
            type="text"
            name="restaurantName"
            placeholder="e.g. Tasty Bites"
            value={registerData.restaurantName}
            onChange={handleRegisterChange}
            required
          />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="form-group">
            <label>Admin ID / Username</label>
            <input
              type="text"
              name="adminId"
              value={registerData.adminId}
              onChange={handleRegisterChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Admin Password</label>
            <input
              type="password"
              name="adminPassword"
              value={registerData.adminPassword}
              onChange={handleRegisterChange}
              required
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
          <button
            type="submit"
            className="btn btn-next"
            style={{ flex: 1, padding: '16px', fontSize: '1.05rem', borderRadius: 8 }}
          >
            Initialize Setup & Register
          </button>
          <a
            href="/database_schema.sql"
            download="database_schema.sql"
            className="btn-outline"
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textDecoration: 'none',
              padding: '16px',
              borderRadius: 8,
              fontSize: '1.05rem',
            }}
          >
            ⬇️ Download SQL Schema
          </a>
        </div>
      </form>

      <span className="auth-link" onClick={() => setView('login')}>
        ← Back to Login
      </span>
    </div>
  );
};
