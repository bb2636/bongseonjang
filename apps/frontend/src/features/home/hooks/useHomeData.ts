import { useQuery } from '@tanstack/react-query';
import { fetchHomeData } from '../api/homeDataApi';
import type { HomeData } from '../types/homeData';

const QUERY_KEY = ['homeData'];
const STALE_TIME = 1 * 60 * 1000;

const emptyHomeData: HomeData = {
  heroImages: [],
  timeDeals: [],
  bestProducts: [],
  middleBanners: [],
  freshProducts: [],
  mdPicks: [],
  badameunProducts: [],
  bongseonjangTv: [],
  bongcookProducts: [],
  bottomBanners: [],
};

export function useHomeData() {
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: fetchHomeData,
    staleTime: STALE_TIME,
  });

  const homeData = data?.data ?? emptyHomeData;

  return {
    heroImages: homeData.heroImages,
    timeDeals: homeData.timeDeals,
    bestProducts: homeData.bestProducts,
    middleBanners: homeData.middleBanners,
    freshProducts: homeData.freshProducts,
    mdPicks: homeData.mdPicks,
    badameunProducts: homeData.badameunProducts,
    bongseonjangTv: homeData.bongseonjangTv,
    bongcookProducts: homeData.bongcookProducts,
    bottomBanners: homeData.bottomBanners,
    isLoading,
    error,
  };
}
