import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHeroImages } from './useHeroImages';
import { useTimeDeals } from './useTimeDeals';

type NavItem = 'home' | 'category' | 'search' | 'profile';
type CategoryTab = 'best' | 'new' | 'event' | 'all';

export function useHomePage() {
  const navigate = useNavigate();
  const { heroImages, isLoading: isHeroImagesLoading } = useHeroImages();
  const { timeDeals, isLoading: isTimeDealsLoading } = useTimeDeals();
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

  return {
    onCartClick,
    onNavItemClick,
    heroImages,
    isHeroImagesLoading,
    activeTab,
    onTabChange,
    onSubCategoryClick,
    onAddToCart,
    timeDeals,
    isTimeDealsLoading,
  };
}
