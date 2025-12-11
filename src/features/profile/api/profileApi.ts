import { UserProfile, Order } from '../types/profile';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function fetchUserProfile(): Promise<UserProfile> {
  const response = await fetch('/api/profile', {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    throw new Error('Failed to fetch user profile');
  }
  return response.json();
}

export async function fetchRecentOrders(): Promise<Order[]> {
  const response = await fetch('/api/profile/orders?limit=3', {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    throw new Error('Failed to fetch recent orders');
  }
  return response.json();
}

interface VerifyPasswordResponse {
  success: boolean;
  message?: string;
}

export async function verifyPassword(password: string): Promise<VerifyPasswordResponse> {
  const response = await fetch('/api/profile/verify-password', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ password }),
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    return { success: false, message: data.error || '비밀번호 확인에 실패했습니다' };
  }
  
  return { success: true };
}

export const profileApi = {
  fetchUserProfile,
  fetchRecentOrders,
  verifyPassword,
};
