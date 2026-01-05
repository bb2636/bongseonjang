import type { ProductDetail } from '../types/productDetail';
import { API_BASE_URL } from '../../../shared/config/apiConfig';

export interface RelatedProduct {
  id: string;
  name: string;
  imageUrl?: string;
  originalPrice: number;
  discountPercent: number;
  discountedPrice: number;
}

export async function fetchProductDetail(productId: string): Promise<ProductDetail> {
  const response = await fetch(`${API_BASE_URL}/products/${productId}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch product detail');
  }
  
  return response.json();
}

export async function fetchRelatedProducts(productId: string, limit: number = 4): Promise<RelatedProduct[]> {
  const response = await fetch(`${API_BASE_URL}/products/${productId}/related?limit=${limit}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch related products');
  }
  
  return response.json();
}

export interface ProductInquiryResponse {
  id: string;
  status: 'pending' | 'answered';
  categoryLabel: string;
  authorAlias: string;
  createdAt: string;
  title: string;
  question?: string;
  answer?: string;
  isPrivate?: boolean;
  isAuthor?: boolean;
  imageUrls?: string[];
}

export async function fetchProductInquiries(productId: string): Promise<ProductInquiryResponse[]> {
  const token = localStorage.getItem('user_token');
  const response = await fetch(`${API_BASE_URL}/products/${productId}/inquiries`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch product inquiries');
  }
  
  const data = await response.json();
  return data.inquiries;
}

export interface CreateProductInquiryPayload {
  inquiryType: 'product' | 'shipping' | 'exchange_return' | 'refund' | 'other';
  title: string;
  question: string;
  isPrivate: boolean;
  imageUrls?: string[];
}

export async function createProductInquiry(
  productId: string,
  payload: CreateProductInquiryPayload
): Promise<void> {
  const token = localStorage.getItem('user_token');
  const response = await fetch(`${API_BASE_URL}/products/${productId}/inquiries`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: '문의 등록에 실패했습니다.' }));
    throw new Error(error.error || '문의 등록에 실패했습니다.');
  }
}
