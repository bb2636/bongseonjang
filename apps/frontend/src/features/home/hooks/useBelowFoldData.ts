import { useQuery } from '@tanstack/react-query';
import { fetchBelowFoldData } from '../api/homeDataApi';
import type { BelowFoldData } from '../types/homeData';

const QUERY_KEY = ['homeBelowFoldData'];
const STALE_TIME = 1 * 60 * 1000;

const emptyBelowFoldData: BelowFoldData = {
  middleBanners: [],
  freshProducts: [],
  mdPicks: [],
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
    enabled,
  });

  const belowFoldData = data?.data ?? emptyBelowFoldData;

  return {
    middleBanners: belowFoldData.middleBanners,
    freshProducts: belowFoldData.freshProducts,
    mdPicks: belowFoldData.mdPicks,
    badameunProducts: belowFoldData.badameunProducts,
    bongseonjangTv: belowFoldData.bongseonjangTv,
    bongcookProducts: belowFoldData.bongcookProducts,
    bottomBanners: belowFoldData.bottomBanners,
    isLoading,
    error,
  };
}
