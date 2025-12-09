import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

type NavItem = 'home' | 'category' | 'search' | 'profile';

export function useHomePage() {
  const navigate = useNavigate();

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

  return {
    onCartClick,
    onNavItemClick,
  };
}
