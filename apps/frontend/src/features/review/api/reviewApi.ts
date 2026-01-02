import { API_BASE_URL } from '../../../shared/config/apiConfig';

export interface CheckReviewResponse {
  canReview: boolean;
  reason?: 'not_purchased' | 'already_reviewed';
}

export async function checkUserReview(productId: string): Promise<CheckReviewResponse> {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return { canReview: false, reason: 'not_purchased' };
  }
  
  const response = await fetch(`${API_BASE_URL}/reviews/check/${productId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to check user review');
  }

  return response.json();
}

export interface CreateReviewRequest {
  productId: string;
  rating: number;
  content: string;
  imageUrls?: string[];
  orderItemId?: string;
}

export interface ReviewDto {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  content: string;
  imageUrls: string[];
  createdAt: string;
}

export interface ReviewableOrderItemDto {
  orderItemId: string;
  productId: string;
  productName: string;
  optionName: string | null;
  productImageUrl: string | null;
  purchaseDate: string;
}

export async function createReview(request: CreateReviewRequest): Promise<ReviewDto> {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('Authentication required');
  }
  
  const response = await fetch(`${API_BASE_URL}/reviews`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error('Failed to create review');
  }

  return response.json();
}

export async function fetchPendingReviewItems(): Promise<ReviewableOrderItemDto[]> {
  const token = localStorage.getItem('token');

  if (!token) {
    return [];
  }

  const response = await fetch(`${API_BASE_URL}/reviews/pending`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to load pending review items');
  }

  return response.json();
}

export interface MyReviewDto {
  id: string;
  productId: string;
  productName: string;
  productImageUrl: string | null;
  rating: number;
  content: string;
  imageUrls: string[];
  createdAt: string;
}

export async function fetchMyReviews(): Promise<MyReviewDto[]> {
  const token = localStorage.getItem('token');

  if (!token) {
    return [];
  }

  const response = await fetch(`${API_BASE_URL}/reviews/my`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to load my reviews');
  }

  return response.json();
}

