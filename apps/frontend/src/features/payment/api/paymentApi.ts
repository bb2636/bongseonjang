export interface CouponDto {
  id: number;
  name: string;
  description: string | null;
  discountType: 'fixed' | 'rate' | 'shipping';
  discountValue: number;
  maxDiscountAmount: number | null;
  minOrderAmount: number;
  targetType: string;
  validFrom: string | null;
  validTo: string | null;
  isIssued: boolean;
}

interface PreparePaymentRequest {
  selectedItemIds: string[];
  recipientName: string;
  recipientPhone: string;
  postalCode: string;
  address: string;
  addressDetail?: string;
  deliveryRequest?: string;
  paymentMethod: 'card' | 'bank' | 'vbank';
  shippingFee: number;
  userCouponId?: number;
  usedPoints?: number;
}

export interface DirectPurchaseItem {
  productOptionId: string | null;
  quantity: number;
}

export interface PrepareDirectPaymentRequest {
  productId: string;
  items: DirectPurchaseItem[];
  recipientName: string;
  recipientPhone: string;
  postalCode: string;
  address: string;
  addressDetail?: string;
  deliveryRequest?: string;
  paymentMethod: 'card' | 'bank' | 'vbank';
  shippingFee: number;
  userCouponId?: number;
  usedPoints?: number;
}

interface PreparePaymentResponse {
  orderId: string;
  orderNumber: string;
  clientKey: string;
  amount: number;
  goodsName: string;
  returnUrl: string;
}

function getCallbackUrl(): string {
  return `${window.location.origin}/api/payment/callback`;
}

export async function fetchMyCoupons(): Promise<CouponDto[]> {
  const token = localStorage.getItem('user_token');
  
  const response = await fetch('/api/coupons/my', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    return [];
  }

  const data = await response.json();
  return data.coupons || [];
}

export async function fetchAvailableCoupons(productIds: string[]): Promise<CouponDto[]> {
  const token = localStorage.getItem('user_token');
  
  const response = await fetch('/api/coupons/available', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ productIds }),
  });

  if (!response.ok) {
    return [];
  }

  const data = await response.json();
  return data.coupons || [];
}

export async function prepareDirectPayment(data: PrepareDirectPaymentRequest): Promise<PreparePaymentResponse> {
  const token = localStorage.getItem('user_token');
  const returnUrl = getCallbackUrl();
  
  const response = await fetch('/api/payment/prepare-direct', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ ...data, returnUrl }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '결제 준비에 실패했습니다');
  }

  return response.json();
}

export async function preparePayment(data: PreparePaymentRequest): Promise<PreparePaymentResponse> {
  const token = localStorage.getItem('user_token');
  const returnUrl = getCallbackUrl();
  
  const response = await fetch('/api/payment/prepare', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ ...data, returnUrl }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '결제 준비에 실패했습니다');
  }

  return response.json();
}

export async function getPaymentResult(orderId: string): Promise<{ success: boolean; order?: { orderNumber: string; status: string } }> {
  const token = localStorage.getItem('user_token');
  
  const response = await fetch(`/api/payment/order/${orderId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    return { success: false };
  }

  const order = await response.json();
  return { success: true, order };
}

export interface GuestCartItem {
  productId: string;
  productName: string;
  optionId: string | null;
  optionName: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  thumbnailUrl: string;
}

export interface PrepareGuestPaymentRequest {
  cartItems: GuestCartItem[];
  guestName: string;
  guestPhone: string;
  guestEmail?: string;
  recipientName: string;
  recipientPhone: string;
  postalCode: string;
  address: string;
  addressDetail?: string;
  deliveryRequest?: string;
  paymentMethod: 'card' | 'bank' | 'vbank';
}

export async function prepareGuestPayment(data: PrepareGuestPaymentRequest): Promise<PreparePaymentResponse> {
  const returnUrl = getCallbackUrl();
  
  const response = await fetch('/api/payment/prepare-guest', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ...data, returnUrl }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '결제 준비에 실패했습니다');
  }

  return response.json();
}

export interface GuestOrderLookupRequest {
  guestName: string;
  guestPhone: string;
}

export interface GuestOrderItem {
  productId: string;
  productName: string;
  optionName: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface GuestOrder {
  id: string;
  orderNumber: string;
  status: string;
  totalProductPrice: number;
  finalAmount: number;
  recipientName: string;
  recipientPhone: string;
  address: string;
  createdAt: string;
  paidAt: string | null;
  items: GuestOrderItem[];
  isClaimed: boolean;
}

export async function lookupGuestOrders(data: GuestOrderLookupRequest): Promise<{ orders: GuestOrder[] }> {
  const response = await fetch('/api/payment/guest/lookup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '주문 조회에 실패했습니다');
  }

  return response.json();
}

export interface GuestOrderDetail {
  id: string;
  orderNumber: string;
  status: string;
  totalProductPrice: number;
  finalAmount: number;
  recipientName: string;
  recipientPhone: string;
  postalCode: string;
  address: string;
  addressDetail: string | null;
  deliveryRequest: string | null;
  createdAt: string;
  paidAt: string | null;
  items: GuestOrderItem[];
}

export async function fetchGuestOrderDetail(orderId: string): Promise<GuestOrderDetail> {
  const response = await fetch(`/api/payment/guest/order/${orderId}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '주문 조회에 실패했습니다');
  }

  return response.json();
}
