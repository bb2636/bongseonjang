import type { HomeDataResponse } from '../types/homeData';
import { API_BASE_URL } from '../../../shared/config/apiConfig';

export async function fetchHomeData(): Promise<HomeDataResponse> {
  const response = await fetch(`${API_BASE_URL}/home/data`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch home data');
  }
  
  return response.json();
}
