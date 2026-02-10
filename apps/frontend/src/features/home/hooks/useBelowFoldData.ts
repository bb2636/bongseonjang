import { useQuery } from '@tanstack/react-query';
import { fetchBelowFoldData } from '../api/homeDataApi';
import type { BelowFoldData } from '../types/homeData';

const QUERY_KEY = ['homeBelowFoldData'];
const STALE_TIME = 5 * 60 * 1000;
const GC_TIME = 10 * 60 * 1000;

const emptyBelowFoldData: BelowFoldData = {
  middleBanners: [],
  freshProducts: [],
  mdPicks: [],
  weeklyProducts: [],
  badameunProducts: [],
  bongseonjangTv: [],
  bongcookProducts: [],
  bottomBanners: [],
};

export function useBelowFoldData(enabled: boolean = true) {
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: fetchBelowFoldData,
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
    refetchOnWindowFocus: false,
    enabled,
  });

  const belowFoldData = data?.data ?? emptyBelowFoldData;

  return {
    middleBanners: belowFoldData.middleBanners,
    freshProducts: belowFoldData.freshProducts,
    mdPicks: belowFoldData.mdPicks,
    weeklyProducts: belowFoldData.weeklyProducts,
    badameunProducts: belowFoldData.badameunProducts,
    bongseonjangTv: belowFoldData.bongseonjangTv,
    bongcookProducts: belowFoldData.bongcookProducts,
    bottomBanners: belowFoldData.bottomBanners,
    isLoading,
    error,
  };
}
