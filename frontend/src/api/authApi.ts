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
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        let errorMsg = 'Login failed';
        try {
          const err = await res.json();
          errorMsg = err.message || errorMsg;
        } catch {
          errorMsg = `Server returned status ${res.status}`;
        }
        throw new Error(errorMsg);
      }
      const data: AuthResponse = await res.json();
      if (data && data.token) {
        localStorage.setItem('pos_jwt_token', data.token);
      }
      return data;
    } catch (err: any) {
      if (err.message === 'Load failed' || err.name === 'TypeError') {
        throw new Error('Could not connect to server. Please check network connection.');
      }
      throw err;
    }
  },

  async getProfile(token?: string) {
    const headers: Record<string, string> = {};
    const effectiveToken = token || localStorage.getItem('pos_jwt_token');
    if (effectiveToken) {
      headers['Authorization'] = effectiveToken.startsWith('Bearer ')
        ? effectiveToken
        : `Bearer ${effectiveToken}`;
    }
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      credentials: 'include',
      headers,
    });
    if (!res.ok) throw new Error('Session expired');
    return res.json();
  },

  async logout(): Promise<{ success: boolean }> {
    const headers: Record<string, string> = {};
    const token = localStorage.getItem('pos_jwt_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
        headers,
      });
      return res.ok ? await res.json() : { success: true };
    } catch {
      return { success: true };
    } finally {
      localStorage.removeItem('pos_jwt_token');
    }
  },

  async getStaff() {
    const headers: Record<string, string> = {};
    const token = localStorage.getItem('pos_jwt_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const res = await fetch(`${API_BASE_URL}/auth/staff`, {
      credentials: 'include',
      headers,
    });
    if (!res.ok) throw new Error('Failed to fetch staff list');
    return res.json();
  },
};
