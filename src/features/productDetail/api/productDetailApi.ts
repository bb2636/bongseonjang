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
