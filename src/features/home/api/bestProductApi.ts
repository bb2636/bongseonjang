import type { BestProduct } from '../types/bestProduct';

const API_BASE_URL = '/api/best-products';

export async function fetchBestProducts(): Promise<BestProduct[]> {
  const response = await fetch(API_BASE_URL);

  if (!response.ok) {
    throw new Error('Failed to fetch best products');
  }

  return response.json();
}
