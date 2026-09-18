import { apiFetch } from './client';
import type { InventoryItem, InventoryCategory } from '../types/app.types';

export const inventoryApi = {
  getInventory: () => apiFetch<InventoryItem[]>('/inventory'),
  createInventory: (data: Partial<InventoryItem>) =>
    apiFetch<InventoryItem>('/inventory', { method: 'POST', body: JSON.stringify(data) }),
  updateInventory: (id: number, data: Partial<InventoryItem>) =>
    apiFetch<InventoryItem>(`/inventory/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteInventory: (id: number) =>
    apiFetch<{ success: boolean }>(`/inventory/${id}`, { method: 'DELETE' }),

  // Categories
  getCategories: () => apiFetch<InventoryCategory[]>('/inventory/categories'),
  createCategory: (data: { name: string; description?: string; status?: string }) =>
    apiFetch<InventoryCategory>('/inventory/categories', { method: 'POST', body: JSON.stringify(data) }),
  updateCategory: (id: number, data: { name?: string; description?: string; status?: string }) =>
    apiFetch<InventoryCategory>(`/inventory/categories/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteCategory: (id: number) =>
    apiFetch<{ success: boolean }>(`/inventory/categories/${id}`, { method: 'DELETE' }),

  // KOT Stock Deduction & Reversal
  deductStock: (items: Array<{ menuItemId: number; quantity: number }>, reason?: string) =>
    apiFetch<{ success: boolean; count: number }>('/inventory/deduct-stock', {
      method: 'POST',
      body: JSON.stringify({ items, reason }),
    }),

  revertStock: (items: Array<{ menuItemId: number; quantity: number }>, reason?: string) =>
    apiFetch<{ success: boolean; count: number }>('/inventory/revert-stock', {
      method: 'POST',
      body: JSON.stringify({ items, reason }),
    }),
};
