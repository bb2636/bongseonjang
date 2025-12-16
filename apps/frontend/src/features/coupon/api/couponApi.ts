import { CouponListResponse } from '../types/coupon';

const API_BASE = '/api/coupons';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export const couponApi = {
  async getCoupons(): Promise<CouponListResponse> {
    const response = await fetch(API_BASE, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('쿠폰 목록을 불러오는데 실패했습니다');
    }

    return response.json();
  },

  async issueCoupon(couponId: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_BASE}/${couponId}/issue`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || '쿠폰 발급에 실패했습니다');
    }

    return response.json();
  },

  async getMyCoupons(): Promise<CouponListResponse> {
    const response = await fetch(`${API_BASE}/my`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('보유 쿠폰 목록을 불러오는데 실패했습니다');
    }

    return response.json();
  },
};
