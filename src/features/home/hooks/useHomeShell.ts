import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { CategoryTab } from '../types/navigation';

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

  return {
    activeTab,
    onTabChange: handleTabChange,
    onLogoClick: handleLogoClick,
    onCartClick: handleCartClick,
  };
}

export type HomeShellState = ReturnType<typeof useHomeShell>;
