import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UtensilsCrossed, KeyRound, User, Lock, Delete, Sparkles, AlertCircle, Wifi } from 'lucide-react';

export const LoginView: React.FC = () => {
  const { storeProfile, licenseStatus, handlePinLogin, handlePasswordLogin, setView } = useApp();

  const [loginMode, setLoginMode] = useState<'PIN' | 'PASSWORD'>('PIN');
  const [pin, setPin] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleNumpadPress = (digit: string) => {
    if (pin.length < 6) {
      const nextPin = pin + digit;
      setPin(nextPin);
      if (nextPin.length === 4) {
        submitPin(nextPin);
      }
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setPin('');
  };

  const submitPin = async (pinToSubmit: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await handlePinLogin(pinToSubmit);
    } catch (err: any) {
      setError(err.message || 'Invalid staff PIN');
      setPin('');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;
    try {
      setIsLoading(true);
      setError(null);
      await handlePasswordLogin(username, password);
    } catch (err: any) {
      setError(err.message || 'Invalid username or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        backgroundColor: '#f8fafc',
        backgroundImage:
          'radial-gradient(at 0% 0%, rgba(59, 130, 246, 0.08) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(99, 102, 241, 0.08) 0px, transparent 50%)',
        boxSizing: 'border-box',
        overflowX: 'hidden',
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '860px',
          backgroundColor: '#ffffff',
          borderRadius: '28px',
          boxShadow: '0 20px 50px -12px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.05)',
          position: 'relative',
          overflow: 'hidden',
          display: 'grid',
          gridTemplateColumns: '1fr 1.15fr',
          boxSizing: 'border-box',
        }}
      >
        {/* Top Accent Line */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '5px',
            background: 'linear-gradient(90deg, #3b82f6, #6366f1, #f59e0b)',
            zIndex: 10,
          }}
        />

        {/* ==================================================== */}
        {/* LEFT COLUMN: Cafe Branding & Store Identity Panel    */}
        {/* ==================================================== */}
        <div
          style={{
            padding: '38px 32px',
            backgroundColor: '#fafcff',
            borderRight: '1px solid #e2e8f0',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxSizing: 'border-box',
          }}
        >
          {/* Top Brand Section */}
          <div>
            {/* Logo / Icon Container (Ready for custom cafe logo) */}
            <div
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '20px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #4f46e5 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px',
                boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.35)',
              }}
            >
              <UtensilsCrossed size={36} strokeWidth={2.2} />
            </div>

            {/* Cafe Title */}
            <h1
              style={{
                fontSize: '1.75rem',
                fontWeight: 800,
                color: '#0f172a',
                margin: '0 0 8px',
                letterSpacing: '-0.02em',
                lineHeight: '1.2',
              }}
            >
              {storeProfile?.businessName || 'The Urban Bistro'}
            </h1>

            {/* Cafe Subtitle */}
            <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0 0 20px', fontWeight: 500 }}>
              Point of Sale & Kitchen Management Suite
            </p>

            {/* Badges Stack */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-start' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontFamily: 'monospace',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  color: '#2563eb',
                  backgroundColor: '#eff6ff',
                  padding: '5px 14px',
                  borderRadius: '999px',
                  border: '1px solid #bfdbfe',
                }}
              >
                <span>STORE ID:</span>
                <span>{storeProfile?.cafeCode || 'CF-MUM-001'}</span>
              </div>

              {licenseStatus && (
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    color: '#059669',
                    backgroundColor: '#ecfdf5',
                    padding: '5px 14px',
                    borderRadius: '999px',
                    border: '1px solid #a7f3d0',
                  }}
                >
                  <span
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: '#10b981',
                      display: 'inline-block',
                    }}
                  />
                  <span>{licenseStatus.daysRemaining} days trial remaining</span>
                </div>
              )}
            </div>
          </div>

          {/* Bottom System Status Section */}
          <div
            style={{
              paddingTop: '20px',
              borderTop: '1px solid #e2e8f0',
              marginTop: '28px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.78rem',
                color: '#64748b',
                fontWeight: 500,
              }}
            >
              <Wifi size={14} color="#10b981" />
              <span>100% Offline Local Network Hub</span>
            </div>

            <button
              type="button"
              onClick={() => setView('register')}
              style={{
                color: '#2563eb',
                fontSize: '0.8rem',
                fontWeight: 600,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: 0,
                textAlign: 'left',
              }}
            >
              <KeyRound size={13} />
              <span>Manage / Renew License</span>
            </button>
          </div>
        </div>

        {/* ==================================================== */}
        {/* RIGHT COLUMN: Interactive Login & Numpad Panel       */}
        {/* ==================================================== */}
        <div
          style={{
            padding: '38px 32px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            boxSizing: 'border-box',
          }}
        >
          {/* Mode Switcher Tabs */}
          <div
            style={{
              display: 'flex',
              backgroundColor: '#f1f5f9',
              padding: '4px',
              borderRadius: '14px',
              marginBottom: '20px',
              border: '1px solid #e2e8f0',
            }}
          >
            <button
              type="button"
              onClick={() => {
                setLoginMode('PIN');
                setError(null);
              }}
              style={{
                flex: 1,
                padding: '9px 0',
                fontSize: '0.82rem',
                fontWeight: 700,
                borderRadius: '11px',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s',
                backgroundColor: loginMode === 'PIN' ? '#ffffff' : 'transparent',
                color: loginMode === 'PIN' ? '#2563eb' : '#64748b',
                boxShadow: loginMode === 'PIN' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
              }}
            >
              Quick PIN Login
            </button>
            <button
              type="button"
              onClick={() => {
                setLoginMode('PASSWORD');
                setError(null);
              }}
              style={{
                flex: 1,
                padding: '9px 0',
                fontSize: '0.82rem',
                fontWeight: 700,
                borderRadius: '11px',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s',
                backgroundColor: loginMode === 'PASSWORD' ? '#ffffff' : 'transparent',
                color: loginMode === 'PASSWORD' ? '#2563eb' : '#64748b',
                boxShadow: loginMode === 'PASSWORD' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
              }}
            >
              Owner Password
            </button>
          </div>

          {/* Error Alert */}
          {error && (
            <div
              style={{
                padding: '10px 14px',
                borderRadius: '12px',
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#dc2626',
                fontSize: '0.8rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '16px',
              }}
            >
              <AlertCircle size={15} />
              <span>{error}</span>
            </div>
          )}

          {/* PIN Mode View */}
          {loginMode === 'PIN' && (
            <div>
              {/* PIN Indicator Bubbles */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '12px',
                  backgroundColor: '#f8fafc',
                  borderRadius: '14px',
                  border: '1px solid #e2e8f0',
                  marginBottom: '14px',
                }}
              >
                {[0, 1, 2, 3].map((idx) => (
                  <div
                    key={idx}
                    style={{
                      width: '14px',
                      height: '14px',
                      borderRadius: '50%',
                      border: '2px solid',
                      borderColor: pin.length > idx ? '#2563eb' : '#cbd5e1',
                      backgroundColor: pin.length > idx ? '#2563eb' : '#ffffff',
                      transform: pin.length > idx ? 'scale(1.2)' : 'scale(1)',
                      boxShadow: pin.length > idx ? '0 0 8px rgba(37, 99, 235, 0.4)' : 'none',
                      transition: 'all 0.15s ease',
                    }}
                  />
                ))}
              </div>

              {/* Quick Staff Demo Chips */}
              {/* <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '6px',
                  marginBottom: '16px',
                  flexWrap: 'wrap',
                }}
              >
                <button
                  type="button"
                  onClick={() => submitPin('1234')}
                  style={{
                    padding: '5px 10px',
                    borderRadius: '8px',
                    backgroundColor: '#fffbeb',
                    border: '1px solid #fef3c7',
                    color: '#92400e',
                    fontSize: '0.74rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  👑 Owner (1234)
                </button>
                <button
                  type="button"
                  onClick={() => submitPin('1111')}
                  style={{
                    padding: '5px 10px',
                    borderRadius: '8px',
                    backgroundColor: '#eff6ff',
                    border: '1px solid #dbeafe',
                    color: '#1e40af',
                    fontSize: '0.74rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  💳 Cashier (1111)
                </button>
                <button
                  type="button"
                  onClick={() => submitPin('2222')}
                  style={{
                    padding: '5px 10px',
                    borderRadius: '8px',
                    backgroundColor: '#ecfdf5',
                    border: '1px solid #d1fae5',
                    color: '#065f46',
                    fontSize: '0.74rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  📱 Waiter (2222)
                </button>
              </div> */}

              {/* 3x4 Tactile Keypad */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '10px',
                }}
              >
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                  <button
                    key={digit}
                    type="button"
                    onClick={() => handleNumpadPress(digit)}
                    style={{
                      height: '48px',
                      borderRadius: '14px',
                      backgroundColor: '#ffffff',
                      border: '1px solid #e2e8f0',
                      color: '#0f172a',
                      fontSize: '1.25rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.1s',
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = '#f1f5f9';
                      e.currentTarget.style.borderColor = '#cbd5e1';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = '#ffffff';
                      e.currentTarget.style.borderColor = '#e2e8f0';
                    }}
                  >
                    {digit}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={handleClear}
                  style={{
                    height: '48px',
                    borderRadius: '14px',
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    color: '#64748b',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  CLEAR
                </button>
                <button
                  type="button"
                  onClick={() => handleNumpadPress('0')}
                  style={{
                    height: '48px',
                    borderRadius: '14px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    color: '#0f172a',
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  0
                </button>
                <button
                  type="button"
                  onClick={handleBackspace}
                  style={{
                    height: '48px',
                    borderRadius: '14px',
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    color: '#ef4444',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Delete size={20} />
                </button>
              </div>
            </div>
          )}

          {/* Password Mode View */}
          {loginMode === 'PASSWORD' && (
            <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>
                  Admin Username
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={16} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '15px' }} />
                  <input
                    type="text"
                    required
                    placeholder="e.g. owner"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    style={{
                      width: '100%',
                      height: '46px',
                      padding: '0 16px 0 42px',
                      borderRadius: '12px',
                      border: '1px solid #cbd5e1',
                      backgroundColor: '#f8fafc',
                      color: '#0f172a',
                      fontSize: '0.9rem',
                      boxSizing: 'border-box',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>
                  Master Password
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '15px' }} />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{
                      width: '100%',
                      height: '46px',
                      padding: '0 16px 0 42px',
                      borderRadius: '12px',
                      border: '1px solid #cbd5e1',
                      backgroundColor: '#f8fafc',
                      color: '#0f172a',
                      fontSize: '0.9rem',
                      boxSizing: 'border-box',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                style={{
                  width: '100%',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                  color: '#ffffff',
                  fontSize: '0.92rem',
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  marginTop: '4px',
                }}
              >
                <Sparkles size={16} />
                <span>{isLoading ? 'Verifying...' : 'Sign In to Dashboard'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
