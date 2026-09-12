import { apiFetch } from './client';
import type { Category, MenuItem, Addon } from '../types/app.types';

export const menuApi = {
  // Categories
  getCategories: () => apiFetch<Category[]>('/category'),
  createCategory: (data: Partial<Category>) =>
    apiFetch<Category>('/category', { method: 'POST', body: JSON.stringify(data) }),
  updateCategory: (id: number, data: Partial<Category>) =>
    apiFetch<Category>(`/category/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  addSubcategory: (categoryId: number, name: string) =>
    apiFetch<Category>(`/category/${categoryId}/subcategory`, {
      method: 'POST',
      body: JSON.stringify({ name }),
    }),
  removeSubcategory: (categoryId: number, name: string) =>
    apiFetch<Category>(`/category/${categoryId}/subcategory/${encodeURIComponent(name)}`, {
      method: 'DELETE',
    }),
  deleteCategory: (id: number) =>
    apiFetch<{ success: boolean }>(`/category/${id}`, { method: 'DELETE' }),

  // Menu Items
  getMenuItems: () => apiFetch<any[]>('/menu'),
  createMenuItem: (data: any) =>
    apiFetch<MenuItem>('/menu', { method: 'POST', body: JSON.stringify(data) }),
  updateMenuItem: (id: number, data: any) =>
    apiFetch<MenuItem>(`/menu/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteMenuItem: (id: number) =>
    apiFetch<{ success: boolean }>(`/menu/${id}`, { method: 'DELETE' }),

  // Add-ons
  getAddons: () => apiFetch<Addon[]>('/addon'),
  createAddon: (data: { name: string; description?: string; price: string | number }) =>
    apiFetch<Addon>('/addon', { method: 'POST', body: JSON.stringify(data) }),
  updateAddon: (id: number, data: { name: string; description?: string; price: string | number }) =>
    apiFetch<Addon>(`/addon/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteAddon: (id: number) =>
    apiFetch<{ success: boolean }>(`/addon/${id}`, { method: 'DELETE' }),
};
