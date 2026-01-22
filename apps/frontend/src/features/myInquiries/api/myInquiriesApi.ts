import type { MyInquiriesResponse, InquiryType, SortOrder } from '../types/myInquiry';
import { API_BASE_URL } from '@/shared/config/apiConfig';

interface FetchMyInquiriesParams {
  page?: number;
  limit?: number;
  type?: InquiryType;
  sort?: SortOrder;
}

export async function fetchMyInquiries(params: FetchMyInquiriesParams = {}): Promise<MyInquiriesResponse> {
  const { page = 1, limit = 20, type = 'all', sort = 'latest' } = params;

  const queryParams = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    sort,
  });

  if (type !== 'all') {
    queryParams.set('type', type);
  }

  const token = localStorage.getItem('user_token');
  const response = await fetch(`${API_BASE_URL}/users/me/inquiries?${queryParams.toString()}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch inquiries');
  }

  return response.json();
}
