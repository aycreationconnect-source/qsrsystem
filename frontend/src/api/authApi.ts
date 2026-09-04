import { API_BASE_URL } from './client';

export interface LoginPayload {
  pin?: string;
  username?: string;
  password?: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: {
    id: string;
    username: string;
    fullName: string;
    role: string;
  };
  store: {
    cafeCode: string;
    businessName: string;
    currencySymbol: string;
    receiptFooter?: string;
  };
  license: {
    planCode: string;
    expiresAt: string;
    daysRemaining: number;
    allowedModules: string[];
    status: string;
  };
}

export const authApi = {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Login failed');
    }
    return res.json();
  },

  async getProfile(token?: string) {
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      credentials: 'include',
      headers,
    });
    if (!res.ok) throw new Error('Session expired');
    return res.json();
  },

  async logout(): Promise<{ success: boolean }> {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
      return res.ok ? await res.json() : { success: true };
    } catch {
      return { success: true };
    }
  },

  async getStaff() {
    const res = await fetch(`${API_BASE_URL}/auth/staff`, {
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Failed to fetch staff list');
    return res.json();
  },
};
