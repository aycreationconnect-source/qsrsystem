import React, { useState } from 'react';
import { ShieldCheck, KeyRound, Store, Lock, Sparkles, CheckCircle2, User, Phone, ArrowRight } from 'lucide-react';
import { licenseApi, type ActivatePayload } from '../../api/licenseApi';

interface ActivateLicenseViewProps {
  onActivationSuccess: () => void;
}

export const ActivateLicenseView: React.FC<ActivateLicenseViewProps> = ({ onActivationSuccess }) => {
  const [cafeCode, setCafeCode] = useState('CF-MUM-001');
  const [licenseKey, setLicenseKey] = useState(
    'LIC-CFMUM001-90D-89B24C797D9EE8EF-eyJjYWZlQ29kZSI6IkNGLU1VTS0wMDEiLCJidXNpbmVzc05hbWUiOiJUaGUgVXJiYW4gQmlzdHJvIiwicGxhbkNvZGUiOiJUUklBTF8zTSIsImR1cmF0aW9uRGF5cyI6OTAsImlzc3VlZEF0IjoiMjAyNi0wOS0wMlQxMjoxNTo1OS42ODJaIiwiZXhwaXJlc0F0IjoiMjAyNi0xMi0wMVQxMjoxNTo1OS42ODJaIiwibWF4VGVybWluYWxzIjoxMCwibW9kdWxlcyI6WyJDT1VOVEVSX1BPUyIsIlRBQkxFX1BPUyIsIktEUyIsIklOVkVOVE9SWSIsIkdEUklWRV9CQUNLVVAiXX0',
  );
  const [ownerPin, setOwnerPin] = useState('1234');
  const [ownerPassword] = useState('admin123');
  const [ownerName, setOwnerName] = useState('Rajesh Sharma');
  const [phone, setPhone] = useState('9876543210');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!cafeCode.trim() || !licenseKey.trim() || !ownerPin.trim()) {
      setError('Please fill in Cafe Code, License Key, and Owner PIN.');
      return;
    }

    try {
      setIsLoading(true);
      const payload: ActivatePayload = {
        cafeCode: cafeCode.trim().toUpperCase(),
        licenseKey: licenseKey.trim(),
        ownerPin: ownerPin.trim(),
        ownerPassword: ownerPassword.trim(),
        ownerName: ownerName.trim(),
        phone: phone.trim(),
      };

      const res = await licenseApi.activateStore(payload);
      setSuccessMsg(`Store "${res.store.businessName}" (${res.store.cafeCode}) activated successfully!`);
      setTimeout(() => {
        onActivationSuccess();
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Offline verification failed. Please check license key.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        backgroundColor: '#f8fafc',
        backgroundImage:
          'radial-gradient(at 0% 0%, rgba(59, 130, 246, 0.08) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(99, 102, 241, 0.08) 0px, transparent 50%)',
        boxSizing: 'border-box',
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '560px',
          backgroundColor: '#ffffff',
          borderRadius: '28px',
          padding: '40px 36px',
          boxShadow: '0 20px 50px -12px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.05)',
          position: 'relative',
          overflow: 'hidden',
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
          }}
        />

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '18px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #4f46e5 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.4)',
            }}
          >
            <ShieldCheck size={32} strokeWidth={2.2} />
          </div>
          <h1
            style={{
              fontSize: '1.65rem',
              fontWeight: 800,
              color: '#0f172a',
              margin: '0 0 8px',
              letterSpacing: '-0.02em',
            }}
          >
            Activate Cafe POS
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.88rem', margin: 0 }}>
            Enter your Cafe Code and License Key to activate your 3-Month Trial offline.
          </p>
        </div>

        {/* Status Alerts */}
        {error && (
          <div
            style={{
              padding: '12px 16px',
              borderRadius: '14px',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#dc2626',
              fontSize: '0.85rem',
              fontWeight: 600,
              marginBottom: '20px',
            }}
          >
            ⚠️ {error}
          </div>
        )}

        {successMsg && (
          <div
            style={{
              padding: '12px 16px',
              borderRadius: '14px',
              backgroundColor: '#ecfdf5',
              border: '1px solid #a7f3d0',
              color: '#065f46',
              fontSize: '0.85rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '20px',
            }}
          >
            <CheckCircle2 size={18} color="#059669" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Row 1: Cafe Code & PIN */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Cafe Code <span style={{ color: '#2563eb' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <Store size={18} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '15px' }} />
                <input
                  type="text"
                  required
                  placeholder="e.g. CF-MUM-001"
                  value={cafeCode}
                  onChange={(e) => setCafeCode(e.target.value.toUpperCase())}
                  style={{
                    width: '100%',
                    height: '48px',
                    padding: '0 16px 0 44px',
                    borderRadius: '12px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#f8fafc',
                    color: '#2563eb',
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    boxSizing: 'border-box',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Master Owner PIN <span style={{ color: '#2563eb' }}>* (4 Digits)</span>
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '15px' }} />
                <input
                  type="password"
                  required
                  maxLength={6}
                  placeholder="e.g. 1234"
                  value={ownerPin}
                  onChange={(e) => setOwnerPin(e.target.value)}
                  style={{
                    width: '100%',
                    height: '48px',
                    padding: '0 16px 0 44px',
                    borderRadius: '12px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#f8fafc',
                    color: '#0f172a',
                    fontFamily: 'monospace',
                    letterSpacing: '3px',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    boxSizing: 'border-box',
                    outline: 'none',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Row 2: Master License Key */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>
                Master License Key <span style={{ color: '#2563eb' }}>*</span>
              </label>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>From WhatsApp Card</span>
            </div>
            <div style={{ position: 'relative' }}>
              <KeyRound size={18} color="#2563eb" style={{ position: 'absolute', left: '14px', top: '14px' }} />
              <textarea
                rows={3}
                required
                placeholder="Paste complete LIC-... key token"
                value={licenseKey}
                onChange={(e) => setLicenseKey(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 14px 12px 44px',
                  borderRadius: '12px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#f8fafc',
                  color: '#334155',
                  fontFamily: 'monospace',
                  fontSize: '0.82rem',
                  lineHeight: '1.4',
                  boxSizing: 'border-box',
                  outline: 'none',
                  resize: 'none',
                  wordBreak: 'break-all',
                }}
              />
            </div>
          </div>

          {/* Row 3: Owner Details */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Owner Name
              </label>
              <div style={{ position: 'relative' }}>
                <User size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '14px' }} />
                <input
                  type="text"
                  placeholder="Rajesh Sharma"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  style={{
                    width: '100%',
                    height: '44px',
                    padding: '0 12px 0 38px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#f8fafc',
                    color: '#0f172a',
                    fontSize: '0.88rem',
                    boxSizing: 'border-box',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Owner Phone
              </label>
              <div style={{ position: 'relative' }}>
                <Phone size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '14px' }} />
                <input
                  type="tel"
                  placeholder="9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={{
                    width: '100%',
                    height: '44px',
                    padding: '0 12px 0 38px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#f8fafc',
                    color: '#0f172a',
                    fontSize: '0.88rem',
                    boxSizing: 'border-box',
                    outline: 'none',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              height: '52px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              color: '#ffffff',
              fontSize: '1rem',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              marginTop: '6px',
            }}
          >
            <Sparkles size={18} />
            <span>{isLoading ? 'Verifying HMAC Signature...' : 'Verify & Activate POS Offline'}</span>
            <ArrowRight size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};
