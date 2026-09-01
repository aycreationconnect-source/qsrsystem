import React from 'react';
import { useApp } from '../../context/AppContext';

export const LoginView: React.FC = () => {
  const { loginData, setLoginData, handleLogin, setView } = useApp();

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  return (
    <div
      className="auth-container"
      style={{
        padding: '48px 40px',
        background: '#ffffff',
        borderRadius: 24,
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0,0,0,0.05)',
        border: 'none',
      }}
    >
      <div className="auth-header" style={{ textAlign: 'center', marginBottom: 40 }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 64,
            height: 64,
            borderRadius: 16,
            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            color: 'white',
            fontSize: '1.8rem',
            fontWeight: 800,
            marginBottom: 24,
            boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.5)',
          }}
        >
          QSR
        </div>
        <h2
          style={{
            fontSize: '2rem',
            fontWeight: 800,
            color: '#0f172a',
            marginBottom: 8,
            letterSpacing: '-0.03em',
          }}
        >
          Admin Portal
        </h2>
        <p style={{ color: '#64748b', fontSize: '1.05rem', margin: 0 }}>
          Enter your credentials to manage your restaurant
        </p>
      </div>

      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div className="form-group" style={{ margin: 0 }}>
          <label
            style={{
              display: 'block',
              fontSize: '0.95rem',
              fontWeight: 600,
              color: '#1e293b',
              marginBottom: 8,
            }}
          >
            Admin ID / Username
          </label>
          <input
            type="text"
            name="adminId"
            placeholder="admin@restaurant.com"
            value={loginData.adminId}
            onChange={handleLoginChange}
            required
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: 12,
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              color: '#0f172a',
              fontSize: '1.05rem',
              transition: 'all 0.2s',
              outline: 'none',
              boxSizing: 'border-box',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#3b82f6';
              e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e2e8f0';
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>
        <div className="form-group" style={{ margin: 0 }}>
          <label
            style={{
              display: 'block',
              fontSize: '0.95rem',
              fontWeight: 600,
              color: '#1e293b',
              marginBottom: 8,
            }}
          >
            Password
          </label>
          <input
            type="password"
            name="password"
            placeholder="••••••••"
            value={loginData.password}
            onChange={handleLoginChange}
            required
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: 12,
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              color: '#0f172a',
              fontSize: '1.05rem',
              transition: 'all 0.2s',
              outline: 'none',
              boxSizing: 'border-box',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#3b82f6';
              e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e2e8f0';
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>

        <button
          type="submit"
          className="btn btn-next"
          style={{
            width: '100%',
            padding: '18px',
            fontSize: '1.1rem',
            fontWeight: 700,
            marginTop: 12,
            borderRadius: 12,
            background: '#3b82f6',
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(59, 130, 246, 0.4)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
          }}
        >
          Sign In
        </button>
      </form>

      <div style={{ textAlign: 'center', marginTop: 40, paddingTop: 24, borderTop: '1px solid #f1f5f9' }}>
        <p style={{ color: '#64748b', fontSize: '0.95rem', margin: 0 }}>
          New Restaurant Client?
          <span
            onClick={() => setView('register')}
            style={{
              color: '#3b82f6',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'block',
              marginTop: 8,
              transition: 'color 0.2s',
            }}
            onMouseOver={(e) => (e.currentTarget.style.color = '#1d4ed8')}
            onMouseOut={(e) => (e.currentTarget.style.color = '#3b82f6')}
          >
            Register & Setup Database &rarr;
          </span>
        </p>
      </div>
    </div>
  );
};
