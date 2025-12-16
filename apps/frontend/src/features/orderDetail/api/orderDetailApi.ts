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
  cardCompany: string | null;
  cardNumber: string | null;
  installmentMonths: number | null;
  paidAt: string | null;
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
  const token = localStorage.getItem('token');
  
  const response = await fetch(`/api/orders/${orderId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch order detail');
  }

  return response.json();
}
