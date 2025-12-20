import type { BongseonjangTvImage } from '../types/bongseonjangTv';
import { API_BASE_URL } from '../../../shared/config/apiConfig';

export async function fetchBongseonjangTvImages(): Promise<BongseonjangTvImage[]> {
  const response = await fetch(`${API_BASE_URL}/bongseonjang-tv`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch bongseonjang tv images');
  }
  
  return response.json();
}
