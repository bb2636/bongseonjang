import type { BadameunProduct } from '../types/badameun';

const API_BASE_URL = '/api/products/tag/badameun';

export async function fetchBadameunProducts(): Promise<BadameunProduct[]> {
  const response = await fetch(API_BASE_URL);
  if (!response.ok) {
    throw new Error('Failed to fetch badameun products');
  }
  return response.json();
}
