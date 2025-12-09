import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHeroImages } from './useHeroImages';
import { useTimeDeals } from './useTimeDeals';
import { useBestProducts } from './useBestProducts';
import { useMiddleBanners } from './useMiddleBanners';
import { useFreshFoods } from './useFreshFoods';
import { useMdPicks } from './useMdPicks';
import type { NavItem, CategoryTab } from '../types/navigation';

export function useHomePage() {
  const navigate = useNavigate();
  const { heroImages, isLoading: isHeroImagesLoading } = useHeroImages();
  const { timeDeals, isLoading: isTimeDealsLoading } = useTimeDeals();
  const { bestProducts, isLoading: isBestProductsLoading } = useBestProducts();
  const { middleBanners, isLoading: isMiddleBannersLoading } = useMiddleBanners();
  const { freshFoods, isLoading: isFreshFoodsLoading } = useFreshFoods();
  const { mdPicks, isLoading: isMdPicksLoading } = useMdPicks();
  const [activeTab, setActiveTab] = useState<CategoryTab>('best');

  const onCartClick = useCallback(() => {
    navigate('/cart');
  }, [navigate]);

  const onNavItemClick = useCallback((item: NavItem) => {
    switch (item) {
      case 'home':
        navigate('/');
        break;
      case 'category':
        navigate('/category');
        break;
      case 'search':
        navigate('/search');
        break;
      case 'profile':
        navigate('/profile');
        break;
    }
  }, [navigate]);

  const onTabChange = useCallback((tab: CategoryTab) => {
    setActiveTab(tab);
  }, []);

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

  return {
    onCartClick,
    onNavItemClick,
    heroImages,
    isHeroImagesLoading,
    activeTab,
    onTabChange,
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
  };
}

export type HomePageState = ReturnType<typeof useHomePage>;
