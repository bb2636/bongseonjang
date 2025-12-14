const API_BASE_URL = '/api/address';

export interface DefaultAddressResponse {
  id: string;
  addressName: string;
  recipientName: string;
  recipientPhone: string;
  postalCode: string;
  address: string;
  addressDetail: string;
  isDefault: boolean;
}

export async function fetchDefaultAddress(): Promise<DefaultAddressResponse | null> {
  const token = localStorage.getItem('accessToken');
  
  if (!token) {
    return null;
  }

  const response = await fetch(`${API_BASE_URL}/default`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error('Failed to fetch default address');
  }

  return response.json();
}
