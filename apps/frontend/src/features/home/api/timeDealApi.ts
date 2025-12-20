import type { TimeDeal } from '../types/timeDeal';
import { API_BASE_URL } from '../../../shared/config/apiConfig';

export async function fetchTimeDeals(): Promise<TimeDeal[]> {
  const response = await fetch(`${API_BASE_URL}/products/time-deals`);

  if (!response.ok) {
    throw new Error('Failed to fetch time deals');
  }

  return response.json();
}
