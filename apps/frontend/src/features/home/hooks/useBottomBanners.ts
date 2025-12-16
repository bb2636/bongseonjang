import { useQuery } from '@tanstack/react-query';
import { fetchBottomBanners } from '../api/bottomBannerApi';
import type { BottomBannerImage } from '../types/bottomBanner';

const QUERY_KEY = ['bottomBanners'];
const STALE_TIME = 5 * 60 * 1000;

export function useBottomBanners() {
  const { data, isLoading, error } = useQuery<BottomBannerImage[]>({
    queryKey: QUERY_KEY,
    queryFn: fetchBottomBanners,
    staleTime: STALE_TIME,
  });

  return {
    bottomBanners: data ?? [],
    isLoading,
    error,
  };
}
