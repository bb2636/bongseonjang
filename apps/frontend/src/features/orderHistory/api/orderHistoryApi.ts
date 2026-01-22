import { API_BASE_URL } from '@/shared/config/apiConfig';

export type OrderStatus = 'pending' | 'confirmed' | 'shipping' | 'delivered' | 'cancelled';

export type OrderStatusFilter = 'all' | 'shipping' | 'delivered' | 'cancelled';

export interface OrderHistoryItem {
  id: string;
  productId: string | null;
  productName: string;
  productImageUrl: string;
  mainOptionName: string | null;
  subOptionName: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  isAvailableForReorder: boolean;
}

export interface ShipmentSummary {
  id: string;
  carrier: string;
  trackingNumber: string;
  shippedAt: string | null;
  status: OrderStatus;
  statusLabel: string;
}

export interface OrderHistoryEntry {
  id: string;
  orderNumber: string;
  orderDate: string;
  status: OrderStatus;
  statusLabel: string;
  statusDate: string;
  items: OrderHistoryItem[];
  totalAmount: number;
  shipment: ShipmentSummary | null;
}

export interface OrderHistoryResponse {
  orders: OrderHistoryEntry[];
  totalCount: number;
}

export async function fetchOrderHistory(statusFilter: OrderStatusFilter): Promise<OrderHistoryResponse> {
  const token = localStorage.getItem('user_token');
  
  const response = await fetch(`${API_BASE_URL}/orders?status=${statusFilter}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch order history');
  }

  return response.json();
}

export interface CheckPurchaseResponse {
  hasPurchased: boolean;
}

export async function checkPurchase(productId: string): Promise<CheckPurchaseResponse> {
  const token = localStorage.getItem('user_token');
  
  if (!token) {
    return { hasPurchased: false };
  }
  
  const response = await fetch(`${API_BASE_URL}/orders/check-purchase/${productId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to check purchase');
  }

  return response.json();
}
