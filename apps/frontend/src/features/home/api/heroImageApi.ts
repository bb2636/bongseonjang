import type { HeroImageResponse } from '../types/heroImage';
import { API_BASE_URL } from '../../../shared/config/apiConfig';

export async function fetchHeroImages(): Promise<HeroImageResponse> {
  const response = await fetch(`${API_BASE_URL}/home/hero-images`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch hero images');
  }
  
  return response.json();
}
