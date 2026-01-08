import { API_BASE_URL } from '../../../shared/config/apiConfig';

export interface MypageBannerImage {
  id: number;
  imageUrl: string;
  linkUrl?: string;
}

export interface MypageBannerResponse {
  data: MypageBannerImage[];
}

export async function fetchMypageBanners(): Promise<MypageBannerResponse> {
  const response = await fetch(`${API_BASE_URL}/mypage-banners`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch mypage banners');
  }
  
  return response.json();
}
