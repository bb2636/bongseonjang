import { useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function useBongseonStoryPage() {
  const navigate = useNavigate();

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  const handleBack = () => {
    navigate('/profile');
  };

  const handleCartClick = () => {
    navigate('/cart');
  };

  return {
    handleBack,
    handleCartClick,
  };
}
