import type { ProductDetail } from '../types/productDetail';

const API_BASE_URL = '/api';

export async function fetchProductDetail(productId: string): Promise<ProductDetail> {
  const response = await fetch(`${API_BASE_URL}/products/${productId}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch product detail');
  }
  
  return response.json();
}
