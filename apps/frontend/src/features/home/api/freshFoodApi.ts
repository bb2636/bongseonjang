import type { FreshFood } from '../types/freshFood';
import { API_BASE_URL } from '../../../shared/config/apiConfig';

export async function fetchFreshFoods(): Promise<FreshFood[]> {
  const response = await fetch(`${API_BASE_URL}/products/fresh`);

  if (!response.ok) {
    throw new Error('Failed to fetch fresh foods');
  }

  return response.json();
}
