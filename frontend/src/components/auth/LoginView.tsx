import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Button, Input, CafeBrandBadge, Tooltip } from '../ui';
import {
  KeyRound,
  User,
  Lock,
  Delete,
  ShieldCheck,
  AlertCircle,
  Clock,
  ArrowRight,
} from 'lucide-react';

export const LoginView: React.FC = () => {
  const { storeProfile, licenseStatus, handlePinLogin, handlePasswordLogin } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';

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
      navigate(redirect);
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
      navigate(redirect);
    } catch (err: any) {
      setError(err.message || 'Invalid username or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-[#faf8f5] dark:bg-[#0c0f17] text-stone-900 dark:text-stone-100 transition-colors">
      <div className="w-full max-w-4xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-12 relative">
        {/* Top Accent Gradient Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 z-10" />

        {/* ==================================================== */}
        {/* LEFT COLUMN: Cafe Branding & System Status Panel     */}
        {/* ==================================================== */}
        <div className="md:col-span-5 p-6 sm:p-8 bg-stone-50/70 dark:bg-stone-950/40 border-b md:border-b-0 md:border-r border-stone-200/80 dark:border-stone-800 flex flex-col justify-between">
          <div>
            {/* Vidhara Brand Header */}
            <div className="flex items-center justify-between pb-6 border-b border-stone-200/60 dark:border-stone-800">
              <div className="flex items-center gap-2">
                <img
                  src="/velora-logo.png"
                  alt="Velora POS"
                  className="h-7 w-auto object-contain dark:hidden"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <img
                  src="/velora-logo-dark.png"
                  alt="Velora POS"
                  className="h-7 w-auto object-contain hidden dark:block"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <span className="font-extrabold text-sm tracking-tight text-stone-900 dark:text-stone-100">
                  VELORA <span className="text-amber-500 font-medium text-xs">POS</span>
                </span>
              </div>

              <Tooltip content="Local High-Speed Hub (Zero Cloud Lag)" position="bottom">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
                  <ShieldCheck className="w-3 h-3" />
                  Offline Hub
                </span>
              </Tooltip>
            </div>

            {/* Cafe Brand Badge Card */}
            <div className="mt-6 p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-sm">
              <div className="text-[10px] uppercase tracking-wider font-bold text-stone-400 dark:text-stone-500 mb-2.5">
                Active Store Terminal
              </div>
              <CafeBrandBadge
                name={storeProfile?.businessName || 'The Urban Bistro'}
                cafeCode={storeProfile?.cafeCode || 'CF-MUM-001'}
                logoUrl={storeProfile?.logoUrl}
                size="md"
              />
            </div>

            {/* License Countdown Card */}
            {licenseStatus && (
              <div className="mt-4 p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span className="text-xs font-semibold text-amber-900 dark:text-amber-200">
                    License Validity
                  </span>
                </div>
                <span className="text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/50 px-2 py-0.5 rounded-lg border border-amber-300 dark:border-amber-800/60">
                  🟢 {licenseStatus.daysRemaining} Days Left
                </span>
              </div>
            )}
          </div>

          {/* Quick Switch / Setup Footer Note */}
          <div className="mt-6 pt-4 border-t border-stone-200/60 dark:border-stone-800 flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
            <span>First time setup?</span>
            <Link
              to="/activate"
              className="font-bold text-amber-600 dark:text-amber-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <span>Activate Store</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* ==================================================== */}
        {/* RIGHT COLUMN: Interactive Login Panel (PIN / Pass)   */}
        {/* ==================================================== */}
        <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-center">
          {/* Mode Switcher Tabs */}
          <div className="flex items-center justify-center p-1 bg-stone-100 dark:bg-stone-800 rounded-2xl max-w-xs mx-auto mb-6">
            <button
              type="button"
              onClick={() => {
                setLoginMode('PIN');
                setError(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                loginMode === 'PIN'
                  ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-sm'
                  : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Staff PIN</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setLoginMode('PASSWORD');
                setError(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                loginMode === 'PASSWORD'
                  ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-sm'
                  : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Owner Password</span>
            </button>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Mode 1: 4-Digit Staff PIN Numpad */}
          {loginMode === 'PIN' ? (
            <div className="flex flex-col items-center">
              <p className="text-xs text-stone-500 dark:text-stone-400 mb-4 font-medium">
                Enter your 4-digit staff PIN for instant shift access
              </p>

              {/* PIN Dots Display */}
              <div className="flex items-center justify-center gap-3 mb-6">
                {[0, 1, 2, 3].map((idx) => {
                  const isFilled = pin.length > idx;
                  return (
                    <div
                      key={idx}
                      className={`w-4 h-4 rounded-full transition-all duration-200 ${
                        isFilled
                          ? 'bg-amber-500 scale-110 shadow-sm shadow-amber-500/50'
                          : 'border-2 border-stone-300 dark:border-stone-700 bg-transparent'
                      }`}
                    />
                  );
                })}
              </div>

              {/* 4x3 Touch Keypad */}
              <div className="grid grid-cols-3 gap-2.5 w-full max-w-[280px]">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                  <button
                    key={digit}
                    type="button"
                    disabled={isLoading}
                    onClick={() => handleNumpadPress(digit)}
                    className="pos-keypad-btn h-14 text-xl font-bold bg-stone-50 dark:bg-stone-800/80 text-stone-900 dark:text-stone-100 border border-stone-200/80 dark:border-stone-700/80 hover:bg-stone-100 dark:hover:bg-stone-750 active:bg-amber-500 active:text-stone-950 active:scale-95"
                  >
                    {digit}
                  </button>
                ))}

                <button
                  type="button"
                  disabled={isLoading}
                  onClick={handleClear}
                  className="pos-keypad-btn h-14 text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 hover:text-stone-900 bg-stone-100 dark:bg-stone-850 border border-stone-200 dark:border-stone-700"
                >
                  Clear
                </button>

                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleNumpadPress('0')}
                  className="pos-keypad-btn h-14 text-xl font-bold bg-stone-50 dark:bg-stone-800/80 text-stone-900 dark:text-stone-100 border border-stone-200/80 dark:border-stone-700/80 hover:bg-stone-100 active:bg-amber-500 active:text-stone-950"
                >
                  0
                </button>

                <button
                  type="button"
                  disabled={isLoading}
                  onClick={handleBackspace}
                  className="pos-keypad-btn h-14 text-stone-600 dark:text-stone-400 bg-stone-100 dark:bg-stone-850 border border-stone-200 dark:border-stone-700 hover:bg-rose-50 hover:text-rose-600"
                  aria-label="Backspace"
                >
                  <Delete className="w-5 h-5" />
                </button>
              </div>

              {/* Demo Hint */}
              <div className="mt-5 text-center text-[11px] text-stone-400 dark:text-stone-500">
                Default Staff PIN: <span className="font-mono font-bold text-amber-600 dark:text-amber-400">1234</span> (Owner) |{' '}
                <span className="font-mono font-bold text-amber-600 dark:text-amber-400">1111</span> (Cashier)
              </div>
            </div>
          ) : (
            /* Mode 2: Username & Password */
            <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-sm mx-auto w-full">
              <Input
                label="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. owner or admin"
                leftIcon={<User className="w-4 h-4" />}
                required
              />

              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                leftIcon={<Lock className="w-4 h-4" />}
                required
              />

              <Button
                type="submit"
                variant="primary"
                size="touch"
                className="w-full mt-2"
                isLoading={isLoading}
              >
                Sign In to POS
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
