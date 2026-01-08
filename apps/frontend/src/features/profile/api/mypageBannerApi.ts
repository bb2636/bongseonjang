import { API_BASE_URL } from '../../../shared/config/apiConfig';

export interface MypageBanner {
  id: number;
  imageUrl: string;
  linkUrl: string | null;
}

export async function fetchMypageBanners(): Promise<MypageBanner[]> {
  const response = await fetch(`${API_BASE_URL}/mypage-banners`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch mypage banners');
  }
  
  const data = await response.json();
  return data.data || [];
}
