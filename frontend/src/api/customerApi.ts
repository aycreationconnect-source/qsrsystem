import { apiFetch } from './client';

export interface CustomerSuggestion {
  id: number;
  name: string;
  phone?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export const customerApi = {
  search: (query: string) =>
    apiFetch<CustomerSuggestion[]>(`/customer/search?q=${encodeURIComponent(query)}`),
  getAll: () =>
    apiFetch<CustomerSuggestion[]>('/customer'),
  saveCustomer: (data: { name: string; phone?: string | null }) =>
    apiFetch<CustomerSuggestion>('/customer', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};
