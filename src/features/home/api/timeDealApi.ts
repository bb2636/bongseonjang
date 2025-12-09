import type { TimeDeal } from '../types/timeDeal';

const API_BASE_URL = '/api/time-deals';

export async function fetchTimeDeals(): Promise<TimeDeal[]> {
  const response = await fetch(API_BASE_URL);

  if (!response.ok) {
    throw new Error('Failed to fetch time deals');
  }

  return response.json();
}
