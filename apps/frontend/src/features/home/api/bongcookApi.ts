import type { BongcookProduct } from '../types/bongcook';
import { API_BASE_URL } from '../../../shared/config/apiConfig';

export async function fetchBongcookProducts(): Promise<BongcookProduct[]> {
  const response = await fetch(`${API_BASE_URL}/products/tag/bongcook`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch bongcook products');
  }
  
  return response.json();
}
