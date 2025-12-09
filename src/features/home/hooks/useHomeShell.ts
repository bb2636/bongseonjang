import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { NavItem, CategoryTab } from '../types/navigation';

export function useHomeShell() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<CategoryTab>('default');

  const handleTabChange = useCallback((tab: CategoryTab) => {
    setActiveTab(tab);
  }, []);

  const handleLogoClick = useCallback(() => {
    setActiveTab('default');
  }, []);

  const handleCartClick = useCallback(() => {
    navigate('/cart');
  }, [navigate]);

  const handleNavItemClick = useCallback((item: NavItem) => {
    switch (item) {
      case 'home':
        setActiveTab('default');
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

  return {
    activeTab,
    onTabChange: handleTabChange,
    onLogoClick: handleLogoClick,
    onCartClick: handleCartClick,
    onNavItemClick: handleNavItemClick,
  };
}

export type HomeShellState = ReturnType<typeof useHomeShell>;
