import { API_BASE_URL } from '@/shared/config/apiConfig';

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

  const url = `${API_BASE_URL}/admin/orders${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  
  const token = sessionStorage.getItem('admin_token');
  const response = await fetch(url, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  
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
  const token = sessionStorage.getItem('admin_token');
  const response = await fetch(`${API_BASE_URL}/admin/orders/${orderId}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || '주문 상태 변경에 실패했습니다');
  }
}

export async function updateShippingInfo(orderId: string, params: UpdateShippingInfoParams): Promise<void> {
  const token = sessionStorage.getItem('admin_token');
  const response = await fetch(`${API_BASE_URL}/admin/orders/${orderId}/shipping`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || '배송 정보 저장에 실패했습니다');
  }
}

export interface AdminOrderDetailDto {
  id: string;
  orderNumber: string;
  orderedAt: string;
  orderStatus: string;
  customerName: string;
  phoneNumber: string;
  email: string;
  items: Array<{
    id: string;
    productName: string;
    optionName: string | null;
    quantity: number;
    unitPrice: number;
    subtotal: number;
  }>;
  recipientName: string;
  recipientPhone: string;
  address: string;
  addressDetail: string | null;
  deliveryRequest: string | null;
  shippingCompany: string | null;
  trackingNumber: string | null;
  totalProductPrice: number;
  shippingFee: number;
  couponDiscountAmount: number;
  usedPoints: number;
  finalAmount: number;
  paymentMethod: string | null;
  adminMemo: string | null;
}

export async function fetchAdminOrderDetail(orderId: string): Promise<AdminOrderDetailDto> {
  const token = sessionStorage.getItem('admin_token');
  const response = await fetch(`${API_BASE_URL}/admin/orders/${orderId}`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) {
    throw new Error('주문 상세 정보를 불러오는데 실패했습니다');
  }

  return response.json();
}

export async function updateAdminOrderMemo(orderId: string, adminMemo: string): Promise<void> {
  const token = sessionStorage.getItem('admin_token');
  const response = await fetch(`${API_BASE_URL}/admin/orders/${orderId}/memo`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ adminMemo }),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || '관리 메모 저장에 실패했습니다');
  }
}
