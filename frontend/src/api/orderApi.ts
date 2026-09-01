import { apiFetch } from './client';
import type { Order } from '../types/app.types';

export interface PlaceOrderPayload {
  items: { menuItemId?: number; quantity: number; price: number }[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: string;
}

export const orderApi = {
  getOrders: () => apiFetch<Order[]>('/order'),
  getOrder: (id: number) => apiFetch<Order>(`/order/${id}`),
  placeOrder: (data: PlaceOrderPayload) =>
    apiFetch<Order>('/order', { method: 'POST', body: JSON.stringify(data) }),
};
