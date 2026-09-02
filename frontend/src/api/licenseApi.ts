import { API_BASE_URL } from './client';

export interface ActivatePayload {
  cafeCode: string;
  licenseKey: string;
  ownerPin: string;
  ownerPassword?: string;
  ownerName?: string;
  phone?: string;
  email?: string;
  city?: string;
  state?: string;
  address?: string;
}

export interface LicenseStatusResponse {
  isActivated: boolean;
  store: {
    id: string;
    cafeCode: string;
    businessName: string;
    ownerName: string;
    phone: string;
    email?: string;
    city: string;
    state: string;
    address?: string;
    currencySymbol: string;
    receiptFooter?: string;
    isActivated: boolean;
    activatedAt: string;
  } | null;
  license: {
    planCode: string;
    durationDays: number;
    expiresAt: string;
    daysRemaining: number;
    isExpired: boolean;
    isExpiringSoon: boolean;
    allowedModules: string[];
    status: string;
  } | null;
}

export const licenseApi = {
  async getStatus(): Promise<LicenseStatusResponse> {
    const res = await fetch(`${API_BASE_URL}/license/status`);
    if (!res.ok) throw new Error('Failed to fetch license status');
    return res.json();
  },

  async activateStore(payload: ActivatePayload) {
    const res = await fetch(`${API_BASE_URL}/license/activate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Activation failed');
    }
    return res.json();
  },

  async renewLicense(licenseKey: string) {
    const res = await fetch(`${API_BASE_URL}/license/renew`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ licenseKey }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Renewal failed');
    }
    return res.json();
  },
};
