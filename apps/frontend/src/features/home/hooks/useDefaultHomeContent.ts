import { useCallback, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAboveFoldData } from './useAboveFoldData';
import { useBelowFoldData } from './useBelowFoldData';

export function useDefaultHomeContent() {
  const navigate = useNavigate();
  const [shouldLoadBelowFold, setShouldLoadBelowFold] = useState(false);
  const triggerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShouldLoadBelowFold(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const {
    heroImages,
    timeDeals,
    bestProducts,
    isLoading: isAboveFoldLoading,
  } = useAboveFoldData();

  const {
    middleBanners,
    freshProducts,
    mdPicks,
    badameunProducts,
    bongseonjangTv,
    bongcookProducts,
    bottomBanners,
    isLoading: isBelowFoldLoading,
  } = useBelowFoldData(shouldLoadBelowFold);

  const onSubCategoryClick = useCallback((categoryId: string) => {
    navigate(`/category/${categoryId}`);
  }, [navigate]);

  const onHeartClick = useCallback((productId: string) => {
    console.log('Toggle favorite:', productId);
  }, []);

  const onViewAllBestProducts = useCallback(() => {
    navigate('/category/best');
  }, [navigate]);

  const onViewAllFreshFoods = useCallback(() => {
    navigate('/category/new');
  }, [navigate]);

  const onViewAllBadameun = useCallback(() => {
    navigate('/brand/badameun');
  }, [navigate]);

  const onViewAllBongcook = useCallback(() => {
    navigate('/brand/bongcook');
  }, [navigate]);

  return {
    heroImages,
    isHeroImagesLoading: isAboveFoldLoading,
    onSubCategoryClick,
    onHeartClick,
    timeDeals,
    isTimeDealsLoading: isAboveFoldLoading,
    bestProducts,
    isBestProductsLoading: isAboveFoldLoading,
    onViewAllBestProducts,
    middleBanners,
    isMiddleBannersLoading: isBelowFoldLoading || !shouldLoadBelowFold,
    freshFoods: freshProducts,
    isFreshFoodsLoading: isBelowFoldLoading || !shouldLoadBelowFold,
    onViewAllFreshFoods,
    mdPicks,
    isMdPicksLoading: isBelowFoldLoading || !shouldLoadBelowFold,
    badameunProducts,
    isBadameunLoading: isBelowFoldLoading || !shouldLoadBelowFold,
    onViewAllBadameun,
    bongseonjangTvImages: bongseonjangTv,
    isBongseonjangTvLoading: isBelowFoldLoading || !shouldLoadBelowFold,
    bongcookProducts,
    isBongcookLoading: isBelowFoldLoading || !shouldLoadBelowFold,
    onViewAllBongcook,
    bottomBanners,
    isBottomBannersLoading: isBelowFoldLoading || !shouldLoadBelowFold,
    triggerRef,
  };
}

export type DefaultHomeContentState = ReturnType<typeof useDefaultHomeContent>;
