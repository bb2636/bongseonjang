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
