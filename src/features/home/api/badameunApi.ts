import type { BadameunProduct } from '../types/badameun';

const API_BASE_URL = '/api/badameun';

export async function fetchBadameunProducts(): Promise<BadameunProduct[]> {
  const response = await fetch(`${API_BASE_URL}/badameun-products`);
  if (!response.ok) {
    throw new Error('Failed to fetch badameun products');
  }
  return response.json();
}
