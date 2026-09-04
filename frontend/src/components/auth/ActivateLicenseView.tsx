import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Input, Tooltip } from '../ui';
import {
  ShieldCheck,
  KeyRound,
  Lock,
  CheckCircle2,
  User,
  Phone,
  ArrowRight,
  ClipboardPaste,
  Building,
} from 'lucide-react';
import { licenseApi, type ActivatePayload } from '../../api/licenseApi';

interface ActivateLicenseViewProps {
  onActivationSuccess: () => void;
}

export const ActivateLicenseView: React.FC<ActivateLicenseViewProps> = ({
  onActivationSuccess,
}) => {
  const [cafeCode, setCafeCode] = useState('CF-MUM-001');
  const [licenseKey, setLicenseKey] = useState(
    'LIC-CFMUM001-90D-89B24C797D9EE8EF-eyJjYWZlQ29kZSI6IkNGLU1VTS0wMDEiLCJidXNpbmVzc05hbWUiOiJUaGUgVXJiYW4gQmlzdHJvIiwicGxhbkNvZGUiOiJUUklBTF8zTSIsImR1cmF0aW9uRGF5cyI6OTAsImlzc3VlZEF0IjoiMjAyNi0wOS0wMlQxMjoxNTo1OS42ODJaIiwiZXhwaXJlc0F0IjoiMjAyNi0xMi0wMVQxMjoxNTo1OS42ODJaIiwibWF4VGVybWluYWxzIjoxMCwibW9kdWxlcyI6WyJDT1VOVEVSX1BPUyIsIlRBQkxFX1BPUyIsIktEUyIsIklOVkVOVE9SWSIsIkdEUklWRV9CQUNLVVAiXX0'
  );
  const [ownerPin, setOwnerPin] = useState('1234');
  const [ownerPassword, setOwnerPassword] = useState('admin123');
  const [ownerName, setOwnerName] = useState('Rajesh Sharma');
  const [phone, setPhone] = useState('9876543210');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handlePasteKey = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setLicenseKey(text.trim());
        // Try to parse cafeCode from LIC-XXXX-
        const parts = text.trim().split('-');
        if (parts.length >= 2 && parts[0] === 'LIC') {
          // If token contains clean code, don't overwrite if not sure, or prompt user
        }
      }
    } catch {
      // clipboard read failed
    }
  };

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
      setSuccessMsg(
        `Store "${res.store.businessName}" (${res.store.cafeCode}) activated successfully!`
      );
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
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-[#faf8f5] dark:bg-[#0c0f17] text-stone-900 dark:text-stone-100 transition-colors">
      <div className="w-full max-w-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-3xl shadow-2xl overflow-hidden relative">
        {/* Top Accent Bar */}
        <div className="h-1.5 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600" />

        <div className="p-6 sm:p-8">
          {/* Vidhara Official Brand Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-100 dark:border-stone-800">
            <div className="flex items-center gap-3">
              <img
                src="/velora-logo.png"
                alt="Velora POS"
                className="h-9 w-auto object-contain dark:hidden"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <img
                src="/velora-logo-dark.png"
                alt="Velora POS"
                className="h-9 w-auto object-contain hidden dark:block"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div>
                <h1 className="text-base font-extrabold text-stone-900 dark:text-stone-100 leading-tight flex items-center gap-1.5">
                  <span>VELORA POS ACTIVATION</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold">
                    OFFLINE
                  </span>
                </h1>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                  Enter your Golden DB license credentials to initialize this terminal
                </p>
              </div>
            </div>

            <Tooltip content="Zero Internet Required for Daily Billing" position="left">
              <span className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
                <ShieldCheck className="w-3.5 h-3.5" />
                Air-Gapped Node
              </span>
            </Tooltip>
          </div>

          {/* Error & Success Messages */}
          {error && (
            <div className="mt-4 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="mt-4 p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Activation Form */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {/* Step 1: License & Cafe Code */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-1">
                <Input
                  label="Cafe Code"
                  value={cafeCode}
                  onChange={(e) => setCafeCode(e.target.value.toUpperCase())}
                  placeholder="CF-MUM-001"
                  leftIcon={<Building className="w-4 h-4" />}
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
                      Master License Key
                    </label>
                    <button
                      type="button"
                      onClick={handlePasteKey}
                      className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
                    >
                      <ClipboardPaste className="w-3 h-3" />
                      Paste Token
                    </button>
                  </div>
                  <Input
                    value={licenseKey}
                    onChange={(e) => setLicenseKey(e.target.value)}
                    placeholder="LIC-CF001-90D-..."
                    leftIcon={<KeyRound className="w-4 h-4" />}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Store Owner Identity */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <Input
                label="Store Owner Full Name"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                placeholder="e.g. Rajesh Sharma"
                leftIcon={<User className="w-4 h-4" />}
                required
              />
              <Input
                label="Owner Contact Phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="9876543210"
                leftIcon={<Phone className="w-4 h-4" />}
                required
              />
            </div>

            {/* Step 3: Security Credentials */}
            <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40">
              <div className="text-xs font-bold text-amber-950 dark:text-amber-300 mb-3 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" />
                <span>Create Master Owner Credentials</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Master Owner PIN (4 Digits)"
                  value={ownerPin}
                  onChange={(e) => setOwnerPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="1234"
                  maxLength={6}
                  required
                />
                <Input
                  label="Owner Password (Admin Settings)"
                  type="password"
                  value={ownerPassword}
                  onChange={(e) => setOwnerPassword(e.target.value)}
                  placeholder="adminpassword"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="touch"
              className="w-full mt-4"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Verify Cryptographic Key & Activate POS
            </Button>

            <div className="mt-4 text-center">
              <Link
                to="/login"
                className="text-xs font-bold text-stone-500 hover:text-amber-600 dark:text-stone-400 dark:hover:text-amber-400 transition-colors"
              >
                Already activated? Go to Staff Login →
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
