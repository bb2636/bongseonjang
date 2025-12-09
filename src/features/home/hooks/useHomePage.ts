import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHeroImages } from './useHeroImages';

type NavItem = 'home' | 'category' | 'search' | 'profile';
type CategoryTab = 'best' | 'new' | 'event' | 'all';

export function useHomePage() {
  const navigate = useNavigate();
  const { heroImages, isLoading: isHeroImagesLoading } = useHeroImages();
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

  return {
    onCartClick,
    onNavItemClick,
    heroImages,
    isHeroImagesLoading,
    activeTab,
    onTabChange,
    onSubCategoryClick,
  };
}
