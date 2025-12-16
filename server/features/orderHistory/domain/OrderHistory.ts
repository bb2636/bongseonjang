export type OrderStatusFilter = 'all' | 'shipping' | 'delivered' | 'cancelled';

export type UnifiedOrderStatus = 'pending' | 'confirmed' | 'shipping' | 'delivered' | 'cancelled';

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

export interface ShipmentSummary {
  id: string;
  carrier: string;
  trackingNumber: string;
  shippedAt: string | null;
  status: UnifiedOrderStatus;
  statusLabel: string;
}

export interface OrderHistoryEntry {
  id: string;
  orderNumber: string;
  orderDate: string;
  status: UnifiedOrderStatus;
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

export interface OrderDetailItem {
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

export interface PaymentInfo {
  method: string;
  methodLabel: string;
  cardCompany: string | null;
  cardNumber: string | null;
  installmentMonths: number | null;
  paidAt: string | null;
}

export interface OrderDetail {
  id: string;
  orderNumber: string;
  orderDate: string;
  status: UnifiedOrderStatus;
  statusLabel: string;
  recipientName: string;
  recipientPhone: string;
  postalCode: string;
  address: string;
  addressDetail: string | null;
  deliveryRequest: string | null;
  items: OrderDetailItem[];
  totalProductPrice: number;
  usedPoints: number;
  couponDiscountAmount: number;
  shippingFee: number;
  finalAmount: number;
  payment: PaymentInfo | null;
  paidAt: string | null;
  shipments: ShipmentSummary[];
}
