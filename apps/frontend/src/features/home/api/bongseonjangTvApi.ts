import type { BongseonjangTvImage } from '../types/bongseonjangTv';

const API_BASE_URL = '/api/bongseonjang-tv';

export async function fetchBongseonjangTvImages(): Promise<BongseonjangTvImage[]> {
  const response = await fetch(API_BASE_URL);
  
  if (!response.ok) {
    throw new Error('Failed to fetch bongseonjang tv images');
  }
  
  return response.json();
}
