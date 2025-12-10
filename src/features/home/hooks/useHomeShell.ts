import { useCallback, useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import type { CategoryTab } from '../types/navigation';

const CATEGORY_TO_TAB_MAP: Record<string, CategoryTab> = {
  'all': 'all',
  'new': 'new',
  'best': 'best',
  'event': 'event',
  'seasonal': 'all',
  'frozen': 'all',
  'prepared': 'all',
  'pickled': 'all',
};

export function useHomeShell() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');
  
  const [activeTab, setActiveTab] = useState<CategoryTab>('default');

  useEffect(() => {
    if (categoryParam) {
      const mappedTab = CATEGORY_TO_TAB_MAP[categoryParam] || 'default';
      setActiveTab(mappedTab);
      setSearchParams({}, { replace: true });
    }
  }, [categoryParam, setSearchParams]);

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
