import { apiFetch } from './client';
import type { Area, Table } from '../types/app.types';

export const tableApi = {
  // Areas
  getAreas: () => apiFetch<Area[]>('/area'),
  createArea: (data: { name: string; description?: string }) =>
    apiFetch<Area>('/area', { method: 'POST', body: JSON.stringify(data) }),
  updateArea: (id: number, data: { name: string; description?: string }) =>
    apiFetch<Area>(`/area/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteArea: (id: number) =>
    apiFetch<{ success: boolean }>(`/area/${id}`, { method: 'DELETE' }),

  // Tables
  getTables: () => apiFetch<Table[]>('/table'),
  createTable: (data: { name: string; seats: number; status?: string; areaId: number }) =>
    apiFetch<Table>('/table', { method: 'POST', body: JSON.stringify(data) }),
  updateTable: (id: number, data: { name?: string; seats?: number; status?: string; areaId?: number }) =>
    apiFetch<Table>(`/table/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteTable: (id: number) =>
    apiFetch<{ success: boolean }>(`/table/${id}`, { method: 'DELETE' }),
};
