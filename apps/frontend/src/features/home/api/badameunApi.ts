import type { BadameunProduct } from '../types/badameun';
import { API_BASE_URL } from '../../../shared/config/apiConfig';

export async function fetchBadameunProducts(): Promise<BadameunProduct[]> {
  const response = await fetch(`${API_BASE_URL}/products/tag/badameun`);
  if (!response.ok) {
    throw new Error('Failed to fetch badameun products');
  }
  return response.json();
}
