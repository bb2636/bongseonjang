import { API_BASE_URL, IS_CAPACITOR, CAPACITOR_APP_SCHEME, getAbsoluteApiUrl } from '@/shared/config/apiConfig';

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
  allowMultipleUse: boolean;
  targetCategoryIds?: number[];
  targetExposureCategoryIds?: number[];
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
  userCouponIds?: number[];
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
  userCouponIds?: number[];
  usedPoints?: number;
}

interface PreparePaymentResponse {
  orderId: string;
  orderNumber: string;
  clientKey: string;
  amount: number;
  goodsName: string;
  returnUrl: string;
  deletionToken: string;
}

function getCallbackUrl(): string {
  const baseCallbackUrl = `${getAbsoluteApiUrl()}/payment/callback`;
  if (IS_CAPACITOR) {
    return `${baseCallbackUrl}?appScheme=${CAPACITOR_APP_SCHEME}`;
  }
  return baseCallbackUrl;
}

export async function fetchMyCoupons(): Promise<CouponDto[]> {
  const token = localStorage.getItem('user_token');
  
  const response = await fetch(`${API_BASE_URL}/coupons/my`, {
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
  
  const response = await fetch(`${API_BASE_URL}/coupons/available`, {
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
  
  const response = await fetch(`${API_BASE_URL}/payment/prepare-direct`, {
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
  
  const response = await fetch(`${API_BASE_URL}/payment/prepare`, {
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

interface DeletePreparedOrderParams {
  orderId: string;
  method: 'card' | 'bank' | 'vbank';
  deletionToken: string;
  errorMsg: string;
  errorCode?: string;
  fullResult?: unknown;
}

export async function deletePreparedOrder(params: DeletePreparedOrderParams): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/payment/log-error`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId: params.orderId,
        method: params.method,
        errorCode: params.errorCode,
        errorMsg: params.errorMsg,
        fullResult: params.fullResult,
        deleteOrder: true,
        deletionToken: params.deletionToken,
      }),
    });

    if (!response.ok) {
      console.error('[Payment] Prepared order deletion failed with status:', response.status);
      return;
    }

    console.log('[Payment] Prepared order deletion requested');
  } catch (error) {
    console.error('[Payment] Failed to delete prepared order:', error);
  }
}

export async function getPaymentResult(orderId: string): Promise<{ success: boolean; order?: { orderNumber: string; status: string } }> {
  const token = localStorage.getItem('user_token');
  
  const response = await fetch(`${API_BASE_URL}/payment/order/${orderId}`, {
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
  orderPassword: string;
  recipientName: string;
  recipientPhone: string;
  postalCode: string;
  address: string;
  addressDetail?: string;
  deliveryRequest?: string;
  paymentMethod: 'card' | 'bank' | 'vbank';
  shippingFee: number;
}

export async function prepareGuestPayment(data: PrepareGuestPaymentRequest): Promise<PreparePaymentResponse> {
  const returnUrl = getCallbackUrl();
  
  const response = await fetch(`${API_BASE_URL}/payment/prepare-guest`, {
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
  ordererName: string;
  orderNumber: string;
  orderPassword: string;
}

export interface GuestOrderItem {
  productId: string;
  productName: string;
  productImageUrl?: string | null;
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
  postalCode: string;
  address: string;
  addressDetail: string | null;
  deliveryRequest: string | null;
  createdAt: string;
  paidAt: string | null;
  items: GuestOrderItem[];
  guestName: string;
  guestPhoneLast4: string;
  guestEmail: string | null;
  isClaimed: boolean;
}

export async function lookupGuestOrder(data: GuestOrderLookupRequest): Promise<{ order: GuestOrder }> {
  const response = await fetch(`${API_BASE_URL}/payment/guest/lookup`, {
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
  const response = await fetch(`${API_BASE_URL}/payment/guest/order/${orderId}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '주문 조회에 실패했습니다');
  }

  return response.json();
}
