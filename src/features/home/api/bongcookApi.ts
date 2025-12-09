import type { BongcookProduct } from '../types/bongcook';

const API_BASE_URL = '/api/bongcook';

export async function fetchBongcookProducts(): Promise<BongcookProduct[]> {
  const response = await fetch(API_BASE_URL);
  
  if (!response.ok) {
    throw new Error('Failed to fetch bongcook products');
  }
  
  return response.json();
}
