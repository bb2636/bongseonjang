import type { BottomBannerImage } from '../types/bottomBanner';

const API_BASE_URL = '/api/bottom-banners';

export async function fetchBottomBanners(): Promise<BottomBannerImage[]> {
  const response = await fetch(API_BASE_URL);

  if (!response.ok) {
    throw new Error('Failed to fetch bottom banners');
  }

  return response.json();
}
