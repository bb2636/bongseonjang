import { useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function useBongseonStoryPage() {
  const navigate = useNavigate();

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  const handleBack = () => {
    navigate('/profile');
  };

  const handleCartClick = () => {
    navigate('/cart');
  };

  const handleHeroAction = () => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  return {
    handleBack,
    handleCartClick,
    handleHeroAction,
  };
}
