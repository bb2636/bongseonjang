import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHeroImages } from './useHeroImages';
import { useTimeDeals } from './useTimeDeals';
import { useBestProducts } from './useBestProducts';
import { useMiddleBanners } from './useMiddleBanners';
import { useFreshFoods } from './useFreshFoods';
import { useMdPicks } from './useMdPicks';
import { useBadameunProducts } from './useBadameunProducts';
import { useBongseonjangTvImages } from './useBongseonjangTvImages';
import { useBongcookProducts } from './useBongcookProducts';
import { useBottomBanners } from './useBottomBanners';

export function useDefaultHomeContent() {
  const navigate = useNavigate();
  const { heroImages, isLoading: isHeroImagesLoading } = useHeroImages();
  const { timeDeals, isLoading: isTimeDealsLoading } = useTimeDeals();
  const { bestProducts, isLoading: isBestProductsLoading } = useBestProducts();
  const { middleBanners, isLoading: isMiddleBannersLoading } = useMiddleBanners();
  const { freshFoods, isLoading: isFreshFoodsLoading } = useFreshFoods();
  const { mdPicks, isLoading: isMdPicksLoading } = useMdPicks();
  const { badameunProducts, isLoading: isBadameunLoading } = useBadameunProducts();
  const { tvImages: bongseonjangTvImages, isLoading: isBongseonjangTvLoading } = useBongseonjangTvImages();
  const { bongcookProducts, isLoading: isBongcookLoading } = useBongcookProducts();
  const { bottomBanners, isLoading: isBottomBannersLoading } = useBottomBanners();

  const onSubCategoryClick = useCallback((categoryId: string) => {
    navigate(`/category/${categoryId}`);
  }, [navigate]);

  const onAddToCart = useCallback((productId: string) => {
    console.log('Add to cart:', productId);
  }, []);

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
    isHeroImagesLoading,
    onSubCategoryClick,
    onAddToCart,
    onHeartClick,
    timeDeals,
    isTimeDealsLoading,
    bestProducts,
    isBestProductsLoading,
    onViewAllBestProducts,
    middleBanners,
    isMiddleBannersLoading,
    freshFoods,
    isFreshFoodsLoading,
    onViewAllFreshFoods,
    mdPicks,
    isMdPicksLoading,
    badameunProducts,
    isBadameunLoading,
    onViewAllBadameun,
    bongseonjangTvImages,
    isBongseonjangTvLoading,
    bongcookProducts,
    isBongcookLoading,
    onViewAllBongcook,
    bottomBanners,
    isBottomBannersLoading,
  };
}

export type DefaultHomeContentState = ReturnType<typeof useDefaultHomeContent>;
