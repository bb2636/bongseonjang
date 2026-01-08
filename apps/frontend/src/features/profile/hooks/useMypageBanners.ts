import { useQuery } from '@tanstack/react-query';
import { fetchMypageBanners, MypageBannerImage } from '../api/mypageBannerApi';

const STALE_TIME = 5 * 60 * 1000;

export function useMypageBanners() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['mypageBanners'],
    queryFn: fetchMypageBanners,
    staleTime: STALE_TIME,
  });

  const banners: MypageBannerImage[] = data?.data ?? [];

  return {
    banners,
    isLoading,
    error,
  };
}
