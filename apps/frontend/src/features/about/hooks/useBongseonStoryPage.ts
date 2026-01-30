import { useLayoutEffect, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function useBongseonStoryPage() {
  const navigate = useNavigate();

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  useEffect(() => {
    const originalHtmlOverflow = document.documentElement.style.overflow;
    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlPosition = document.documentElement.style.position;
    const originalBodyPosition = document.body.style.position;
    
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    document.documentElement.style.position = 'fixed';
    document.body.style.position = 'fixed';
    document.documentElement.style.width = '100%';
    document.body.style.width = '100%';
    document.documentElement.style.height = '100%';
    document.body.style.height = '100%';

    return () => {
      document.documentElement.style.overflow = originalHtmlOverflow;
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.position = originalHtmlPosition;
      document.body.style.position = originalBodyPosition;
      document.documentElement.style.width = '';
      document.body.style.width = '';
      document.documentElement.style.height = '';
      document.body.style.height = '';
    };
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
