import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { StatsCards } from './components/StatsCards';
import { CafeDirectory } from './components/CafeDirectory';
import { RegisterCafeModal } from './components/RegisterCafeModal';
import { WhatsAppCardModal } from './components/WhatsAppCardModal';
import { PlanManagerModal } from './components/PlanManagerModal';
import { RenewModal } from './components/RenewModal';
import { AuditHistoryModal } from './components/AuditHistoryModal';
import { ConfirmModal, ModalVariant } from './components/common/ConfirmModal';
import { LoginView } from './components/LoginView';
import { api } from './services/api';
import { AdminUser, CafeMaster, DashboardStats, PlanTemplate, RegisterCafePayload, RenewCafePayload } from './types';
import { Database, KeyRound, Ban, CheckCircle2, Trash2, ShieldCheck } from 'lucide-react';

export const App: React.FC = () => {
  // Auth state
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(() => {
    const saved = localStorage.getItem('qsr_superadmin_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Dashboard state
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [plans, setPlans] = useState<PlanTemplate[]>([]);
  const [cafes, setCafes] = useState<CafeMaster[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Filters
  const [activeFilter, setActiveFilter] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');

  // Modals state
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isPlanManagerOpen, setIsPlanManagerOpen] = useState(false);
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);
  const [isRenewOpen, setIsRenewOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Generic Confirm Modal state
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel: string;
    variant: ModalVariant;
    icon: any;
    showReasonInput?: boolean;
    reasonPlaceholder?: string;
    action: (reason?: string) => Promise<void>;
  }>({
    isOpen: false,
    title: '',
    message: '',
    confirmLabel: 'Confirm',
    variant: 'danger',
    icon: Ban,
    showReasonInput: false,
    action: async () => {},
  });

  // Selected Cafe for Modals
  const [selectedCafe, setSelectedCafe] = useState<CafeMaster | null>(null);
  const [latestWhatsAppMessage, setLatestWhatsAppMessage] = useState<string>('');
  const [latestLicenseKey, setLatestLicenseKey] = useState<string>('');

  const loadData = async () => {
    if (!currentUser) return;
    try {
      setIsLoading(true);
      const [statsData, plansData, cafesData] = await Promise.all([
        api.getDashboardStats(),
        api.getPlans(),
        api.getCafes({ search }),
      ]);
      setStats(statsData);
      setPlans(plansData);
      setCafes(cafesData);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      loadData();
    }
  }, [currentUser]);

  // Search debounce
  useEffect(() => {
    if (!currentUser) return;
    const timer = setTimeout(() => {
      api.getCafes({ search }).then(setCafes).catch(console.error);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, currentUser]);

  // Auth Handlers
  const handleLogin = async (credentials: { username: string; password: string }) => {
    try {
      setAuthLoading(true);
      setAuthError(null);
      const res = await api.login(credentials);
      localStorage.setItem('qsr_superadmin_user', JSON.stringify(res.user));
      localStorage.setItem('qsr_superadmin_token', res.token);
      setCurrentUser(res.user);
    } catch (err: any) {
      setAuthError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('qsr_superadmin_user');
    localStorage.removeItem('qsr_superadmin_token');
    setCurrentUser(null);
  };

  // Handle Cafe Registration
  const handleRegisterCafe = async (payload: RegisterCafePayload) => {
    try {
      setActionLoading(true);
      const res = await api.registerCafe(payload);
      setIsRegisterOpen(false);
      await loadData();

      // Open WhatsApp card immediately
      setSelectedCafe(res.cafe);
      setLatestWhatsAppMessage(res.whatsappMessage);
      setLatestLicenseKey(res.licenseKey);
      setIsWhatsAppOpen(true);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Renew License
  const handleRenewCafe = async (cafeId: string, payload: RenewCafePayload) => {
    try {
      setActionLoading(true);
      const res = await api.renewCafe(cafeId, payload);
      setIsRenewOpen(false);
      await loadData();

      // Open WhatsApp card with new key
      setSelectedCafe(res.cafe);
      setLatestWhatsAppMessage(res.whatsappMessage);
      setLatestLicenseKey(res.newLicenseKey);
      setIsWhatsAppOpen(true);
    } finally {
      setActionLoading(false);
    }
  };

  // Trigger Smooth Modal for Key Regeneration
  const handleRequestRegenerateKey = (cafe: CafeMaster) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Regenerate Cryptographic License Key',
      message: `Are you sure you want to re-issue the cryptographic license key for "${cafe.businessName}" (${cafe.cafeCode})? A fresh signed token will be generated immediately.`,
      confirmLabel: 'Regenerate Key',
      variant: 'primary',
      icon: KeyRound,
      showReasonInput: false,
      action: async () => {
        try {
          setActionLoading(true);
          const res = await api.regenerateKey(cafe.id);
          setConfirmConfig((prev) => ({ ...prev, isOpen: false }));
          await loadData();

          setSelectedCafe(res.cafe);
          setLatestWhatsAppMessage(res.whatsappMessage);
          setLatestLicenseKey(res.licenseKey);
          setIsWhatsAppOpen(true);
        } finally {
          setActionLoading(false);
        }
      },
    });
  };

  // Trigger Smooth Modal for Block / Unblock
  const handleRequestToggleStatus = (cafe: CafeMaster, action: 'BLOCK' | 'UNBLOCK') => {
    const isBlock = action === 'BLOCK';

    setConfirmConfig({
      isOpen: true,
      title: isBlock ? 'Block Cafe Store Access' : 'Unblock Cafe Store Access',
      message: isBlock
        ? `Are you sure you want to BLOCK "${cafe.businessName}" (${cafe.cafeCode})? POS billing, table ordering, and terminal access will be restricted offline.`
        : `Are you sure you want to UNBLOCK "${cafe.businessName}" (${cafe.cafeCode})? Store access and all terminal operations will be restored.`,
      confirmLabel: isBlock ? 'Block Store Access' : 'Restore Store Access',
      variant: isBlock ? 'danger' : 'success',
      icon: isBlock ? Ban : CheckCircle2,
      showReasonInput: true,
      reasonPlaceholder: isBlock
        ? 'e.g. Subscription payment pending / Verification dispute'
        : 'e.g. Account cleared & verified by Support Admin',
      action: async (reason) => {
        try {
          setActionLoading(true);
          await api.toggleCafeStatus(cafe.id, action, reason);
          setConfirmConfig((prev) => ({ ...prev, isOpen: false }));
          await loadData();
        } finally {
          setActionLoading(false);
        }
      },
    });
  };

  // Trigger Smooth Modal for Plan Deletion
  const handleRequestDeletePlan = (plan: PlanTemplate) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Delete License Plan',
      message: `Are you sure you want to delete "${plan.name}" (${plan.planCode})? If stores are assigned, it will be safely deactivated instead.`,
      confirmLabel: 'Delete Plan',
      variant: 'danger',
      icon: Trash2,
      showReasonInput: false,
      action: async () => {
        try {
          setActionLoading(true);
          await api.deletePlan(plan.id);
          setConfirmConfig((prev) => ({ ...prev, isOpen: false }));
          const updatedPlans = await api.getPlans();
          setPlans(updatedPlans);
        } finally {
          setActionLoading(false);
        }
      },
    });
  };

  // Plan Management Handlers
  const handleCreatePlan = async (planData: Partial<PlanTemplate>) => {
    try {
      setActionLoading(true);
      await api.createPlan(planData);
      const updatedPlans = await api.getPlans();
      setPlans(updatedPlans);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdatePlan = async (id: string, planData: Partial<PlanTemplate>) => {
    try {
      setActionLoading(true);
      await api.updatePlan(id, planData);
      const updatedPlans = await api.getPlans();
      setPlans(updatedPlans);
    } finally {
      setActionLoading(false);
    }
  };

  // Open Handlers
  const handleOpenWhatsApp = (cafe: CafeMaster) => {
    setSelectedCafe(cafe);
    setLatestWhatsAppMessage('');
    setLatestLicenseKey('');
    setIsWhatsAppOpen(true);
  };

  const handleOpenRenew = (cafe: CafeMaster) => {
    setSelectedCafe(cafe);
    setIsRenewOpen(true);
  };

  const handleOpenHistory = async (cafe: CafeMaster) => {
    try {
      const detailed = await api.getCafeById(cafe.id);
      setSelectedCafe(detailed);
      setIsHistoryOpen(true);
    } catch (err) {
      console.error('Failed to fetch cafe history:', err);
    }
  };

  // If user is not authenticated, show Login View
  if (!currentUser) {
    return (
      <LoginView
        onLogin={handleLogin}
        isLoading={authLoading}
        error={authError}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#070b12] text-slate-900 dark:text-slate-100 flex flex-col selection:bg-amber-500 selection:text-slate-950 transition-colors duration-200">
      {/* Top Navbar */}
      <Navbar
        onOpenRegister={() => setIsRegisterOpen(true)}
        onOpenPlanManager={() => setIsPlanManagerOpen(true)}
        onRefresh={loadData}
        onLogout={handleLogout}
        currentUser={currentUser}
        isLoading={isLoading}
      />

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Banner Alert for Golden DB Host Status */}
        <div className="p-4 rounded-3xl bg-slate-100/90 dark:bg-gradient-to-r dark:from-slate-900 dark:via-slate-900 dark:to-amber-950/20 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md dark:shadow-xl transition-colors duration-200">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <span>Golden DB: <code className="text-amber-600 dark:text-amber-400 font-mono">golden_qsr_db</code></span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-bold">
                  ● Local MySQL Connected
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Offline Cryptographic Signing active. All licenses generated can be verified offline by cafes.
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Default Trial:</span>
            <span className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-bold text-amber-600 dark:text-amber-400">
              {plans.find((p) => p.isDefault)?.name || '3 Months Free Trial'}
            </span>
          </div>
        </div>

        {/* Stats KPI Overview Cards */}
        <StatsCards
          stats={stats}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
        />

        {/* Cafe Master Directory */}
        <CafeDirectory
          cafes={cafes}
          onOpenWhatsApp={handleOpenWhatsApp}
          onOpenRenew={handleOpenRenew}
          onOpenHistory={handleOpenHistory}
          onRequestRegenerateKey={handleRequestRegenerateKey}
          onRequestToggleStatus={handleRequestToggleStatus}
          search={search}
          onSearchChange={setSearch}
          activeFilter={activeFilter}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800/60 bg-white/60 dark:bg-slate-950/40 py-6 text-center text-xs text-slate-500 dark:text-slate-400 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>QSR System Support & Licensing Control Platform © 2026 AyCreationConnect</span>
          <span className="text-[11px] text-slate-400 dark:text-slate-500">Local Instance • Master Private Key Protected</span>
        </div>
      </footer>

      {/* Modals */}
      <RegisterCafeModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        plans={plans}
        onSubmit={handleRegisterCafe}
        isLoading={actionLoading}
      />

      <WhatsAppCardModal
        isOpen={isWhatsAppOpen}
        onClose={() => setIsWhatsAppOpen(false)}
        cafe={selectedCafe}
        whatsappMessage={latestWhatsAppMessage}
        licenseKey={latestLicenseKey}
      />

      <PlanManagerModal
        isOpen={isPlanManagerOpen}
        onClose={() => setIsPlanManagerOpen(false)}
        plans={plans}
        onCreatePlan={handleCreatePlan}
        onUpdatePlan={handleUpdatePlan}
        onRequestDeletePlan={handleRequestDeletePlan}
        isLoading={actionLoading}
      />

      <RenewModal
        isOpen={isRenewOpen}
        onClose={() => setIsRenewOpen(false)}
        cafe={selectedCafe}
        plans={plans}
        onSubmit={handleRenewCafe}
        isLoading={actionLoading}
      />

      <AuditHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        cafe={selectedCafe}
      />

      {/* Smooth Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        onClose={() => setConfirmConfig((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmConfig.action}
        title={confirmConfig.title}
        message={confirmConfig.message}
        confirmLabel={confirmConfig.confirmLabel}
        variant={confirmConfig.variant}
        icon={confirmConfig.icon}
        showReasonInput={confirmConfig.showReasonInput}
        reasonPlaceholder={confirmConfig.reasonPlaceholder}
        isLoading={actionLoading}
      />
    </div>
  );
};
export default App;
