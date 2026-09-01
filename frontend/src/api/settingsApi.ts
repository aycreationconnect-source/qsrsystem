import { apiFetch } from './client';
import type { Settings } from '../types/app.types';

export const settingsApi = {
  getSettings: () => apiFetch<Settings>('/setting'),
  saveSettings: (data: Record<string, string>) =>
    apiFetch<{ success: boolean }>('/setting', { method: 'POST', body: JSON.stringify(data) }),
};
