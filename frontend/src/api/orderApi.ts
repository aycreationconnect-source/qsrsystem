import { apiFetch } from './client';
import type { Order, OrderPayment } from '../types/app.types';

export interface PlaceOrderPayload {
  items: { menuItemId?: number; quantity: number; price: number }[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: string;
  payments?: { amount: number; paymentMethod: string; reference?: string | null }[];
  description?: string;
}

export const orderApi = {
  getOrders: () => apiFetch<Order[]>('/order'),
  getOrder: (id: number) => apiFetch<Order>(`/order/${id}`),
  placeOrder: (data: PlaceOrderPayload) =>
    apiFetch<Order>('/order', { method: 'POST', body: JSON.stringify(data) }),
  addPayment: (orderId: number, data: { amount: number; paymentMethod: string; reference?: string }) =>
    apiFetch<{ payment: OrderPayment; order: Order; orderSummary: any }>(`/order/${orderId}/payments`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getOrderPayments: (orderId: number) =>
    apiFetch<{
      orderId: number;
      total: number;
      paidAmount: number;
      balanceAmount: number;
      status: string;
      payments: OrderPayment[];
    }>(`/order/${orderId}/payments`),
  removePayment: (orderId: number, paymentId: number) =>
    apiFetch<{ success: boolean; message: string; orderSummary: any }>(
      `/order/${orderId}/payments/${paymentId}`,
      { method: 'DELETE' }
    ),
};
