import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function useBongseonStoryPage() {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
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
