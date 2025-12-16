import type { MiddleBannerImage } from '../types/middleBanner';

const API_BASE_URL = '/api/middle-banners';

interface MiddleBannerResponse {
  data: MiddleBannerImage[];
}

export async function fetchMiddleBanners(): Promise<MiddleBannerImage[]> {
  const response = await fetch(API_BASE_URL);

  if (!response.ok) {
    throw new Error('Failed to fetch middle banners');
  }

  const result: MiddleBannerResponse = await response.json();
  return result.data ?? [];
}
