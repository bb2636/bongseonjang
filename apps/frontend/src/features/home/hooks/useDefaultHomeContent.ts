import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHomeData } from './useHomeData';

export function useDefaultHomeContent() {
  const navigate = useNavigate();
  const {
    heroImages,
    timeDeals,
    bestProducts,
    middleBanners,
    freshProducts,
    mdPicks,
    badameunProducts,
    bongseonjangTv,
    bongcookProducts,
    bottomBanners,
    isLoading,
  } = useHomeData();

  const onSubCategoryClick = useCallback((categoryId: string) => {
    navigate(`/category/${categoryId}`);
  }, [navigate]);

  const onHeartClick = useCallback((productId: string) => {
    console.log('Toggle favorite:', productId);
  }, []);

  const onViewAllBestProducts = useCallback(() => {
    navigate('/best-products');
  }, [navigate]);

  const onViewAllFreshFoods = useCallback(() => {
    navigate('/fresh-foods');
  }, [navigate]);

  const onViewAllBadameun = useCallback(() => {
    navigate('/badameun');
  }, [navigate]);

  const onViewAllBongcook = useCallback(() => {
    navigate('/bongcook');
  }, [navigate]);

  return {
    heroImages,
    isHeroImagesLoading: isLoading,
    onSubCategoryClick,
    onHeartClick,
    timeDeals,
    isTimeDealsLoading: isLoading,
    bestProducts,
    isBestProductsLoading: isLoading,
    onViewAllBestProducts,
    middleBanners,
    isMiddleBannersLoading: isLoading,
    freshFoods: freshProducts,
    isFreshFoodsLoading: isLoading,
    onViewAllFreshFoods,
    mdPicks,
    isMdPicksLoading: isLoading,
    badameunProducts,
    isBadameunLoading: isLoading,
    onViewAllBadameun,
    bongseonjangTvImages: bongseonjangTv,
    isBongseonjangTvLoading: isLoading,
    bongcookProducts,
    isBongcookLoading: isLoading,
    onViewAllBongcook,
    bottomBanners,
    isBottomBannersLoading: isLoading,
  };
}

export type DefaultHomeContentState = ReturnType<typeof useDefaultHomeContent>;
