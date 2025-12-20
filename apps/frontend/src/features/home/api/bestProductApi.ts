import type { BestProduct } from '../types/bestProduct';
import { API_BASE_URL } from '../../../shared/config/apiConfig';

export async function fetchBestProducts(): Promise<BestProduct[]> {
  const response = await fetch(`${API_BASE_URL}/best-products`);

  if (!response.ok) {
    throw new Error('Failed to fetch best products');
  }

  return response.json();
}
