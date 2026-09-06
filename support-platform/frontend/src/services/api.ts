import { AdminUser, CafeMaster, DashboardStats, LoginResponse, PlanTemplate, RegisterCafePayload, RenewCafePayload } from '../types';
import { supabase } from './supabaseClient';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

export { supabase };

export const api = {
  // Auth
  async login(credentials: { username: string; password: string }): Promise<LoginResponse> {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Invalid username or password');
    }
    return res.json();
  },

  async getAdminProfile(username: string): Promise<AdminUser> {
    const res = await fetch(`${API_BASE_URL}/auth/me?username=${encodeURIComponent(username)}`);
    if (!res.ok) throw new Error('Failed to verify session');
    return res.json();
  },

  // Stats
  async getDashboardStats(): Promise<DashboardStats> {
    const res = await fetch(`${API_BASE_URL}/stats`);
    if (!res.ok) throw new Error('Failed to fetch stats');
    return res.json();
  },

  // Plans
  async getPlans(): Promise<PlanTemplate[]> {
    const res = await fetch(`${API_BASE_URL}/plans`);
    if (!res.ok) throw new Error('Failed to fetch plans');
    return res.json();
  },

  async createPlan(data: Partial<PlanTemplate>): Promise<PlanTemplate> {
    const res = await fetch(`${API_BASE_URL}/plans`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Failed to create plan');
    }
    return res.json();
  },

  async updatePlan(id: string, data: Partial<PlanTemplate>): Promise<PlanTemplate> {
    const res = await fetch(`${API_BASE_URL}/plans/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Failed to update plan');
    }
    return res.json();
  },

  async deletePlan(id: string): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/plans/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete plan');
    return res.json();
  },

  // Cafes
  async getCafes(params?: { search?: string; status?: string; city?: string }): Promise<CafeMaster[]> {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.status) query.append('status', params.status);
    if (params?.city) query.append('city', params.city);

    const res = await fetch(`${API_BASE_URL}/cafes?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch cafes');
    return res.json();
  },

  async getCafeById(id: string): Promise<CafeMaster> {
    const res = await fetch(`${API_BASE_URL}/cafes/${id}`);
    if (!res.ok) throw new Error('Failed to fetch cafe details');
    return res.json();
  },

  async registerCafe(payload: RegisterCafePayload): Promise<{
    cafe: CafeMaster;
    licenseKey: string;
    whatsappMessage: string;
    setupCredentials: any;
  }> {
    const res = await fetch(`${API_BASE_URL}/cafes/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Failed to register cafe');
    }
    return res.json();
  },

  async renewCafe(id: string, payload: RenewCafePayload): Promise<{
    cafe: CafeMaster;
    newLicenseKey: string;
    newExpiry: string;
    whatsappMessage: string;
  }> {
    const res = await fetch(`${API_BASE_URL}/cafes/${id}/renew`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Failed to renew license');
    }
    return res.json();
  },

  async toggleCafeStatus(id: string, action: 'BLOCK' | 'UNBLOCK', reason?: string): Promise<{
    cafe: CafeMaster;
    action: string;
    licenseStatus: string;
    message: string;
  }> {
    const res = await fetch(`${API_BASE_URL}/cafes/${id}/toggle-status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, reason }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Failed to update cafe status');
    }
    return res.json();
  },

  async regenerateKey(id: string): Promise<{
    cafe: CafeMaster;
    licenseKey: string;
    whatsappMessage: string;
  }> {
    const res = await fetch(`${API_BASE_URL}/cafes/${id}/regenerate-key`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to regenerate license key');
    return res.json();
  },
};
