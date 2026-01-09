import { useQuery } from '@tanstack/react-query';
import { fetchAboveFoldData } from '../api/homeDataApi';
import type { AboveFoldData } from '../types/homeData';

const QUERY_KEY = ['homeAboveFoldData'];
const STALE_TIME = 5 * 60 * 1000;
const GC_TIME = 10 * 60 * 1000;

const emptyAboveFoldData: AboveFoldData = {
  heroImages: [],
  timeDeals: [],
  bestProducts: [],
};

export function useAboveFoldData() {
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: fetchAboveFoldData,
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
    refetchOnWindowFocus: false,
  });

  const aboveFoldData = data?.data ?? emptyAboveFoldData;

  return {
    heroImages: aboveFoldData.heroImages,
    timeDeals: aboveFoldData.timeDeals,
    bestProducts: aboveFoldData.bestProducts,
    isLoading,
    error,
  };
}
