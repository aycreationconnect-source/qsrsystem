export type PlanType = 'FREE_TRIAL' | 'PAID' | 'EXTENSION';
export type LicenseStatus = 'TRIAL' | 'ACTIVE' | 'EXPIRED' | 'SUSPENDED';

export interface AdminUser {
  id: string;
  username: string;
  fullName: string;
  role: string;
}

export interface LoginResponse {
  success: boolean;
  user: AdminUser;
  token: string;
}

export interface PlanTemplate {
  id: string;
  planCode: string;
  name: string;
  planType: PlanType;
  durationDays: number;
  price: number;
  isDefault: boolean;
  isActive: boolean;
  maxTerminals: number;
  allowedModules?: string[];
  description?: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    cafes: number;
  };
}

export interface LicenseHistory {
  id: string;
  cafeId: string;
  planId?: string;
  plan?: PlanTemplate;
  action: string;
  issuedLicenseKey: string;
  previousExpiry?: string;
  newExpiry: string;
  issuedByAdmin: string;
  notes?: string;
  createdAt: string;
}

export interface CafeMaster {
  id: string;
  cafeCode: string;
  businessName: string;
  ownerName: string;
  ownerPhone: string;
  ownerEmail?: string;
  city: string;
  state: string;
  address?: string;
  planId: string;
  plan: PlanTemplate;
  licenseStatus: LicenseStatus;
  currentLicenseKey: string;
  trialStartedAt: string;
  licenseExpiresAt: string;
  gdriveLinked: boolean;
  appVersion: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  daysRemaining: number;
  isExpired: boolean;
  isExpiringSoon: boolean;
  isSuspended: boolean;
  computedStatus: LicenseStatus;
  licenseHistories?: LicenseHistory[];
  whatsappMessage?: string;
}

export interface DashboardStats {
  totalCafes: number;
  activeTrials: number;
  paidActive: number;
  expiringSoon: number;
  expired: number;
  suspended: number;
  cityDistribution: Record<string, number>;
  recentCafes: CafeMaster[];
  recentLogs: LicenseHistory[];
}

export interface RegisterCafePayload {
  businessName: string;
  ownerName: string;
  ownerPhone: string;
  ownerEmail?: string;
  city: string;
  state: string;
  address?: string;
  planId?: string;
  customCafeCode?: string;
  notes?: string;
}

export interface RenewCafePayload {
  planId: string;
  customDays?: number;
  notes?: string;
  adminName?: string;
}
