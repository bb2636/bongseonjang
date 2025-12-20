import type { BottomBannerImage } from '../types/bottomBanner';
import { API_BASE_URL } from '../../../shared/config/apiConfig';

interface BottomBannerResponse {
  data: BottomBannerImage[];
}

export async function fetchBottomBanners(): Promise<BottomBannerImage[]> {
  const response = await fetch(`${API_BASE_URL}/bottom-banners`);

  if (!response.ok) {
    throw new Error('Failed to fetch bottom banners');
  }

  const result: BottomBannerResponse = await response.json();
  return result.data ?? [];
}
