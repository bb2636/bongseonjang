import type { ProductDetail } from '../types/productDetail';

const API_BASE_URL = '/api';

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
  answer?: string;
  isPrivate?: boolean;
}

export async function fetchProductInquiries(productId: string): Promise<ProductInquiryResponse[]> {
  const response = await fetch(`${API_BASE_URL}/products/${productId}/inquiries`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch product inquiries');
  }
  
  const data = await response.json();
  return data.inquiries;
}
