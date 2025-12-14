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
}

export interface OrderHistoryEntry {
  id: string;
  orderNumber: string;
  orderDate: string;
  status: string;
  statusLabel: string;
  statusDate: string;
  items: OrderHistoryItem[];
  totalAmount: number;
}

export interface OrderHistoryResponse {
  orders: OrderHistoryEntry[];
  totalCount: number;
}

export async function fetchOrderHistory(statusFilter: OrderStatusFilter): Promise<OrderHistoryResponse> {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`/api/orders?status=${statusFilter}`, {
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
  const token = localStorage.getItem('token');
  
  if (!token) {
    return { hasPurchased: false };
  }
  
  const response = await fetch(`/api/orders/check-purchase/${productId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to check purchase');
  }

  return response.json();
}
