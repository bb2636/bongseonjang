interface PreparePaymentRequest {
  selectedItemIds: string[];
  recipientName: string;
  recipientPhone: string;
  postalCode: string;
  address: string;
  addressDetail?: string;
  deliveryRequest?: string;
  paymentMethod: 'card' | 'bank' | 'vbank';
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

export async function prepareDirectPayment(data: PrepareDirectPaymentRequest): Promise<PreparePaymentResponse> {
  const token = localStorage.getItem('token');
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
  const token = localStorage.getItem('token');
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
  const token = localStorage.getItem('token');
  
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
