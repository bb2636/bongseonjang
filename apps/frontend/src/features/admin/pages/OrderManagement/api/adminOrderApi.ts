export type OrderStatus =
  | 'ALL'
  | 'PAYMENT_PENDING'
  | 'PAYMENT_FAILED'
  | 'PAYMENT_COMPLETED'
  | 'PREPARING'
  | 'SHIPPING'
  | 'DELIVERED'
  | 'CANCELLED';

export type PaymentMethod = 'ALL' | 'CARD' | 'ACCOUNT_TRANSFER' | 'BANK_TRANSFER';

export interface AdminOrderItemDto {
  id: string;
  productName: string;
  productImageUrl: string | null;
  optionName: string | null;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
}

export interface AdminOrderDto {
  id: string;
  orderNumber: string;
  orderedAt: string;
  orderStatus: Exclude<OrderStatus, 'ALL'>;
  customerName: string;
  phoneNumber: string;
  email: string;
  totalAmount: number;
  paymentMethod: Exclude<PaymentMethod, 'ALL'> | null;
  shippingCompany: string | null;
  trackingNumber: string | null;
  items: AdminOrderItemDto[];
}

export interface AdminOrderListResponse {
  items: AdminOrderDto[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface FetchAdminOrdersParams {
  search?: string;
  status?: OrderStatus;
  paymentMethod?: PaymentMethod;
  page?: number;
  limit?: number;
}

export async function fetchAdminOrders(params: FetchAdminOrdersParams = {}): Promise<AdminOrderListResponse> {
  const queryParams = new URLSearchParams();
  
  if (params.search) {
    queryParams.set('search', params.search);
  }
  if (params.status && params.status !== 'ALL') {
    queryParams.set('status', params.status);
  }
  if (params.paymentMethod && params.paymentMethod !== 'ALL') {
    queryParams.set('paymentMethod', params.paymentMethod);
  }
  if (params.page) {
    queryParams.set('page', params.page.toString());
  }
  if (params.limit) {
    queryParams.set('limit', params.limit.toString());
  }

  const url = `/api/admin/orders${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error('주문 목록을 불러오는데 실패했습니다');
  }
  
  return response.json();
}

export interface UpdateShippingInfoParams {
  carrierId: string;
  carrierName: string;
  trackingNumber?: string;
}

export type BackendOrderStatus = 'pending' | 'payment_failed' | 'paid' | 'confirmed' | 'preparing' | 'shipping' | 'delivered' | 'cancelled' | 'refunded';

export async function updateOrderStatus(orderId: string, status: BackendOrderStatus): Promise<void> {
  const response = await fetch(`/api/admin/orders/${orderId}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || '주문 상태 변경에 실패했습니다');
  }
}

export async function updateShippingInfo(orderId: string, params: UpdateShippingInfoParams): Promise<void> {
  const response = await fetch(`/api/admin/orders/${orderId}/shipping`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || '배송 정보 저장에 실패했습니다');
  }
}
