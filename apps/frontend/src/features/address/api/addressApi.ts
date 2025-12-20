import { API_BASE_URL } from '../../../shared/config/apiConfig';

const ADDRESS_API_URL = `${API_BASE_URL}/address`;

export interface AddressResponse {
  id: string;
  addressName: string;
  recipientName: string;
  recipientPhone: string;
  postalCode: string;
  address: string;
  addressDetail: string;
  isDefault: boolean;
}

export type DefaultAddressResponse = AddressResponse;

export async function fetchAddresses(): Promise<AddressResponse[]> {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return [];
  }

  const response = await fetch(`${ADDRESS_API_URL}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch addresses');
  }

  return response.json();
}

export async function fetchDefaultAddress(): Promise<DefaultAddressResponse | null> {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return null;
  }

  const response = await fetch(`${ADDRESS_API_URL}/default`, {
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
