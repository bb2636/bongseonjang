import { UserProfile, Order } from '../types/profile';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('user_token');
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

export async function fetchRecentOrders(onlyInProgress: boolean = false): Promise<Order[]> {
  const params = new URLSearchParams();
  params.set('limit', '1');
  if (onlyInProgress) {
    params.set('status', 'in_progress');
  }
  
  const response = await fetch(`/api/profile/orders?${params.toString()}`, {
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

interface UpdateProfileData {
  name: string;
  phone?: string;
  birthDate?: string | null;
  gender?: string | null;
  isMarketingEmail?: boolean;
  isMarketingSms?: boolean;
  newPassword?: string;
}

interface UpdateProfileResponse {
  success: boolean;
  message?: string;
}

export async function updateProfile(data: UpdateProfileData): Promise<UpdateProfileResponse> {
  const response = await fetch('/api/profile', {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  
  const result = await response.json();
  
  if (!response.ok) {
    return { success: false, message: result.error || '프로필 수정에 실패했습니다' };
  }
  
  return { success: true };
}

export const profileApi = {
  fetchUserProfile,
  fetchRecentOrders,
  verifyPassword,
  updateProfile,
};
