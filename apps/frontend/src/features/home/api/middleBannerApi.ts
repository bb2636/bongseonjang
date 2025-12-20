import type { MiddleBannerImage } from '../types/middleBanner';
import { API_BASE_URL } from '../../../shared/config/apiConfig';

interface MiddleBannerResponse {
  data: MiddleBannerImage[];
}

export async function fetchMiddleBanners(): Promise<MiddleBannerImage[]> {
  const response = await fetch(`${API_BASE_URL}/middle-banners`);

  if (!response.ok) {
    throw new Error('Failed to fetch middle banners');
  }

  const result: MiddleBannerResponse = await response.json();
  return result.data ?? [];
}
