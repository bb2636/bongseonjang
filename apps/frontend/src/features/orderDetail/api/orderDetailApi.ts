import { API_BASE_URL } from '@/shared/config/apiConfig';

export type OrderStatus = 'pending' | 'confirmed' | 'shipping' | 'delivered' | 'cancelled';

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
  status: string | null;
  cardCompany: string | null;
  cardNumber: string | null;
  installmentMonths: number | null;
  paidAt: string | null;
  vbankName: string | null;
  vbankNumber: string | null;
  vbankHolder: string | null;
  vbankExpiresAt: string | null;
}

export interface ShipmentSummary {
  id: string;
  carrier: string;
  trackingNumber: string;
  shippedAt: string | null;
  status: OrderStatus;
  statusLabel: string;
}

export interface OrderDetail {
  id: string;
  orderNumber: string;
  orderDate: string;
  status: OrderStatus;
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

export async function fetchOrderDetail(orderId: string): Promise<OrderDetail> {
  const token = localStorage.getItem('user_token');
  
  const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch order detail');
  }

  return response.json();
}
