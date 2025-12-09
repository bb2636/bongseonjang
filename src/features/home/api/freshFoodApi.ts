import type { FreshFood } from '../types/freshFood';

const API_BASE_URL = '/api/fresh-foods';

export async function fetchFreshFoods(): Promise<FreshFood[]> {
  const response = await fetch(API_BASE_URL);

  if (!response.ok) {
    throw new Error('Failed to fetch fresh foods');
  }

  return response.json();
}
