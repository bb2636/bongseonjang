import type { HeroImageResponse } from '../types/heroImage';

const API_BASE_URL = '/api';

export async function fetchHeroImages(): Promise<HeroImageResponse> {
  const response = await fetch(`${API_BASE_URL}/home/hero-images`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch hero images');
  }
  
  return response.json();
}
