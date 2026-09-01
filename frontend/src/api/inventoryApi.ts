import { apiFetch } from './client';
import type { InventoryItem } from '../types/app.types';

export const inventoryApi = {
  getInventory: () => apiFetch<InventoryItem[]>('/inventory'),
  createInventory: (data: Partial<InventoryItem>) =>
    apiFetch<InventoryItem>('/inventory', { method: 'POST', body: JSON.stringify(data) }),
  updateInventory: (id: number, data: { stock: number; threshold: number }) =>
    apiFetch<InventoryItem>(`/inventory/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteInventory: (id: number) =>
    apiFetch<{ success: boolean }>(`/inventory/${id}`, { method: 'DELETE' }),
};
