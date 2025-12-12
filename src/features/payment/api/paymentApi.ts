interface PreparePaymentRequest {
  selectedItemIds: string[];
  recipientName: string;
  recipientPhone: string;
  postalCode: string;
  address: string;
  addressDetail?: string;
  deliveryRequest?: string;
}

interface PreparePaymentResponse {
  orderId: string;
  orderNumber: string;
  clientKey: string;
  amount: number;
  goodsName: string;
  returnUrl: string;
}

export async function preparePayment(data: PreparePaymentRequest): Promise<PreparePaymentResponse> {
  const token = localStorage.getItem('token');
  
  const response = await fetch('/api/payment/prepare', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '결제 준비에 실패했습니다');
  }

  return response.json();
}
